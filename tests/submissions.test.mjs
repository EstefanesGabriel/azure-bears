import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { handleSubmissions, signPayload } from '../server/submissions.ts'
import { submissionSettings } from '../src/data/submissions.ts'
import { validateSubmission } from '../src/features/submissions/schema.ts'
import { products } from '../src/data/home.ts'
import { storeSettings, visibleProducts } from '../src/data/store.ts'
import { validReceipt, RECEIPT_MAX_BYTES, readReceipt } from '../src/features/submissions/receipt.ts'
import { activeSteps, emptyValues, questionsFor } from '../src/features/recruitment/form.ts'
import { games } from '../src/features/recruitment/config.ts'

const secret = 'test-only-secret-never-deploy-1234567890'
const env = { SUBMISSIONS_ENABLED: 'true', SITE_ORIGIN: 'https://azure.example', TURNSTILE_SITE_KEY: 'public-test-key', TURNSTILE_SECRET_KEY: 'private-test-key', APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec', APPS_SCRIPT_SECRET: secret }
const request = (body, options = {}) => new Request('https://azure.example/api/forms', {
  method: 'POST', headers: { origin: env.SITE_ORIGIN, 'content-type': 'application/json' }, body: JSON.stringify(body), ...options,
})
const testReceipt = () => ({ name: 'teste.pdf', mimeType: 'application/pdf', base64: Buffer.from('%PDF-1.4\nTeste fictício de integração, sem dados financeiros.\n%%EOF').toString('base64') })

test('comprovantes exigem formato e tamanho válidos, sem confiar na extensão', async () => {
  assert.equal(validReceipt(testReceipt()), true)
  for (const receipt of [
    { ...testReceipt(), mimeType: 'image/png' },
    { ...testReceipt(), name: '../receipt.pdf' },
    { ...testReceipt(), base64: Buffer.from('<html>fake</html>').toString('base64') },
    { ...testReceipt(), base64: '%PDF-not-base64' },
    { ...testReceipt(), mimeType: 'image/svg+xml' },
    { ...testReceipt(), base64: '' },
  ]) assert.equal(validReceipt(receipt), false)
  const maximum = Buffer.alloc(RECEIPT_MAX_BYTES, 0)
  maximum.write('%PDF-1.4')
  assert.equal(validReceipt({ ...testReceipt(), base64: maximum.toString('base64') }), true)
  assert.equal(validReceipt({ ...testReceipt(), base64: Buffer.concat([maximum, Buffer.from('1')]).toString('base64') }), false)
  assert.equal(validReceipt({ name: 'image.png', mimeType: 'image/png', base64: Buffer.from([137,80,78,71,13,10,26,10]).toString('base64') }), true)
  assert.equal(validReceipt({ name: 'image.jpg', mimeType: 'image/jpeg', base64: Buffer.from([255,216,255,224]).toString('base64') }), true)
  const file = new File([Buffer.from(testReceipt().base64, 'base64')], 'teste.pdf', { type: 'application/pdf' })
  assert.deepEqual(await readReceipt(file), testReceipt())
  await assert.rejects(readReceipt(new File(['<html>'], 'fake.pdf', { type: 'application/pdf' })))
})

test('diagnóstico público identifica configuração inválida sem expor credenciais', async () => {
  const get = new Request('https://azure.example/api/forms')
  const invalid = { ...env, SUBMISSIONS_ENABLED: 'false', SITE_ORIGIN: 'https://azure.example/', APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test/dev', APPS_SCRIPT_SECRET: 'short-private-value', TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: ' ' }
  const response = await handleSubmissions(get, invalid)
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { ok: false, code: 'CONFIGURATION_ERROR', issues: [
    'SUBMISSIONS_DISABLED', 'SITE_ORIGIN_INVALID', 'TURNSTILE_SITE_KEY_MISSING', 'TURNSTILE_SECRET_KEY_MISSING', 'APPS_SCRIPT_SECRET_TOO_SHORT', 'APPS_SCRIPT_URL_INVALID',
  ] })
  const valid = await handleSubmissions(get, env)
  assert.equal(valid.status, 200)
  assert.equal((await valid.json()).ok, true)
  const mismatch = await handleSubmissions(new Request('https://preview.example/api/forms'), env)
  assert.equal(mismatch.status, 403)
  assert.equal((await mismatch.json()).code, 'ORIGIN_NOT_ALLOWED')
})
function application() {
  return { kind: 'directorate', submissionId: randomUUID(), edition: 'test-edition', processId: 'test-directorate', privacyAcknowledged: true, privacyVersion: submissionSettings.privacyVersion, turnstileToken: 'test-token', data: { answers: {
    fullName: 'Teste Azure', nickname: '=1+1', email: 'test@example.com', phone: '+55 41 99999-9999', motivation: 'Teste de integração', area: 'Eventos', areaDescription: 'Organizar eventos.',
  } } }
}

test('aceita URLs de produção comuns e Workspace, mantendo o destino restrito ao Apps Script', async () => {
  for (const url of ['https://script.google.com/macros/s/test-ID_123/exec', 'https://script.google.com/a/macros/alunos.utfpr.edu.br/s/test-ID_123/exec']) {
    const response = await handleSubmissions(new Request('https://azure.example/api/forms'), { ...env, APPS_SCRIPT_URL: url })
    assert.equal(response.status, 200, url)
  }
  for (const url of [
    'https://script.google.com/a/macros/alunos.utfpr.edu.br/s/test/dev',
    'https://script.google.com.evil.example/macros/s/test/exec',
    'https://script.google.com@evil.example/macros/s/test/exec',
    'https://script.google.com/a/macros/alunos.utfpr.edu.br/s/test/exec?redirect=elsewhere',
    'https://script.google.com/a/macros/alunos.utfpr.edu.br/s/test/edit',
    'https://docs.google.com/spreadsheets/d/test/edit',
    'http://script.google.com/macros/s/test/exec',
  ]) {
    const response = await handleSubmissions(new Request('https://azure.example/api/forms'), { ...env, APPS_SCRIPT_URL: url })
    assert.equal(response.status, 503, url)
    assert.deepEqual((await response.json()).issues, ['APPS_SCRIPT_URL_INVALID'])
  }
})
function competitiveApplication(game = 'valorant') {
  const data = { ...emptyValues(), game, role: 'Coach', acknowledged: true }
  for (const step of activeSteps(data.role)) for (const q of questionsFor(step, data)) {
    if (q.optional) continue
    data.answers[q.id] = q.kind === 'multiple' ? [q.options[0]] : q.options ? q.options[0] : q.kind === 'tel' ? '41999999999' : 'Teste'
  }
  return { ...application(), kind: 'competitive', processId: 'test-competitive', data }
}
function fakeGoogle() {
  const sheets = new Map()
  const files = new Map()
  const appends = []
  let blocked = false
  let failAppend = false
  let publicFolder = false
  const properties = { APPS_SCRIPT_SECRET: secret, RECRUITMENT_SPREADSHEET_ID: 'recruitment-file', STORE_SPREADSHEET_ID: 'store-file', STORE_RECEIPTS_FOLDER_ID: 'receipts-folder' }
  const book = (id) => ({
    getSheetByName: (name) => sheets.get(`${id}:${name}`),
    insertSheet: (name) => {
      const sheet = { rows: [], getLastRow() { return this.rows.length }, getLastColumn() { return this.rows[0]?.length ?? 0 }, getMaxColumns: () => 100,
        setFrozenRows() {}, getRange(row, col, count, width) {
          return { getValues: () => Array.from({ length: count }, (_, index) => sheet.rows[row - 1 + index].slice(col - 1, col - 1 + width)),
            setValues(values) { values.forEach((value, i) => { sheet.rows[row - 1 + i] = [...value] }); return this }, setFontWeight() {},
            createTextFinder(value) { return { matchEntireCell() { return this }, findNext() {
              const index = sheet.rows.findIndex((entry, i) => i >= row - 1 && entry[col - 1] === value)
              return index < 0 ? null : { getRow: () => index + 1 }
            } } },
          }
        },
      }
      sheets.set(`${id}:${name}`, sheet)
      return sheet
    },
  })
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => properties[key] }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this } }) },
    Utilities: { Charset: { UTF_8: 'utf8' }, DigestAlgorithm: { SHA_256: 'sha256' },
      computeHmacSha256Signature: (value, key) => [...createHmac('sha256', key).update(value).digest()],
      computeDigest: (_, value) => [...createHash('sha256').update(Array.isArray(value) ? Buffer.from(value) : value).digest()],
      base64Decode: (value) => [...Buffer.from(value, 'base64')],
      newBlob: (bytes, mimeType, name) => ({ getBytes: () => bytes, mimeType, name }),
    },
    DriveApp: { Access: { PRIVATE: 'private' }, getFolderById: (id) => {
      assert.equal(id, 'receipts-folder')
      return { getSharingAccess: () => publicFolder ? 'anyone' : 'private',
        getFilesByName: (name) => ({ hasNext: () => files.has(name), next: () => files.get(name) }),
        createFile: (blob) => {
          let description = ''
          const id = `file-${files.size + 1}`
          const file = { getDescription: () => description, setDescription: (value) => { description = value },
            getMimeType: () => blob.mimeType, getBlob: () => blob, getSharingAccess: () => 'private',
            getId: () => id, getUrl: () => `https://drive.google.com/file/d/${id}/view` }
          files.set(blob.name, file)
          return file
        },
      }
    } },
    LockService: { getScriptLock: () => { let held = false; return { tryLock: () => (held = !blocked), hasLock: () => held, releaseLock: () => { held = false } } } },
    SpreadsheetApp: { openById: book },
    Sheets: { Spreadsheets: { Values: { append: (body, id, range, options) => {
      if (failAppend) { failAppend = false; throw new Error('temporary failure') }
      const tab = range.match(/^'([^']+)'/)[1]
      const sheet = sheets.get(`${id}:${tab}`)
      appends.push({ id, tab, options })
      sheet.rows.push(...body.values.map((row) => [...row]))
      return { updates: { updatedRows: body.values.length } }
    } } } },
  })
  vm.runInContext(readFileSync(new URL('../integrations/google-apps-script/Columns.gs', import.meta.url), 'utf8'), context)
  vm.runInContext(readFileSync(new URL('../integrations/google-apps-script/Code.gs', import.meta.url), 'utf8'), context)
  context.setupSheets()
  const post = (envelope) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(envelope) } }).text)
  const calls = []
  const send = async (url, options) => {
    calls.push(url)
    if (url.includes('siteverify')) return Response.json({ success: true, hostname: 'azure.example', action: JSON.parse(currentBody).kind })
    return Response.json(post(JSON.parse(options.body)))
  }
  let currentBody = '{}'
  return { sheets, files, appends, calls, post, context, book, properties,
    failNextAppend: () => { failAppend = true }, makeFolderPublic: () => { publicFolder = true },
    block: () => { blocked = true }, sendFor: (body) => { currentBody = JSON.stringify(body); return send } }
}

