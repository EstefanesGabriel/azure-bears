import type { Modality, NewsItem, Partner, Product } from '../models/content'

export const news: NewsItem[] = []
export const modalities: Modality[] = []
export const products: Product[] = []
export const partners: Partner[] = []

export const home = {
  hero: {
    eyebrow: 'E-sports universitário · UTFPR',
    title: ['O JOGO', 'É NOSSO.'],
    description:
      'Competir nos conecta. A comunidade nos fortalece. Somos Azure Bears.',
  },
  news: {
    eyebrow: 'Por dentro da Azure',
    title: 'AZURE ATUAL.',
    emptyTitle: 'NOSSA HISTÓRIA\nCONTINUA AQUI.',
    emptyDescription:
      'Campeonatos, encontros e tudo o que movimenta o nosso universo. Acompanhe as novidades do Azure Bears.',
  },
  teams: {
    eyebrow: 'Dentro do servidor',
    title: 'NOSSAS EQUIPES.',
    emptyTitle: 'UM NOME.\nMUITAS POSSIBILIDADES.',
    emptyDescription:
      'Diferentes jogos. A mesma vontade de representar. Conheça nossas modalidades e quem joga com a gente.',
  },
  store: {
    eyebrow: 'Fora do servidor também',
    title: 'VISTA A AZURE.',
    emptyDescription:
      'A nossa identidade também vai com você. Conheça os produtos oficiais do Azure Bears.',
  },
  community: {
    eyebrow: 'Seu próximo time pode estar aqui',
    title: 'TEM ESPAÇO\nPARA O SEU JOGO.',
    description:
      'Dentro e fora das partidas, uma organização é feita de pessoas. Conheça os caminhos para participar do Azure Bears.',
  },
}
