import type { NewsItem } from '../models/content'

// Substitua os exemplos por notícias oficiais. A lista é ordenada pela data.
// Use visible: false para ocultar uma notícia na Home, lista e rota individual.
export const news: NewsItem[] = [
  {
    id: 'exemplo-comunidade',
    slug: 'exemplo-comunidade',
    title: 'Dentro e fora do jogo: o universo Azure.',
    summary: 'Histórias, encontros e novidades da comunidade.',
    category: 'Comunidade',
    publishedAt: '2026-10-15',
    visible: true,
    // image: { src: '/images/news/comunidade.png', alt: 'Descreva a foto real' },
    content: [
      { heading: 'Um espaço para nossas histórias', paragraphs: ['O que aconteceu, quem participou e por que esse momento merece ser compartilhado.'] },
    ],
  },
  {
    id: 'exemplo-competitivo',
    slug: 'exemplo-competitivo',
    title: 'Cada partida tem uma história para contar.',
    summary: 'Equipes e campeonatos no nosso mural.',
    category: 'Competitivo',
    publishedAt: '2026-10-14',
    visible: true,
    content: [
      { heading: 'Do servidor para o mural', paragraphs: ['O contexto da partida, os momentos mais importantes e as palavras dos atletas.'] },
    ],
  },
]

export function visibleNews() {
  return news.filter((item) => item.visible !== false)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function formatNewsDate(date: string) {
  // Datas editoriais YYYY-MM-DD não devem recuar um dia por causa do fuso.
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${date.slice(0, 10)}T12:00:00Z`))
}
