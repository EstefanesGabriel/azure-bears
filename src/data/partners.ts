import type { Partner } from '../models/content'

// A ordem desta lista define a ordem na página e na Home.
// Duplique um objeto para adicionar; remova-o ou use visible: false para ocultar.
export const partners: Partner[] = [
  {
    id: 'station',
    name: 'Station',
    visible: true,
    category: 'Patrocinadora',
    headline: 'Conexões que levam o jogo mais longe.',
    description: [
      'A Station acredita no poder dos jogos para aproximar pessoas. Ao lado da Azure Bears, compartilha a vontade de transformar cada encontro em uma nova oportunidade de criar, competir e fazer parte.',
      'Essa parceria une energia, comunidade e paixão pelos esports. Juntos, queremos construir experiências que continuem fazendo parte da história de quem vive o jogo dentro e fora do servidor.',
    ],
    logo: {
      src: '/partners/station.png',
      alt: 'Station Studio Games — patrocinadora da Azure Bears',
    },
    // url: 'https://...', // Adicione somente o endereço oficial confirmado.
  },
]

export function visiblePartners() {
  return partners.filter((partner) => partner.visible !== false)
}
