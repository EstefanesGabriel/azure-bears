import { submissionSettings, type SubmissionKind } from '../src/data/submissions.ts'
import { validateSubmission } from '../src/features/submissions/schema.ts'

export interface SubmissionEnv {
  SUBMISSIONS_ENABLED?: string
  SITE_ORIGIN?: string
  TURNSTILE_SITE_KEY?: string
  TURNSTILE_SECRET_KEY?: string
  APPS_SCRIPT_URL?: string
  APPS_SCRIPT_SECRET?: string
}
const maxBytes = 48 * 1024
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
})
const fail = (code: string, status: number) => json({ ok: false, code }, status)
function ready(env: SubmissionEnv) {
  return env.SUBMISSIONS_ENABLED === 'true' && !!env.SITE_ORIGIN && !!env.TURNSTILE_SITE_KEY &&
    !!env.TURNSTILE_SECRET_KEY && (env.APPS_SCRIPT_SECRET?.length ?? 0) >= 32 &&
    /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(env.APPS_SCRIPT_URL ?? '')
}
function isOpen(kind: SubmissionKind) {
  const config = submissionSettings[kind]
  return config.enabled && (kind === 'store' ||
    ('edition' in config && !!config.edition.trim() && !!config.processId.trim()))
}
async function readBody(request: Request) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new Error('size')
  if (!request.body) throw new Error('body')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.length
      if (length > maxBytes) { await reader.cancel(); throw new Error('size') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}
export async function signPayload(payload: string, timestamp: number, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function handleSubmissions(request: Request, env: SubmissionEnv, send: typeof fetch = fetch): Promise<Response> {
  if (!['GET', 'POST'].includes(request.method)) return fail('METHOD_NOT_ALLOWED', 405)
  if (!ready(env)) return fail('UNAVAILABLE', 503)
  const url = new URL(request.url)
  if (url.origin !== env.SITE_ORIGIN) return fail('ORIGIN_NOT_ALLOWED', 403)
  if (request.method === 'GET') return json({
    ok: true, siteKey: env.TURNSTILE_SITE_KEY,
    enabled: { competitive: isOpen('competitive'), directorate: isOpen('directorate'), store: isOpen('store') },
  })
  if (request.headers.get('origin') !== env.SITE_ORIGIN) return fail('ORIGIN_NOT_ALLOWED', 403)
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return fail('INVALID_CONTENT_TYPE', 415)
  let input: unknown
  try { input = await readBody(request) } catch { return fail('INVALID_BODY', 400) }
  const submission = validateSubmission(input)
  if (!submission) return fail('INVALID_DATA', 422)
  if (!isOpen(submission.kind)) return fail('CLOSED', 409)
  if (submission.kind !== 'store') {
    const config = submissionSettings[submission.kind]
    if (submission.edition !== config.edition || submission.processId !== config.processId) return fail('EDITION_CHANGED', 409)
  }
  try {
    const verification = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: submission.turnstileToken }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!verification.ok) return fail('UNAVAILABLE', 503)
    const challenge = await verification.json() as { success?: boolean; hostname?: string; action?: string }
    if (challenge.success !== true || challenge.hostname !== url.hostname || challenge.action !== submission.kind) return fail('CHALLENGE_FAILED', 403)
    const { turnstileToken: _token, ...data } = submission
    const payload = JSON.stringify({ ...data, schemaVersion: 1 })
    const timestamp = Date.now()
    const signature = await signPayload(payload, timestamp, env.APPS_SCRIPT_SECRET!)
    const result = await send(env.APPS_SCRIPT_URL!, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, timestamp, signature }), redirect: 'follow', signal: AbortSignal.timeout(25_000),
    })
    if (!result.ok) return fail('UNAVAILABLE', 503)
    const receipt = await result.json() as { ok?: boolean; submissionId?: string; receivedAt?: string; code?: string }
    if (receipt.ok !== true || receipt.submissionId !== submission.submissionId ||
      typeof receipt.receivedAt !== 'string' || !Number.isFinite(Date.parse(receipt.receivedAt))) {
      return fail(receipt.code === 'ID_CONFLICT' ? 'ID_CONFLICT' : 'UNAVAILABLE', receipt.code === 'ID_CONFLICT' ? 409 : 503)
    }
    return json({ ok: true, submissionId: receipt.submissionId, receivedAt: receipt.receivedAt })
  } catch {
    // Never log submitted answers, tokens, upstream bodies or secrets.
    return fail('UNAVAILABLE', 503)
  }
}
