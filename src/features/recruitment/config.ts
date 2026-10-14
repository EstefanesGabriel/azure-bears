export type Question = {
  id: string
  label: string
  kind?: 'text' | 'tel' | 'url' | 'select' | 'radio' | 'multiple' | 'textarea' | 'availability'
  options?: readonly string[]
  optional?: boolean
  hint?: string
  autoComplete?: string
}

export type Game = {
  id: string
  name: string
  shortName: string
  visible: boolean
  questions: Question[]
}

export const campuses = ['Apucarana', 'Campo Mourão', 'Cornélio Procópio', 'Curitiba', 'Dois Vizinhos', 'Francisco Beltrão', 'Guarapuava', 'Londrina', 'Medianeira', 'Pato Branco', 'Ponta Grossa', 'Santa Helena', 'Toledo']
export const roles = ['Player', 'Coach', 'Analista', 'Manager']
export const lanes = ['Top', 'Jungle', 'Mid', 'ADC', 'Sup']
const valorantRoles = ['Duelista', 'Flex', 'Iniciador', 'Controlador', 'Sentinela']
const ranks = (suffix = ''): Question[] => [
  { id: `currentRank${suffix.replaceAll(' ', '')}`, label: `Qual seu rank atual${suffix ? `? (${suffix})` : '?'}` },
  { id: `peakRank${suffix.replaceAll(' ', '')}`, label: `Qual o maior rank que você alcançou${suffix ? `? (${suffix})` : '?'}` },
]
const elo: Question[] = [
  { id: 'currentRank', label: 'Qual seu elo atual?' },
  { id: 'peakRank', label: 'Qual o maior elo que você já atingiu?' },
]

// Modalidades ocultas permanecem cadastradas para ativação futura.
export const games: Game[] = [
  { id: 'brawl-stars', name: 'Brawl Stars', shortName: 'BS', visible: true, questions: [
    { id: 'gameId', label: 'Qual seu SupercellID? (nick no jogo)' }, ...ranks(),
    { id: 'class', label: 'Qual classe você joga?', kind: 'select', options: ['Tanque', 'Algozes', 'Suporte', 'Controle', 'Destruidores', 'Tiros Precisos', 'Detonadores'] },
  ] },
  { id: 'ea-fc', name: 'EA FC', shortName: 'FC', visible: true, questions: [
    { id: 'gameId', label: 'Qual seu ID? (nick no jogo)' }, ...ranks(),
  ] },
  { id: 'free-fire', name: 'Free Fire', shortName: 'FF', visible: true, questions: [
    { id: 'gameId', label: 'Qual seu ID? (nick no jogo)' }, ...ranks('Battle Royale'), ...ranks('Contra Squad'),
  ] },
  { id: 'valorant', name: 'VALORANT', shortName: 'VAL', visible: true, questions: [
    { id: 'gameId', label: 'Qual seu Riot ID?', hint: 'Informe seu nick no jogo + tag.' }, ...ranks(),
    { id: 'mainRole', label: 'Qual sua função principal?', kind: 'select', options: valorantRoles },
    { id: 'otherRoles', label: 'Em quais outras funções você gosta de jogar?', kind: 'multiple', options: valorantRoles, optional: true },
    { id: 'mainAgent', label: 'Qual seu main agent?' },
    { id: 'otherAgents', label: 'Com quais outros agentes você gosta de jogar?', optional: true },
  ] },
  { id: 'league-of-legends', name: 'League of Legends', shortName: 'LOL', visible: true, questions: [
    { id: 'gameId', label: 'Qual seu nick no jogo?' },
    { id: 'mainLane', label: 'Em qual lane deseja realizar a seletiva?', kind: 'select', options: lanes },
    { id: 'otherLanes', label: 'Em quais outras lanes você estaria disposto a jogar?', kind: 'multiple', options: lanes }, ...elo,
  ] },
  { id: 'counter-strike-2', name: 'Counter-Strike 2', shortName: 'CS2', visible: true, questions: [
    { id: 'steam', label: 'Link do perfil da Steam', kind: 'url' },
    { id: 'gamersClub', label: 'Link do perfil da GamersClub', kind: 'url', optional: true },
    { id: 'faceit', label: 'Link do perfil da Faceit', kind: 'url', optional: true },
    { id: 'mainRole', label: 'Qual sua função no CS?', kind: 'radio', options: ['Rifler', 'Awper'] },
  ] },
  { id: 'teamfight-tactics', name: 'Teamfight Tactics', shortName: 'TFT', visible: false, questions: ranks() },
  { id: 'wild-rift', name: 'Wild Rift', shortName: 'WR', visible: false, questions: [
    { id: 'gameId', label: 'Qual seu nick no jogo?' },
    ...lanes.map((lane) => ({ id: `level${lane}`, label: `Qual o nível máximo que você alcançou na lane ${lane}?` })), ...elo,
  ] },
  { id: 'rocket-league', name: 'Rocket League', shortName: 'RL', visible: false, questions: [
    { id: 'platform', label: 'Em qual plataforma você joga?', kind: 'select', options: ['Steam', 'Epic Games', 'PlayStation', 'Xbox'] },
    { id: 'gameId', label: 'Qual seu nick atual no jogo?' }, ...ranks(),
  ] },
]

