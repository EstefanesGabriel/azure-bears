export interface ImageAsset {
  src: string
  alt: string
}

export interface NewsItem {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  publishedAt: string
  image?: ImageAsset
  visible?: boolean
  content: { heading?: string; paragraphs: string[] }[]
}

export interface Modality {
  id: string
  slug: string
  name: string
  image?: ImageAsset
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  description?: string
  visible?: boolean
  priceCents?: number
  badge?: string
  referencePrice?: number
  image?: ImageAsset
  requests?: { enabled: boolean; variants: string[]; sizes: string[]; maxQuantity: number }
}

export interface Partner {
  id: string
  name: string
  visible?: boolean
  category?: string
  headline?: string
  description?: string[]
  url?: string
  logo?: ImageAsset
}

export interface SocialLink {
  label: string
  url: string
}
