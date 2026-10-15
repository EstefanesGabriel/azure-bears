import type { ImageAsset, SocialLink } from '../models/content'

export interface TeamPlayer {
  id: string
  nickname: string
  name?: string
  role?: string
  course?: string
  bio?: string
  photo: ImageAsset
  socials?: SocialLink[]
  visible: boolean
  placeholder?: boolean
}

export interface TeamLine {
  id: string
  name: string
  description: string
  photo: ImageAsset
  players: TeamPlayer[]
  visible: boolean
  placeholder?: boolean
}

export interface TeamModality {
  id: string
  name: string
  category: string
  aliases?: string[]
  icon: string
  visible: boolean
  lines: TeamLine[]
}

// Os registros abaixo são espaços de apresentação, não elencos oficiais.
// Substitua por objetos TeamLine/TeamPlayer com os dados reais quando disponíveis.
export function placeholderLine(game: string, number: number, slots: number): TeamLine {
  const id = `line-${String(number).padStart(2, '0')}`
  return {
    id,
    name: `Line ${String(number).padStart(2, '0')}`,
    description: 'Cada jogador traz uma história. Em breve, você conhece quem veste essa camisa.',
    visible: true,
    placeholder: true,
    photo: { src: `/images/teams/${game}/${id}/line.png`, alt: `Foto da ${id.replace('-', ' ')}` },
    players: Array.from({ length: slots }, (_, index) => ({
      id: `jogador-${String(index + 1).padStart(2, '0')}`,
      nickname: `Jogador ${String(index + 1).padStart(2, '0')}`,
      visible: true,
      placeholder: true,
      photo: { src: `/images/teams/${game}/${id}/jogador-${String(index + 1).padStart(2, '0')}.png`, alt: 'Retrato do jogador' },
    })),
  }
}

// CADASTRO DAS EQUIPES: ordem da lista = ordem no site e na Home.
// visible: false oculta uma modalidade, line ou jogador sem apagar seu cadastro.
// Esta visibilidade não abre/fecha inscrições: seletivas continuam em recruitment/config.ts.
export const teamModalities: TeamModality[] = [
  { id: 'valorant', name: 'VALORANT', category: 'FPS tático', aliases: ['vl'], icon: '/game-icons/valorant.png', visible: true,
    lines: [placeholderLine('valorant', 1, 5), placeholderLine('valorant', 2, 5)] },
  { id: 'league-of-legends', name: 'League of Legends', category: 'MOBA', aliases: ['lol'], icon: '/game-icons/league-of-legends.png', visible: true,
    lines: [placeholderLine('league-of-legends', 1, 5)] },
  { id: 'counter-strike-2', name: 'Counter-Strike 2', category: 'FPS tático', aliases: ['cs', 'cs2'], icon: '/game-icons/counter-strike-2.png', visible: true,
    lines: [placeholderLine('counter-strike-2', 1, 5)] },
  { id: 'brawl-stars', name: 'Brawl Stars', category: 'Arena mobile', icon: '/game-icons/brawl-stars.png', visible: true,
    lines: [placeholderLine('brawl-stars', 1, 3)] },
  { id: 'ea-fc', name: 'EA FC', category: 'Futebol virtual', aliases: ['fifa'], icon: '/game-icons/ea-fc.png', visible: true,
    lines: [placeholderLine('ea-fc', 1, 1)] },
  { id: 'free-fire', name: 'Free Fire', category: 'Battle royale', aliases: ['ff'], icon: '/game-icons/free-fire.png', visible: true,
    lines: [placeholderLine('free-fire', 1, 4)] },
  { id: 'teamfight-tactics', name: 'Teamfight Tactics', category: 'Estratégia', aliases: ['tft'], icon: '/game-icons/teamfight-tactics.png', visible: true,
    lines: [placeholderLine('teamfight-tactics', 1, 1)] },
  { id: 'wild-rift', name: 'Wild Rift', category: 'MOBA mobile', icon: '/game-icons/wild-rift.png', visible: true,
    lines: [placeholderLine('wild-rift', 1, 5)] },
  { id: 'rocket-league', name: 'Rocket League', category: 'Esporte e velocidade', aliases: ['rl'], icon: '/game-icons/rocket-league.png', visible: true,
    lines: [placeholderLine('rocket-league', 1, 3)] },
]

export const visibleModalities = () => teamModalities.filter((game) => game.visible)
export const visibleLines = (game: TeamModality) => game.lines.filter((line) => line.visible)
export const visiblePlayers = (line: TeamLine) => line.players.filter((player) => player.visible)

export function findTeamRoute(gameId?: string, lineId?: string) {
  const game = visibleModalities().find((entry) => entry.id === gameId)
  const line = game && visibleLines(game).find((entry) => entry.id === lineId)
  return { game, line }
}
