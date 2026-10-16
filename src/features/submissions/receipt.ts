export const RECEIPT_MAX_BYTES = 2 * 1024 * 1024
export const FORM_MAX_BYTES = 48 * 1024
export const STORE_MAX_BYTES = 3 * 1024 * 1024
export interface PaymentReceipt { name: string; mimeType: string; base64: string }

// Valida os bytes, além do MIME declarado. Não aceita SVG, HTML ou executáveis.
export function validReceipt(receipt: PaymentReceipt) {
  if (!['image/png', 'image/jpeg', 'application/pdf'].includes(receipt.mimeType) ||
      !receipt.name.trim() || receipt.name.length > 150 || /[\x00-\x1f/\\]/.test(receipt.name) ||
      receipt.base64.length > Math.ceil(RECEIPT_MAX_BYTES / 3) * 4 ||
      receipt.base64.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(receipt.base64) ||
      !/^[^=]*={0,2}$/.test(receipt.base64)) return false
  try {
    const bytes = atob(receipt.base64)
    if (!bytes.length || bytes.length > RECEIPT_MAX_BYTES) return false
    if (receipt.mimeType === 'image/png') return bytes.startsWith('\x89PNG\r\n\x1a\n')
    if (receipt.mimeType === 'image/jpeg') return bytes.startsWith('\xff\xd8\xff')
    return bytes.startsWith('%PDF-')
  } catch { return false }
}

export async function readReceipt(file: File): Promise<PaymentReceipt> {
  if (!file.size || file.size > RECEIPT_MAX_BYTES) throw new Error('Escolha um arquivo de até 2 MB.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  const receipt = { name: file.name, mimeType: file.type, base64: btoa(binary) }
  if (!validReceipt(receipt)) throw new Error('Use um comprovante válido em PNG, JPG ou PDF, com nome de até 150 caracteres.')
  return receipt
}
