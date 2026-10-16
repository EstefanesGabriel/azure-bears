/* Azure Bears — endpoint privado por assinatura, publicado com acesso anônimo.
 * Nunca disponibilize consultas de respostas por este endpoint.
 * Ative o serviço avançado Google Sheets API e configure as propriedades do script.
 */
const META_COLUMNS = ['Protocolo', 'Hash do envio', 'Recebido em (UTC)', 'Origem', 'Edição', 'Processo', 'Versão do formulário', 'Versão do aviso de privacidade', 'Ciência do aviso', 'Status', 'Jogo', 'Função', 'Ciência das regras'];
const DESTINATIONS = {
  competitive: { property: 'RECRUITMENT_SPREADSHEET_ID' },
  directorate: { property: 'RECRUITMENT_SPREADSHEET_ID', tab: 'Diretoria' },
  store: { property: 'STORE_SPREADSHEET_ID', tab: 'Solicitacoes' },
};

function output(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function hex(bytes) { return bytes.map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join(''); }
function equalSignature(a, b) {
  if (typeof b !== 'string' || b.length !== a.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function headersFor(kind) { return META_COLUMNS.concat(SHEET_COLUMNS[kind].map(function (column) { return column.label; })); }
function destinationFor(kind, game) {
  const destination = DESTINATIONS[kind];
  if (!destination) throw new Error('Destination unavailable');
  const id = PropertiesService.getScriptProperties().getProperty(destination.property);
  if (!id) throw new Error('Destination unavailable');
  if (kind === 'competitive') {
    if (!Object.prototype.hasOwnProperty.call(COMPETITIVE_SHEETS, game) || !COMPETITIVE_SHEETS[game].enabled) throw new Error('Game unavailable');
    return { id: id, tab: COMPETITIVE_SHEETS[game].tab };
  }
  return { id: id, tab: destination.tab };
}

// Execute uma vez no editor. Pode repetir: preserva os registros existentes.
// Somente adiciona novas colunas ao final; mudanças de ordem exigem migração explícita.
function setupSheets() {
  const targets = Object.keys(COMPETITIVE_SHEETS).filter(function (game) { return COMPETITIVE_SHEETS[game].enabled; }).map(function (game) {
    return { kind: 'competitive', target: destinationFor('competitive', game) };
  }).concat(['directorate', 'store'].map(function (kind) { return { kind: kind, target: destinationFor(kind) }; }));
  targets.forEach(function (entry) {
    const kind = entry.kind;
    const target = entry.target;
    const book = SpreadsheetApp.openById(target.id);
    const sheet = book.getSheetByName(target.tab) || book.insertSheet(target.tab);
    const headers = headersFor(kind);
    if (sheet.getLastRow() > 0) {
      const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (existing.some(function (value, i) { return value !== headers[i]; })) throw new Error('Cabeçalhos incompatíveis em ' + target.tab + '. Não altere a ordem das colunas.');
    }
    if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
}

function storedSubmission(sheet, id) {
  if (!sheet || sheet.getLastRow() <= 1) return null;
  const match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return match ? sheet.getRange(match.getRow(), 1, 1, 3).getValues()[0] : null;
}

// Pasta do Meu Drive, com acesso geral Restrito. Compartilhe apenas com a diretoria.
function receiptsFolder() {
  const id = PropertiesService.getScriptProperties().getProperty('STORE_RECEIPTS_FOLDER_ID');
  if (!id) throw new Error('Receipt folder not configured');
  const folder = DriveApp.getFolderById(id);
  if (folder.getSharingAccess() !== DriveApp.Access.PRIVATE) throw new Error('Receipt folder must be private');
  return folder;
}

// Execute no editor após configurar a pasta: solicita autorização e verifica o acesso.
function setupStoreReceipts() { receiptsFolder(); }

function storeReceipt(submission, digest) {
  const receipt = submission.data.receipt;
  if (!receipt || typeof receipt.base64 !== 'string' || receipt.base64.length > 2796204 ||
    !['image/png', 'image/jpeg', 'application/pdf'].includes(receipt.mimeType) ||
    typeof receipt.name !== 'string' || !receipt.name.trim() || receipt.name.length > 150) throw new Error('Invalid receipt');
  const bytes = Utilities.base64Decode(receipt.base64);
  if (!bytes.length || bytes.length > 2097152) throw new Error('Invalid receipt');
  const receiptHash = hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes));
  const folder = receiptsFolder();
  // Nome determinístico: permite recuperar um arquivo criado antes de uma falha na planilha.
  const name = submission.submissionId + '-comprovante';
  const matches = folder.getFilesByName(name);
  let file;
  if (matches.hasNext()) {
    file = matches.next();
    if ((file.getDescription() && file.getDescription() !== digest) || file.getMimeType() !== receipt.mimeType ||
      hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, file.getBlob().getBytes())) !== receiptHash) {
      throw new Error('ID_CONFLICT');
    }
  } else {
    file = folder.createFile(Utilities.newBlob(bytes, receipt.mimeType, name));
  }
  if (file.getSharingAccess() !== DriveApp.Access.PRIVATE) throw new Error('Receipt must be private');
  file.setDescription(digest);
  return { receiptUrl: file.getUrl(), receiptFileId: file.getId(), receiptName: receipt.name,
    receiptMimeType: receipt.mimeType, receiptSha256: receiptHash };
}

function doGet() { return output({ ok: false, code: 'METHOD_NOT_ALLOWED' }); }
function doPost(event) {
  let lock;
  try {
    if (!event || !event.postData || event.postData.contents.length > 3145728) return output({ ok: false, code: 'INVALID_REQUEST' });
    const envelope = JSON.parse(event.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('APPS_SCRIPT_SECRET');
    if (!secret || secret.length < 32 || typeof envelope.payload !== 'string' || envelope.payload.length > 3145728 ||
      !Number.isSafeInteger(envelope.timestamp) || Math.abs(Date.now() - envelope.timestamp) > 300000) return output({ ok: false, code: 'UNAUTHORIZED' });
    const expected = hex(Utilities.computeHmacSha256Signature(envelope.timestamp + '.' + envelope.payload, secret, Utilities.Charset.UTF_8));
    if (!equalSignature(expected, envelope.signature)) return output({ ok: false, code: 'UNAUTHORIZED' });
    const submission = JSON.parse(envelope.payload);
    if (submission.kind !== 'store' && envelope.payload.length > 60000) return output({ ok: false, code: 'INVALID_REQUEST' });
    if (submission.schemaVersion !== 1 || !Object.prototype.hasOwnProperty.call(DESTINATIONS, submission.kind) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submission.submissionId) ||
      submission.privacyAcknowledged !== true || !submission.data) return output({ ok: false, code: 'INVALID_REQUEST' });
    if (submission.kind === 'competitive' && (!Object.prototype.hasOwnProperty.call(COMPETITIVE_SHEETS, submission.data.game) ||
      !COMPETITIVE_SHEETS[submission.data.game].enabled)) return output({ ok: false, code: 'INVALID_REQUEST' });
    const target = destinationFor(submission.kind, submission.data.game);
    const digest = hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, envelope.payload, Utilities.Charset.UTF_8));
    lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return output({ ok: false, code: 'BUSY' });
    const book = SpreadsheetApp.openById(target.id);
    const sheet = book.getSheetByName(target.tab);
    const headers = headersFor(submission.kind);
    if (!sheet || sheet.getLastColumn() !== headers.length ||
      sheet.getRange(1, 1, 1, headers.length).getValues()[0].some(function (value, i) { return value !== headers[i]; })) {
      return output({ ok: false, code: 'CONFIGURATION_ERROR' });
    }
    // A antiga aba permanece intacta; tentativas pendentes também não a duplicam.
    const stored = storedSubmission(sheet, submission.submissionId) || (submission.kind === 'competitive'
      ? storedSubmission(book.getSheetByName('Competitivo'), submission.submissionId) : null);
    if (stored) {
      if (stored[1] !== digest) return output({ ok: false, code: 'ID_CONFLICT' });
      return output({ ok: true, submissionId: stored[0], receivedAt: stored[2] });
    }
    const receivedAt = new Date().toISOString();
    const data = submission.data;
    const answers = submission.kind === 'store' ? Object.assign({}, data, storeReceipt(submission, digest)) : data.answers;
    const row = [submission.submissionId, digest, receivedAt, submission.kind, submission.edition || '', submission.processId || '',
      submission.schemaVersion, submission.privacyVersion, 'Sim', submission.kind === 'store' ? 'Aguardando conferência' : 'Recebido', data.game || '', data.role || '', data.acknowledged ? 'Sim' : ''];
    SHEET_COLUMNS[submission.kind].forEach(function (column) {
      const value = answers[column.id];
      row.push(Array.isArray(value) ? value.join('\n') : value == null ? '' : value);
    });
    // RAW preserva zeros, +55, apelidos e textos iniciados por = sem executar fórmulas.
    const result = Sheets.Spreadsheets.Values.append({ values: [row] }, target.id, "'" + target.tab + "'!A1", {
      valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
    });
    if (!result.updates || result.updates.updatedRows !== 1) return output({ ok: false, code: 'WRITE_FAILED' });
    return output({ ok: true, submissionId: submission.submissionId, receivedAt: receivedAt });
  } catch (_) {
    // Não registrar dados pessoais, credenciais ou conteúdo da requisição.
    return output({ ok: false, code: _ && _.message === 'ID_CONFLICT' ? 'ID_CONFLICT' : 'UNAVAILABLE' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