export const personalQuestions: Question[] = [
  { id: 'fullName', label: 'Nome completo', autoComplete: 'name' },
  { id: 'nickname', label: 'Apelido de jogo (nick)', autoComplete: 'nickname' },
  { id: 'inclusiveGender', label: 'Você se considera de algum gênero característico do cenário inclusivo?', hint: 'Mulher cis, trans, não binário, etc.', kind: 'radio', options: ['Sim', 'Não'] },
  { id: 'whatsapp', label: 'WhatsApp (com DDD)', kind: 'tel', hint: 'Ex.: (41) 99999-9999', autoComplete: 'tel' },
]
export const academicQuestions: Question[] = [
  { id: 'course', label: 'Você é acadêmico(a) de qual curso da UTFPR?' },
  { id: 'ra', label: 'Qual seu Registro Acadêmico (RA)?', hint: 'Informe o RA conforme o sistema acadêmico.' },
  { id: 'campus', label: 'De qual campus da UTFPR?', kind: 'select', options: campuses },
  { id: 'semester', label: 'Em qual período do seu curso você está?', hint: 'Conforme o sistema acadêmico.', kind: 'select', options: Array.from({ length: 10 }, (_, index) => String(index + 1)) },
]
export const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
export const periods = ['Tarde', 'Noite']
export const intentions = ['Competir pela universidade com os melhores jogadores.', 'Ganhar horas de extensão.', 'Fazer amigos e conhecer pessoas com mesmos interesses.', 'Conhecer mais a Azure Bears.', 'Outro']
export const rules = 'Você está ciente de que esta seletiva é apenas para alunos(as) da UTFPR, e que qualquer informação não verídica preenchida neste formulário resultará na desclassificação do(a) candidato(a)?'

export function hasIglQuestion(role: string, game: string) {
  return role === 'Player' && game !== 'teamfight-tactics'
}

export function finalQuestions(role: string, game: string, selectedIntentions: string[] = []): Question[] {
  return [
    { id: 'availability', label: 'Qual sua disponibilidade atual de horários?', kind: 'availability', options: days.flatMap((day) => periods.map((period) => `${day} — ${period}`)), optional: true, hint: 'Marque todos os períodos em que você tem disponibilidade.' },
    ...(hasIglQuestion(role, game) ? [{ id: 'igl', label: 'Tem interesse em ser IGL? (In-Game Leader)', kind: 'radio' as const, options: ['Sim', 'Não', 'Deus me livre!'] }] : []),
    { id: 'experience', label: 'Você tem/teve alguma experiência competitiva?', kind: 'textarea', optional: true, hint: 'Campeonatos entre amigos também são válidos.' },
    { id: 'intentions', label: 'Quais são suas intenções na Azure Bears?', kind: 'multiple', options: intentions },
    ...(selectedIntentions.includes('Outro') ? [{ id: 'otherIntention', label: 'Conte qual é a sua outra intenção', kind: 'textarea' as const }] : []),
    { id: 'additional', label: 'Mais algo a acrescentar na sua inscrição?', kind: 'textarea', optional: true, hint: 'Você pode explicar suas motivações ou acrescentar informações.' },
  ]
}
