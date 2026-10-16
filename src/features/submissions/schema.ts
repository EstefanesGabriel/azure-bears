import { z } from 'zod'
import { applicationSchema } from '../recruitment/form.ts'
import { directorateSchema } from '../recruitment/directorate.ts'
import { submissionSettings } from '../../data/submissions.ts'
import { products, orderable, storeSettings } from '../../data/store.ts'
import { storeSchema } from './store-schema.ts'
export { storeSchema } from './store-schema.ts'

const answers = z.record(z.string().max(80), z.union([
  z.string().max(4000), z.array(z.string().max(300)).max(30),
])).refine((value) => Object.keys(value).length <= 80)
const contact = z.string().trim().min(1).max(200)
const competitive = z.object({ game: contact, role: contact, acknowledged: z.boolean(), answers })
const directorate = z.object({ answers })
const base = {
  submissionId: z.uuid(), privacyAcknowledged: z.literal(true),
  privacyVersion: z.literal(submissionSettings.privacyVersion),
  turnstileToken: z.string().min(1).max(2048),
}
const selection = { edition: contact, processId: contact }
export const submissionSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, ...selection, kind: z.literal('competitive'), data: competitive }),
  z.object({ ...base, ...selection, kind: z.literal('directorate'), data: directorate }),
  z.object({ ...base, kind: z.literal('store'), data: storeSchema }),
])

export function validateSubmission(input: unknown) {
  const envelope = submissionSchema.safeParse(input)
  if (!envelope.success) return null
  const value = envelope.data
  if (value.kind === 'competitive') {
    const result = applicationSchema(value.data).safeParse(value.data)
    return result.success ? { ...value, data: result.data } : null
  }
  if (value.kind === 'directorate') {
    const result = directorateSchema().safeParse(value.data)
    return result.success ? { ...value, data: result.data } : null
  }
  const product = products.find((item) => item.id === value.data.productId && item.requests?.enabled)
  if (!product?.requests || !orderable(product) || value.data.quotedUnitPriceCents !== product.priceCents) return null
  const { variants, sizes, maxQuantity } = product.requests
  if (value.data.quantity > maxQuantity ||
      (variants.length ? !variants.includes(value.data.variant) : value.data.variant !== '') ||
      (sizes.length ? !sizes.includes(value.data.size) : value.data.size !== '')) return null
  return { ...value, data: { ...value.data, productName: product.name, unitPriceCents: product.priceCents!,
    totalPriceCents: product.priceCents! * value.data.quantity, pixRecipient: storeSettings.pix.recipient,
    pixKey: storeSettings.pix.key, fulfillment: storeSettings.fulfillment } }
}
