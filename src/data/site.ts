import type { ImageAsset, SocialLink } from '../models/content'

export const site = {
  name: 'Azure Bears',
  university: 'UTFPR',
  description:
    'Somos o Azure Bears, uma organização universitária de e-sports vinculada à Universidade Tecnológica Federal do Paraná. Um lugar para quem quer competir, criar e fazer parte da comunidade gamer.',
  logo: {
    src: '/brand/azure-bears-lockup.svg',
    alt: 'Azure Bears — urso branco e lettering angular',
  } as ImageAsset,
  symbol: '/brand/azure-bears-symbol-white.svg',
  wordmark: '/brand/azure-bears-wordmark.svg',
  heroImage: undefined as ImageAsset | undefined,
  heroVideo: undefined as string | undefined,
  socialLinks: [
    { label: 'Instagram', url: 'https://www.instagram.com/azure_bears/' },
    { label: 'X', url: 'https://x.com/azure_bears' },
  ] satisfies SocialLink[],
}

export const navigation = [
  { label: 'Início', path: '/' },
  { label: 'Sobre nós', path: '/sobre' },
  { label: 'Equipes', path: '/equipes' },
  { label: 'Notícias', path: '/noticias' },
  { label: 'Loja', path: '/loja' },
  { label: 'Parceiros', path: '/parceiros' },
] as const

export const secondaryNavigation = [
  { label: 'Diretoria', path: '/diretoria' },
  { label: 'Processos seletivos', path: '/seletivas' },
] as const
