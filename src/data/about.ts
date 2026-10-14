// Conteúdo fornecido pela Azure Bears. Preservar a redação original.
export type AboutImage = { src: string; alt: string }

export const aboutNavigation = [
  { id: 'historia', label: 'História' },
  { id: 'conquistas', label: 'Conquistas estaduais e regionais' },
  { id: 'nacionais', label: 'Resultados nacionais' },
  { id: 'cenario', label: 'Entenda o cenário' },
  { id: 'equipes', label: 'Nossas equipes' },
  { id: 'jogadores', label: 'Jogadores premiados' },
  { id: 'comunidade', label: 'Comunidade' },
]

export const about = {
  history: {
    title: 'UMA DÉCADA DE LEGADO',
    subtitle: 'UMA HISTÓRIA SÓ, CONTADA POR MAIS DE 10 ANOS',
    milestones: [
      { label: '2015 — AAA E-Sports', image: { src: '/brand/logo-aaa.png', alt: '2015 — AAA E-Sports' } },
      { label: '2017 — Azure Jays', image: { src: '/brand/logo-azure-jays.png', alt: '2017 — Azure Jays' } },
      { label: '2020 — Avalanche', image: { src: '/brand/logo-avalanche.png', alt: '2020 — Avalanche' } },
      { label: '2023 — Azure Bears · hoje', image: { src: '/brand/logo-urso-azure-bears.png', alt: '2023 — Azure Bears · hoje' } },
    ],
    text: 'Tudo começou com a AAA E-Sports, a primeira atlética de esports do Brasil. Gerações de atletas construíram esse legado, e hoje é a Azure Bears que o carrega adiante, mais forte do que nunca.',
  },
  regional: {
    title: 'DOMÍNIO NO PARANÁ',
    count: '13',
    countLabel: 'TÍTULOS ESTADUAIS E REGIONAIS',
    text: 'Conquistados em torneios organizados por atléticas e no circuito do PGT - Paraná Gaming Tournament, somando três modalidades.',
    games: ['VALORANT', 'League of Legends', 'Counter-Strike'],
    results: [
      { event: 'PGT 2023', game: 'VALORANT', result: 'CAMPEÃO', image: { src: '/images/about/imagem-1.png', alt: 'PGT 2023' } },
      { event: 'PGT 2024', game: 'VALORANT', result: 'VICE', image: { src: '/images/about/imagem-2.png', alt: 'PGT 2024' } },
      { event: 'PGT 2025 · VERÃO MAIOR PARANÁ', game: 'VALORANT', result: 'CAMPEÃO', image: { src: '/images/about/imagem-3.png', alt: 'PGT 2025 · VERÃO MAIOR PARANÁ' } },
    ],
  },
  national: {
    title: 'REFERÊNCIA NACIONAL',
    subtitle: 'A EQUIPE UNIVERSITÁRIA MAIS VENCEDORA DO BRASIL',
    results: [
      '2023 — Copa Aliança · VALORANT — CAMPEÃO',
      '2024 — Copa Aliança · VALORANT — CAMPEÃO',
      '2025 — Copa Aliança · VALORANT — VICE',
      '2025 — Copa Aliança · League of Legends — CAMPEÃO',
      '2024 — Jogos Universitários Brasileiros (JUBs) · VALORANT — CAMPEÃO',
      '2025 — Jogos Universitários Brasileiros (JUBs) · VALORANT — VICE',
      '2025 — Jogos Universitários Brasileiros (JUBs) · League of Legends — CAMPEÃO',
    ],
    images: [
      { src: '/images/about/imagem-4.png', alt: 'Resultados nacionais' },
      { src: '/images/about/imagem-5.png', alt: 'Resultados nacionais' },
    ],
  },
  scene: {
    title: 'ENTENDA O CENÁRIO',
    subtitle: 'ONDE A ELITE UNIVERSITÁRIA SE ENFRENTA',
    blocks: [
      {
        title: 'COPA ALIANÇA',
        subtitle: '',
        paragraphs: [
          'O torneio universitário oficial da Riot Games, criadora de League of Legends, VALORANT, dentre outros. Reúne as melhores equipes universitárias do país, com transmissão oficial e final presencial na arena da Riot Games em São Paulo.',
          'A Azure Bears tem o melhor desempenho histórico do VALORANT no país: 2 títulos, 1 vice e 1 terceiro lugar.',
          'Em 2025, foi de longe a equipe com melhor desempenho geral nas 4 modalidades: campeã no LoL, vice no VALORANT e top 5 em Wild Rift e Teamfight Tactics. Única do país com representantes em 3 das 4 finais presenciais.',
          'A Azure Bears já está classificada de forma invicta para a fase principal de 2026, que ocorrerá de setembro a novembro.',
        ],
        importanceTitle: 'POR QUE IMPORTA',
        importance: 'Onde as equipes universitárias competem no maior palco dos esports profissionais.',
      },
      {
        title: 'JUBS',
        subtitle: 'Jogos Universitários Brasileiros',
        paragraphs: [
          'Organizados pela CBDU (Confederação Brasileira do Desporto Universitário). São 31 modalidades oficiais, sendo 6 de esports: VALORANT, League of Legends, EA FC, Counter-Strike 2, Brawl Stars e Free Fire, com transmissão pela CBDU TV. Nos esports, apenas as 8 melhores equipes do país disputam a fase presencial, classificadas por um qualificatório com mais de 50 equipes de todo o Brasil.',
          'A Azure Bears foi uma das poucas equipes do país a disputar as 6 modalidades de esports em 2026.',
          'É a única equipe do país que estará presente em 4 das 6 finais presenciais de esports em 2026.',
          'A Azure Bears nunca disputou o JUBs sem trazer um título: em 2 anos, 2 títulos em modalidades diferentes.',
        ],
        importanceTitle: 'POR QUE IMPORTA',
        importance: 'Estar no JUBs é estar no topo do esporte universitário do país.',
      },
    ],
  },
  teams: {
    title: 'AS NOSSAS EQUIPES',
    subtitle: 'OS GUERREIROS QUE IRÃO EM BUSCA DA GLÓRIA NO JUBS 2026',
    veteransTitle: 'OS VETERANOS',
    veteransSubtitle: 'acostumados a erguer troféu',
    veterans: [
      {
        name: 'VALORANT',
        text: 'De longe a equipe mais vencedora da história do cenário universitário.',
        achievements: ['Campeão do JUBs 2024', 'Bicampeão da Copa Aliança', 'Uma das favoritas ao título do JUBs 2026'],
        detail: 'Disputa também torneios contra equipes profissionais: 29º melhor time do país no ranking do VALORANT, hoje na divisão mais alta dos torneios do jogo.',
        image: { src: '/images/about/imagem-6.png', alt: 'VALORANT' },
      },
      {
        name: 'LEAGUE OF LEGENDS',
        text: 'Os atuais titãs do cenário universitário, com a maior série invicta da história, ainda em andamento.',
        achievements: ['Campeão do JUBs 2025', 'Campeão da Copa Aliança 2025'],
        detail: 'Invicto há 34 partidas, não perde há mais de 1 ano. No período conquistou o JUBs 2025, a Copa Aliança 2025 e a Liga Brasileira de Esports Universitários (LBEU), além de se classificar invicto ao JUBs 2026.',
        image: { src: '/images/about/imagem-7.png', alt: 'League of Legends' },
      },
    ],
    prospectsTitle: 'AS JOVENS PROMESSAS',
    prospectsSubtitle: 'sedentas pelo primeiro título',
    prospects: [
      { name: 'EA FC', text: 'Estreante nos torneios universitários, mas disputando como quem já está acostumado a vencer.' },
      { name: 'BRAWL STARS', text: 'Equipe formada há 2 meses que já desbancou algumas das melhores equipes do país para figurar entre os 8 melhores times do JUBs de Brawl Stars.' },
    ],
  },
  players: {
    title: 'AS NOSSAS ESTRELAS',
    subtitle: 'OS MELHORES ESTÃO AQUI',
    text: 'Dois atletas da Azure Bears foram eleitos os melhores jogadores universitários do Brasil em suas modalidades.',
    entries: [
      { award: '★ MELHOR DO ANO · 2024', name: 'TAEK', game: 'VALORANT', text: 'Melhor jogador universitário de VALORANT do Brasil.', image: { src: '/images/about/imagem-8.png', alt: 'TAEK' } },
      { award: '★ MELHOR DO ANO · 2025', name: 'KASAI', game: 'LEAGUE OF LEGENDS', text: 'Melhor jogador universitário de League of Legends do Brasil.', image: { src: '/images/about/imagem-9.png', alt: 'KASAI' } },
    ],
  },
  community: {
    title: 'MUITO ALÉM DO JUBS',
    subtitle: 'A AZURE VAI MUITO ALÉM DA COMPETIÇÃO',
    text: 'Durante o ano inteiro promovemos eventos abertos à comunidade: watch parties, ativações e campeonatos internos dentro de uma das maiores universidades tecnológicas do país, com 5.100+ servidores e 3.600 empresas parceiras. Patrocinar a Azure é estar presente na rotina de quem constrói o futuro.',
    stats: [
      { value: '36 MIL', label: 'alunos matriculados na UTFPR' },
      { value: '13', label: 'campi por todo o Paraná' },
      { value: '+64 MIL', label: 'profissionais já formados, uma rede ativa no mercado' },
    ],
    images: [
      { src: '/images/about/imagem-10.png', alt: 'Comunidade' },
      { src: '/images/about/imagem-11.png', alt: 'Comunidade' },
      { src: '/images/about/imagem-12.png', alt: 'Comunidade' },
    ],
  },
}
