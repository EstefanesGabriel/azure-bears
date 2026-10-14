import { z } from 'zod'
import { applicationSchema } from '../recruitment/form.ts'
import { directorateSchema } from '../recruitment/directorate.ts'
import { products } from '../../data/home.ts'
import { submissionSettings } from '../../data/submissions.ts'

const answers = z.record(z.string().max(80), z.union([
  z.string().max(4000), z.array(z.string().max(300)).max(30),
])).refine((value) => Object.keys(value).length <= 80)
const contact = z.string().trim().min(1).max(200)
const competitive = z.object({ game: contact, role: contact, acknowledged: z.boolean(), answers })
const directorate = z.object({ answers })
export const storeSchema = z.object({
  productId: contact, variant: z.string().max(100).default(''), size: z.string().max(50).default(''),
  quantity: z.number().int().min(1).max(20), fullName: contact,
  email: z.email().max(254),
  phone: z.string().max(30).regex(/^[\d\s()+-]+$/).refine((value) => /^[1-9]\d{9,10}$/.test(value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''))),
  notes: z.string().trim().max(4000).default(''),
})
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
  if (!product?.requests) return null
  const { variants, sizes, maxQuantity } = product.requests
  if (value.data.quantity > maxQuantity ||
      (variants.length ? !variants.includes(value.data.variant) : value.data.variant !== '') ||
      (sizes.length ? !sizes.includes(value.data.size) : value.data.size !== '')) return null
  return { ...value, data: { ...value.data, productName: product.name } }
}
