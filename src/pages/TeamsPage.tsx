import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Crosshair, Search, Users, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { site } from '../data/site'
import { findTeamRoute, visibleLines, visibleModalities, visiblePlayers, type TeamModality, type TeamPlayer } from '../data/teams'
import type { ImageAsset } from '../models/content'
import '../styles/teams.css'

function TeamImage({ image, label, portrait = false }: { image: ImageAsset; label: string; portrait?: boolean }) {
  const [failedSource, setFailedSource] = useState('')
  return <span className={`squad-photo ${portrait ? 'squad-photo-portrait' : ''}`}>
    <span className="squad-photo-placeholder" aria-hidden="true">
      <span className="squad-photo-cross">+</span>
      <img src={site.symbol} alt="" className="squad-photo-brand" />
      <span className="squad-photo-caption">{label}<small>Foto em breve</small></span>
    </span>
    {image.src && failedSource !== image.src && <img className="squad-photo-image" src={image.src} alt={image.alt} loading="lazy" decoding="async" onError={() => setFailedSource(image.src)} />}
  </span>
}

function GameMark({ game }: { game: TeamModality }) {
  const [failed, setFailed] = useState(false)
  return <span className="squad-game-mark" aria-hidden="true">
    {failed ? <Crosshair strokeWidth={1} /> : <img src={game.icon} alt="" loading="lazy" onError={() => setFailed(true)} />}
  </span>
}

function TeamBreadcrumb({ game, lineName }: { game?: TeamModality; lineName?: string }) {
  return <nav className="squad-breadcrumb" aria-label="Navegação das equipes">
    <Link to="/equipes">Equipes</Link>
    {game && <><span aria-hidden="true">/</span>{lineName ? <Link to={`/equipes/${game.id}`}>{game.name}</Link> : <span aria-current="page">{game.name}</span>}</>}
    {lineName && <><span aria-hidden="true">/</span><span aria-current="page">{lineName}</span></>}
  </nav>
}

function JoinTeam() {
  return <aside className="squad-join" data-reveal>
    <div><p className="eyebrow">O próximo capítulo pode ser seu</p><h2>SUA HISTÓRIA.<br />NOSSA CAMISA.</h2></div>
    <Link className="button button-white" to="/seletivas">Conheça as seletivas <ArrowUpRight size={20} aria-hidden="true" /></Link>
  </aside>
}

function TeamsIndex() {
  const [search, setSearch] = useState('')
  const games = visibleModalities()
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const shown = games.filter((game) => normalize([game.name, game.category, ...(game.aliases ?? [])].join(' ')).includes(normalize(search.trim())))
  return <div className="squad-page">
    <section className="squad-hero page-container" data-parallax>
      <div className="squad-hero-copy">
        <p className="eyebrow squad-kicker" data-reveal><span /> Azure Bears / Equipes</p>
        <h1 data-reveal>VÁRIOS JOGOS.<br /><span>A MESMA</span><br />CAMISA.</h1>
        <p className="squad-intro" data-reveal>Escolha o seu jogo. Descubra nossas lines. Conheça as pessoas por trás de cada partida.</p>
        <a className="text-link" href="#modalidades">Explore as modalidades <ArrowDown size={18} aria-hidden="true" /></a>
      </div>
      <div className="squad-hero-art" aria-hidden="true">
        <span className="squad-art-top">AZURE / TEAM SELECT</span>
        <div className="squad-art-frame"><img src={site.symbol} alt="" /><span className="squad-art-target" /></div>
        <span className="squad-art-type">BEARS</span>
        <span className="squad-art-bottom">UM TIME COMEÇA COM QUEM JOGA JUNTO. <Crosshair size={24} /></span>
      </div>
    </section>
    <div className="squad-ribbon" aria-hidden="true"><span>AZURE BEARS</span><span>+</span><span>JOGAMOS JUNTOS.</span><span>+</span><span>AZURE BEARS</span><span>+</span><span>JOGAMOS JUNTOS.</span></div>
    <section id="modalidades" className="page-container squad-section" aria-labelledby="squad-games-title">
      <div className="squad-section-top" data-reveal>
        <div><p className="eyebrow text-accent">01 / Escolha sua modalidade</p><h2 id="squad-games-title">DENTRO DO JOGO.</h2></div>
        <label className="squad-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar modalidade</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Qual é o seu jogo?" /></label>
      </div>
      <p className="squad-result-count" role="status">{shown.length} {shown.length === 1 ? 'modalidade' : 'modalidades'}</p>
      <div className="squad-games">
        {shown.map((game) => <Link to={`/equipes/${game.id}`} key={game.id} className={`squad-game ${game.id === 'valorant' ? 'squad-game-featured' : ''}`} data-reveal data-motion-card>
          <div className="squad-game-top"><span className="eyebrow">{game.category}</span><span className="squad-index">{String(games.indexOf(game) + 1).padStart(2, '0')}</span></div>
          <GameMark game={game} />
          <div className="squad-game-bottom"><div><h3>{game.name}</h3><span>Explore as lines</span></div><span className="squad-round-arrow"><ArrowUpRight aria-hidden="true" /></span></div>
        </Link>)}
      </div>
      {!shown.length && <div className="squad-empty"><p>Nenhuma modalidade encontrada.</p><button type="button" className="text-link" onClick={() => setSearch('')}>Mostrar todas <ArrowRight size={17} /></button></div>}
      <JoinTeam />
    </section>
  </div>
}