test('integração valida, assina e acrescenta respostas sem duplicar tentativas', async (t) => {
  const original = structuredClone(submissionSettings)
  const originalStore = structuredClone(storeSettings)
  const originalProducts = products.slice()
  for (const kind of ['competitive', 'directorate']) Object.assign(submissionSettings[kind], { enabled: true, edition: 'test-edition', processId: `test-${kind}` })
  submissionSettings.store.enabled = true
  Object.assign(storeSettings, { preview: false, fulfillment: 'Retirada de teste', pix: { key: 'test@example.com', recipient: 'Titular de teste', qrImage: '', copyPaste: '' } })
  t.after(() => { Object.assign(submissionSettings, original); Object.assign(storeSettings, originalStore); products.splice(0, products.length, ...originalProducts) })

  await t.test('gravação RAW, protocolo, repetição idempotente e conflito de conteúdo', async () => {
    const google = fakeGoogle()
    const body = application()
    const first = await handleSubmissions(request(body), env, google.sendFor(body))
    assert.equal(first.status, 200)
    const receipt = await first.json()
    body.turnstileToken = 'new-challenge-token'
    const retry = await handleSubmissions(request(body), env, google.sendFor(body))
    assert.deepEqual(await retry.json(), receipt)
    assert.equal(google.appends.length, 1)
    const rows = google.sheets.get('recruitment-file:Diretoria').rows
    assert.equal(rows.length, 2)
    assert.equal(rows[1][rows[0].findIndex((h) => h.startsWith('nickname |'))], '=1+1')
    assert.equal(google.appends[0].options.valueInputOption, 'RAW')
    assert.equal(google.appends[0].options.insertDataOption, 'INSERT_ROWS')
    assert.equal(JSON.stringify(rows).includes('new-challenge-token'), false)
    google.context.setupSheets()
    assert.equal(rows.length, 2, 'setup nunca apaga respostas')
    body.data.answers.fullName = 'Resposta alterada'
    const conflict = await handleSubmissions(request(body), env, google.sendFor(body))
    assert.equal(conflict.status, 409)
    assert.equal((await conflict.json()).code, 'ID_CONFLICT')
    body.submissionId = randomUUID()
    assert.equal((await handleSubmissions(request(body), env, google.sendFor(body))).status, 200)
    assert.equal(rows.length, 3)
  })

  await t.test('envio usa a URL Workspace configurada e confirma o recibo do Google', async () => {
    const google = fakeGoogle()
    const body = application()
    const workspaceEnv = { ...env, APPS_SCRIPT_URL: 'https://script.google.com/a/macros/alunos.utfpr.edu.br/s/test/exec' }
    const response = await handleSubmissions(request(body), workspaceEnv, google.sendFor(body))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).submissionId, body.submissionId)
    assert.equal(google.calls.at(-1), workspaceEnv.APPS_SCRIPT_URL)
    assert.equal(google.appends.length, 1)
  })

  await t.test('competitivo descarta campos de Player para Coach e grava na aba correta', async () => {
    const body = competitiveApplication()
    body.data.answers.mainAgent = 'Não deve ser salvo'
    const google = fakeGoogle()
    assert.equal((await handleSubmissions(request(body), env, google.sendFor(body))).status, 200)
    assert.equal(google.appends[0].tab, 'VALORANT')
    assert.equal(JSON.stringify(google.sheets.get('recruitment-file:VALORANT').rows).includes('Não deve ser salvo'), false)
  })

  await t.test('separa todas as modalidades abertas em abas do mesmo arquivo e preserva edições', async () => {
    const google = fakeGoogle()
    const expected = { valorant: 'VALORANT', 'counter-strike-2': 'CS2', 'league-of-legends': 'League of Legends', 'brawl-stars': 'Brawl Stars', 'ea-fc': 'EA FC', 'free-fire': 'Free Fire' }
    assert.deepEqual(games.filter((game) => game.visible).map((game) => game.id).sort(), Object.keys(expected).sort())
    for (const [game, tab] of Object.entries(expected)) {
      const body = competitiveApplication(game)
      const first = await handleSubmissions(request(body), env, google.sendFor(body))
      assert.equal(first.status, 200)
      const receipt = await first.json()
      const retry = await handleSubmissions(request(body), env, google.sendFor(body))
      assert.deepEqual(await retry.json(), receipt)
      assert.equal(google.appends.at(-1).id, 'recruitment-file')
      assert.equal(google.appends.at(-1).tab, tab)
      const rows = google.sheets.get(`recruitment-file:${tab}`).rows
      assert.equal(rows.length, 2)
      assert.equal(rows[1][4], 'test-edition')
      assert.equal(rows[1][10], game)
    }
    assert.equal(google.appends.length, 6)
    assert.equal(google.sheets.has('recruitment-file:Competitivo'), false)
    assert.equal(google.sheets.has('recruitment-file:Wild Rift'), false)
    const settings = { ...submissionSettings.competitive }
    try {
      Object.assign(submissionSettings.competitive, { edition: 'next-edition', processId: 'next-process' })
      const body = { ...competitiveApplication(), edition: 'next-edition', processId: 'next-process' }
      assert.equal((await handleSubmissions(request(body), env, google.sendFor(body))).status, 200)
      google.context.setupSheets()
      const rows = google.sheets.get('recruitment-file:VALORANT').rows
      assert.equal(rows.length, 3)
      assert.deepEqual(rows.slice(1).map((row) => row[4]), ['test-edition', 'next-edition'])
    } finally { Object.assign(submissionSettings.competitive, settings) }
  })

  await t.test('preserva a aba antiga e reconhece tentativas já gravadas nela', async () => {
    const google = fakeGoogle()
    const body = competitiveApplication()
    const first = await handleSubmissions(request(body), env, google.sendFor(body))
    const receipt = await first.json()
    const current = google.sheets.get('recruitment-file:VALORANT')
    const legacy = google.book('recruitment-file').insertSheet('Competitivo')
    legacy.rows = [current.rows[0].slice(), current.rows.pop()]
    const before = JSON.stringify(legacy.rows)
    google.context.setupSheets()
    assert.deepEqual(await (await handleSubmissions(request(body), env, google.sendFor(body))).json(), receipt)
    assert.equal(current.rows.length, 1)
    assert.equal(JSON.stringify(legacy.rows), before)
    body.data.answers.fullName = 'Conteúdo diferente'
    assert.equal((await handleSubmissions(request(body), env, google.sendFor(body))).status, 409)
  })

  await t.test('Apps Script rejeita modalidades desconhecidas ou ocultas, mesmo com assinatura válida', async () => {
    const google = fakeGoogle()
    for (const game of ['Diretoria', '__proto__', 'wild-rift']) {
      const { turnstileToken, ...body } = competitiveApplication()
      body.data.game = game
      const payload = JSON.stringify({ ...body, schemaVersion: 1 })
      const timestamp = Date.now()
      assert.equal(google.post({ payload, timestamp, signature: await signPayload(payload, timestamp, secret) }).code, 'INVALID_REQUEST')
    }
    assert.equal(google.appends.length, 0)
  })

  await t.test('loja usa catálogo confiável e arquivo separado; rejeita opções e quantidades inválidas', async () => {
    products.push({ id: 'test-shirt', slug: 'test-shirt', name: 'Produto de teste', category: 'Vestuário', priceCents: 7990, requests: { enabled: true, variants: ['Azul'], sizes: ['M'], maxQuantity: 2 } })
    const body = { ...application(), kind: 'store', data: { productId: 'test-shirt', productName: 'Nome adulterado', variant: 'Azul', size: 'M', quantity: 2, fullName: 'Teste', email: 'test@example.com', phone: '41999999999', notes: '', quotedUnitPriceCents: 7990, totalPriceCents: 1, receipt: testReceipt() } }
    const google = fakeGoogle()
    const response = await handleSubmissions(request(body), env, google.sendFor(body))
    assert.equal(response.status, 200)
    const confirmation = await response.json()
    assert.deepEqual(await (await handleSubmissions(request(body), env, google.sendFor(body))).json(), confirmation)
    assert.equal(google.appends[0].id, 'store-file')
    assert.equal(google.appends.length, 1)
    assert.equal(google.files.size, 1)
    const rows = google.sheets.get('store-file:Solicitacoes').rows
    const field = (key) => rows[1][rows[0].findIndex((label) => label.startsWith(key + ' |'))]
    assert.equal(field('totalPriceCents'), 15980)
    assert.equal(field('receiptUrl'), 'https://drive.google.com/file/d/file-1/view')
    assert.equal(field('receiptName'), 'teste.pdf')
    assert.equal(rows[1][9], 'Aguardando conferência')
    assert.equal(JSON.stringify(rows).includes(body.data.receipt.base64), false)
    assert.equal(JSON.stringify(google.sheets.get('store-file:Solicitacoes').rows).includes('Nome adulterado'), false)
    for (const change of [{ size: 'XX' }, { size: '' }, { quantity: 3 }, { productId: 'missing' }, { quotedUnitPriceCents: 1 }, { receipt: undefined }]) assert.equal(validateSubmission({ ...body, data: { ...body.data, ...change } }), null)
    const fresh = { ...body, submissionId: randomUUID() }
    const recovering = fakeGoogle()
    recovering.failNextAppend()
    assert.equal((await handleSubmissions(request(fresh), env, recovering.sendFor(fresh))).status, 503)
    assert.equal(recovering.files.size, 1)
    assert.equal((await handleSubmissions(request(fresh), env, recovering.sendFor(fresh))).status, 200)
    assert.equal(recovering.files.size, 1, 'retentativa reaproveita o arquivo privado')
    assert.equal(recovering.appends.length, 1)
    const unsafe = fakeGoogle()
    unsafe.makeFolderPublic()
    assert.equal((await handleSubmissions(request(fresh), env, unsafe.sendFor(fresh))).status, 503)
    assert.equal(unsafe.files.size, 0)
    assert.equal(unsafe.appends.length, 0)
    const unconfigured = fakeGoogle()
    delete unconfigured.properties.STORE_RECEIPTS_FOLDER_ID
    assert.equal((await handleSubmissions(request(fresh), env, unconfigured.sendFor(fresh))).status, 503)
    assert.equal(unconfigured.appends.length, 0)

    products.push({ id: 'test-mug', slug: 'test-mug', name: 'Caneca teste', category: 'Acessórios', priceCents: 1000, requests: { enabled: true, variants: [], sizes: [], maxQuantity: 2 } })
    const mug = { ...body, submissionId: randomUUID(), data: { ...body.data, productId: 'test-mug', size: '', variant: '', quotedUnitPriceCents: 1000 } }
    assert.ok(validateSubmission(mug))
    assert.equal(validateSubmission({ ...mug, data: { ...mug.data, size: 'M' } }), null)
    storeSettings.preview = true
    assert.equal(validateSubmission(mug), null)
    assert.equal((await (await handleSubmissions(new Request('https://azure.example/api/forms'), env)).json()).enabled.store, false)
    storeSettings.preview = false
    products.at(-1).visible = false
    assert.equal(validateSubmission(mug), null)
    assert.equal(visibleProducts().some((product) => product.id === 'test-mug'), false)
  })

  await t.test('dados inválidos, consentimento ausente, edição antiga e origem externa não chegam ao Google', async () => {
    let calls = 0
    const send = async () => { calls++; throw new Error('must not call') }
    const body = application()
    for (const candidate of [null, {}, { ...body, data: null }, { ...body, privacyAcknowledged: false }, { ...body, data: { answers: { ...body.data.answers, motivation: 'a'.repeat(4001) } } }]) {
      assert.equal((await handleSubmissions(request(candidate), env, send)).status, 422)
    }
    assert.equal((await handleSubmissions(request({ ...body, edition: 'old' }), env, send)).status, 409)
    assert.equal((await handleSubmissions(request(body, { headers: { origin: 'https://other.example', 'content-type': 'application/json' } }), env, send)).status, 403)
    assert.equal((await handleSubmissions(request(body), { ...env, SUBMISSIONS_ENABLED: 'false' }, send)).status, 503)
    assert.equal((await handleSubmissions(request('a'.repeat(50000)), env, send)).status, 400)
    submissionSettings.directorate.enabled = false
    assert.equal((await handleSubmissions(request(body), env, send)).status, 409)
    submissionSettings.directorate.enabled = true
    assert.equal(calls, 0)
  })

  await t.test('verificação antispam exige sucesso, hostname e ação corretos', async () => {
    for (const challenge of [{ success: false }, { success: true, hostname: 'other', action: 'directorate' }, { success: true, hostname: 'azure.example', action: 'store' }]) {
      let calls = 0
      const send = async () => { calls++; return Response.json(challenge) }
      assert.equal((await handleSubmissions(request(application()), env, send)).status, 403)
      assert.equal(calls, 1)
    }
  })

  await t.test('timeout e respostas falsas não produzem confirmação', async () => {
    const body = application()
    for (const reply of [{ ok: true, submissionId: randomUUID(), receivedAt: new Date().toISOString() }, { ok: false }, { ok: true, submissionId: body.submissionId }]) {
      let calls = 0
      const send = async () => Response.json(++calls === 1 ? { success: true, hostname: 'azure.example', action: 'directorate' } : reply)
      assert.equal((await handleSubmissions(request(body), env, send)).status, 503)
    }
    assert.equal((await handleSubmissions(request(body), env, async () => { throw new Error('network') })).status, 503)
  })

  await t.test('Apps Script rejeita assinatura inválida/expirada e bloqueio ocupado', async () => {
    const google = fakeGoogle()
    const { turnstileToken, ...body } = application()
    const payload = JSON.stringify({ ...body, schemaVersion: 1 })
    const timestamp = Date.now()
    const signature = await signPayload(payload, timestamp, secret)
    assert.equal(google.post({ payload, timestamp, signature: '0'.repeat(64) }).code, 'UNAUTHORIZED')
    assert.equal(google.post({ payload, timestamp: timestamp - 600000, signature }).code, 'UNAUTHORIZED')
    google.block()
    assert.equal(google.post({ payload, timestamp, signature }).code, 'BUSY')
    assert.equal(google.appends.length, 0)
  })
})
