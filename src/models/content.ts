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
  category: 'Vestuário' | 'Acessórios'
  referencePrice?: number
  image?: ImageAsset
}

export interface Partner {
  id: string
  name: string
  url: string
  logo?: ImageAsset
}

export interface SocialLink {
  label: string
  url: string
}
