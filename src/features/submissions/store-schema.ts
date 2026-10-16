import { z } from 'zod'
import { validReceipt, RECEIPT_MAX_BYTES } from './receipt.ts'

export const orderDetailsSchema = z.object({
  productId: z.string().trim().min(1).max(200),
  variant: z.string().max(100).default(''),
  size: z.string().max(50).default(''),
  quantity: z.number().int().min(1).max(20),
  fullName: z.string().trim().min(1).max(200),
  email: z.email().max(254),
  phone: z.string().max(30).regex(/^[\d\s()+-]+$/).refine((value) => /^[1-9]\d{9,10}$/.test(value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''))),
  notes: z.string().trim().max(4000).default(''),
})

export const storeSchema = orderDetailsSchema.extend({
  quotedUnitPriceCents: z.number().int().positive(),
  receipt: z.object({
    name: z.string().max(150),
    mimeType: z.string().max(50),
    base64: z.string().max(Math.ceil(RECEIPT_MAX_BYTES / 3) * 4),
  }).refine(validReceipt),
})