function MissingTeam() {
  return <section className="page-container squad-section squad-missing"><p className="eyebrow text-accent">Fora da seleção</p><h1>ESSA EQUIPE NÃO ESTÁ DISPONÍVEL.</h1><Link to="/equipes" className="button button-white"><ArrowLeft size={18} /> Ver modalidades</Link></section>
}

function GameTeams({ game }: { game: TeamModality }) {
  const lines = visibleLines(game)
  return <div className="squad-page page-container">
    <TeamBreadcrumb game={game} />
    <header className="squad-game-header" data-reveal><div><p className="eyebrow text-accent">02 / Encontre sua line</p><h1>{game.name}</h1><p>O mesmo jogo. Diferentes histórias. Escolha uma line para conhecer o elenco.</p></div><GameMark game={game} /></header>
    <section className="squad-lines" aria-label={`Lines de ${game.name}`}>
      {lines.map((line, index) => <Link className="squad-line" key={line.id} to={`/equipes/${game.id}/${line.id}`} data-reveal>
        <TeamImage image={line.photo} label={line.name} />
        <div className="squad-line-copy"><span className="squad-line-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="eyebrow">{game.name}</p><h2>{line.name}</h2>{line.placeholder && <span className="squad-tag">Elenco a anunciar</span>}<p>{line.description}</p><span className="text-link">Conheça os jogadores <ArrowUpRight size={20} aria-hidden="true" /></span></div>
      </Link>)}
      {!lines.length && <div className="squad-empty"><Users size={32} /><h2>UM NOVO CAPÍTULO.</h2><p>As lines desta modalidade serão apresentadas em breve.</p></div>}
    </section>
    <JoinTeam />
  </div>
}

function PlayerProfile({ player, game, lineName, onClose }: { player: TeamPlayer; game: TeamModality; lineName: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus({ preventScroll: true }) }
  }, [])
  return <dialog ref={dialog} className="squad-profile" aria-labelledby="player-profile-name" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="squad-profile-inner">
      <button type="button" className="squad-close" onClick={onClose} aria-label="Fechar perfil" autoFocus><X size={23} /></button>
      <TeamImage image={player.photo} portrait label={player.nickname} />
      <div className="squad-profile-copy"><p className="eyebrow text-accent">{game.name} / {lineName}</p><h2 id="player-profile-name">{player.nickname}</h2>
        {player.name && <p className="squad-player-name">{player.name}</p>}
        <span className="squad-tag">{player.role || (player.placeholder ? 'Jogador a anunciar' : 'Azure Bears')}</span>
        <p>{player.bio || (player.placeholder ? 'Em breve, este espaço ganha nome, rosto e uma história para você conhecer.' : 'Representando a Azure Bears dentro do jogo.')}</p>
        {player.course && <dl><dt>Na universidade</dt><dd>{player.course}</dd></dl>}
        {!!player.socials?.length && <div className="squad-socials">{player.socials.filter((social) => /^https:\/\//.test(social.url)).map((social) => <a className="text-link" key={social.url} href={social.url} target="_blank" rel="noopener noreferrer">{social.label} <ArrowUpRight size={16} /></a>)}</div>}
        <span className="squad-profile-signature">AZURE BEARS / UTFPR</span>
      </div>
    </div>
  </dialog>
}

export function TeamsPage() {
  const { gameId, lineId } = useParams()
  const { game, line } = findTeamRoute(gameId, lineId)
  const [selectedPlayer, setSelectedPlayer] = useState<TeamPlayer | null>(null)
  useEffect(() => { setSelectedPlayer(null) }, [gameId, lineId])
  if (!gameId) return <TeamsIndex />
  if (!game || (lineId && !line)) return <MissingTeam />
  if (!line) return <GameTeams key={game.id} game={game} />
  const players = visiblePlayers(line)
  return <div className="squad-page page-container">
    <TeamBreadcrumb game={game} lineName={line.name} />
    <header className="squad-roster-hero" data-reveal>
      <div><Link className="text-link" to={`/equipes/${game.id}`}><ArrowLeft size={17} /> Todas as lines</Link><p className="eyebrow text-accent">{game.name} / Azure Bears</p><h1>{line.name}</h1><p>{line.description}</p>{line.placeholder && <span className="squad-tag">Apresentação em preparação</span>}</div>
      <TeamImage image={line.photo} label={line.name} />
    </header>
    <section className="squad-roster-section" aria-labelledby="roster-title">
      <div className="squad-section-top" data-reveal><div><p className="eyebrow text-accent">03 / Por trás de cada jogada</p><h2 id="roster-title">CONHEÇA O ELENCO.</h2></div><p>Escolha um jogador.<br />Conheça sua história.</p></div>
      <div className="squad-players">{players.map((player, index) => <button className="squad-player" type="button" key={player.id} onClick={() => setSelectedPlayer(player)} aria-label={`Conhecer ${player.nickname}`} data-reveal data-motion-card>
        <span className="squad-player-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><TeamImage image={player.photo} portrait label={game.name} />
        <span className="squad-player-info"><span><span className="squad-player-role">{player.role || (player.placeholder ? 'A anunciar' : 'Azure Bears')}</span><strong>{player.nickname}</strong></span><ArrowUpRight size={22} aria-hidden="true" /></span>
      </button>)}</div>
      {!players.length && <div className="squad-empty"><p>Os jogadores desta line serão apresentados em breve.</p></div>}
    </section>
    <JoinTeam />
    {selectedPlayer && <PlayerProfile key={`${game.id}/${line.id}/${selectedPlayer.id}`} player={selectedPlayer} game={game} lineName={line.name} onClose={() => setSelectedPlayer(null)} />}
  </div>
}
