import { useEffect, useRef, useState } from 'react'
import { submissionSettings, type SubmissionKind } from '../../data/submissions'
import { site } from '../../data/site'
import { Turnstile } from './Turnstile'
import './submissions.css'

type Availability = { siteKey: string; enabled: Record<SubmissionKind, boolean> }
const definitiveErrors: Record<string, string> = {
  INVALID_BODY: 'As respostas ultrapassaram o tamanho total permitido. Reduza os textos mais longos e tente novamente.',
  INVALID_DATA: 'Revise suas respostas. Há campos inválidos ou acima do tamanho permitido.',
  CLOSED: 'O recebimento de respostas deste formulário está encerrado.',
  EDITION_CHANGED: 'A edição deste processo mudou. Atualize a página antes de iniciar uma nova inscrição.',
  CHALLENGE_FAILED: 'Refaça a verificação de segurança e tente novamente.',
  ORIGIN_NOT_ALLOWED: 'O envio não está disponível neste endereço do site.',
}

/** Reutilizável pela futura página da loja com kind="store" e os dados de storeSchema. */
export function SubmissionPanel({ kind, data, onLockChange }: {
  kind: SubmissionKind; data: unknown; onLockChange: (locked: boolean) => void
}) {
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(true)
  const [check, setCheck] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [token, setToken] = useState('')
  const [challengeError, setChallengeError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const attempt = useRef<{ id: string; body: object } | null>(null)
  const sending = useRef(false)
  const uncertain = useRef(false)
  const status = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10_000)
    let mounted = true
    setLoading(true)
    fetch('/api/forms', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('unavailable')
        const config = await response.json() as Availability
        if (typeof config.siteKey !== 'string' || typeof config.enabled?.[kind] !== 'boolean') throw new Error('unavailable')
        if (mounted) setAvailability(config)
      }).catch(() => { if (mounted) setAvailability(null) })
      .finally(() => { clearTimeout(timeout); if (mounted) setLoading(false) })
    return () => { mounted = false; clearTimeout(timeout); controller.abort() }
  }, [kind, check])

  useEffect(() => { if (receipt || error) status.current?.focus({ preventScroll: true }) }, [receipt, error])

  async function submit() {
    if (sending.current || !accepted || !token || !availability?.enabled[kind] || receipt) return
    sending.current = true
    setBusy(true)
    setError('')
    onLockChange(true)
    if (!attempt.current) {
      const config = submissionSettings[kind]
      attempt.current = {
        id: crypto.randomUUID(),
        body: { kind, data, privacyAcknowledged: true, privacyVersion: submissionSettings.privacyVersion,
          ...('edition' in config ? { edition: config.edition, processId: config.processId } : {}) },
      }
    }
    const pending = attempt.current
    try {
      const body = JSON.stringify({ ...pending.body, submissionId: pending.id, turnstileToken: token })
      if (new TextEncoder().encode(body).length > 48 * 1024 && !uncertain.current) {
        setError(definitiveErrors.INVALID_BODY)
        attempt.current = null
        onLockChange(false)
        return
      }
      const response = await fetch('/api/forms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(40_000),
      })
      const result = await response.json() as { ok?: boolean; submissionId?: string; receivedAt?: string; code?: string }
      if (response.ok && result.ok === true && result.submissionId === pending.id &&
          typeof result.receivedAt === 'string' && Number.isFinite(Date.parse(result.receivedAt))) {
        setReceipt(result.submissionId)
        return
      }
      const message = result.code && definitiveErrors[result.code]
      if (message && !uncertain.current) {
        setError(message)
        attempt.current = null
        onLockChange(false)
      } else {
        uncertain.current = true
        setError('Não foi possível confirmar o recebimento. Mantenha esta página aberta e tente novamente: repetiremos o mesmo envio, sem criar outro protocolo. Se persistir, entre em contato informando o protocolo abaixo.')
      }
    } catch {
      uncertain.current = true
      setError('A conexão foi interrompida antes da confirmação. Mantenha esta página aberta e tente novamente com o mesmo protocolo. Suas respostas continuam aqui.')
    } finally {
      sending.current = false
      setBusy(false)
      setToken('')
      setRefresh((value) => value + 1)
    }
  }

  if (receipt) return <div className="submission-panel" ref={status} tabIndex={-1} role="status">
    <h3>{kind === 'store' ? 'Solicitação recebida!' : 'Inscrição recebida!'}</h3>
    <p>{kind === 'store' ? 'Seu interesse foi registrado. A equipe poderá entrar em contato. Este registro não confirma uma compra nem reserva um produto.' : 'Suas respostas foram registradas. A equipe poderá entrar em contato pelos dados informados.'}</p>
    <p>Protocolo: <strong className="submission-protocol">{receipt}</strong></p>
  </div>

  if (loading) return <p role="status">Verificando disponibilidade do envio…</p>
  if (!availability?.enabled[kind]) return <div className="submission-panel">
    <p role="status">O envio ainda não está disponível para este formulário. Nenhuma resposta foi enviada.</p>
    <button type="button" className="text-link" onClick={() => setCheck((value) => value + 1)}>Verificar novamente</button>
  </div>

  return <div className="submission-panel" aria-busy={busy}>
    <h3>Antes de enviar</h3>
    <p>Usaremos suas respostas para {kind === 'store' ? 'gerenciar seu interesse nos produtos e entrar em contato' : 'avaliar sua candidatura e entrar em contato sobre este processo'}. Elas serão armazenadas em planilhas privadas do Google, acessíveis às pessoas autorizadas da Azure Bears. O envio utiliza Google e Cloudflare.</p>
    <p>Para informações sobre o uso dos dados ou solicitar acesso, correção ou exclusão, escreva para <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
    <label className="submission-ack"><input type="checkbox" checked={accepted} disabled={busy || uncertain.current} onChange={(event) => setAccepted(event.target.checked)} />Li o aviso acima e estou ciente da finalidade do envio das minhas respostas.</label>
    {accepted && <Turnstile siteKey={availability.siteKey} action={kind} refresh={refresh}
      onToken={(value) => { setToken(value); if (value) setChallengeError(false) }} onError={() => setChallengeError(true)} />}
    {challengeError && <p role="alert">Não foi possível carregar a verificação de segurança. <button type="button" className="text-link" disabled={busy} onClick={() => { setChallengeError(false); setRefresh((value) => value + 1) }}>Tentar novamente</button></p>}
    {error && <div ref={status} tabIndex={-1} role="alert" className="recruit-error-summary"><p>{error}</p>{attempt.current && <p>Protocolo: <span className="submission-protocol">{attempt.current.id}</span></p>}</div>}
    <button type="button" className="button button-white" disabled={busy || !accepted || !token} onClick={() => void submit()}>
      {busy ? 'Enviando…' : uncertain.current ? 'Tentar confirmar envio' : kind === 'store' ? 'Enviar solicitação' : 'Enviar inscrição'}
    </button>
    {!token && accepted && !challengeError && <p role="status">Aguarde a verificação de segurança para enviar.</p>}
  </div>
}
