import { useState } from 'react'
import { Link } from 'react-router-dom'
import { about, aboutNavigation } from '../data/about'
import type { AboutImage } from '../data/about'
import '../styles/about.css'

function ImageSlot({ image, contain = false }: { image: AboutImage; contain?: boolean }) {
  const [status, setStatus] = useState<'pending' | 'loaded' | 'missing'>('pending')

  return (
    <div className={`about-image${contain ? ' about-image-contain' : ''}`} aria-hidden={status !== 'loaded' ? true : undefined}>
      {status !== 'missing' && <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className={status === 'loaded' ? 'is-loaded' : undefined}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('missing')}
      />}
    </div>
  )
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return <header className="about-section-heading" data-reveal>
    <p className="eyebrow text-accent">{label}</p>
    <h2>{title}</h2>
    {subtitle && <p className="about-subtitle">{subtitle}</p>}
  </header>
}

export function AboutPage() {
  return (
    <div className="about-page">
      <header className="page-container about-intro">
        <h1 data-reveal>Sobre Nós</h1>
        <nav className="about-index" aria-label="Seções de Sobre Nós">
          {aboutNavigation.map((item) => <Link key={item.id} to={`/sobre#${item.id}`}>{item.label}</Link>)}
        </nav>
      </header>

      <section id="historia" className="page-container about-section">
        <SectionTitle label="História" title={about.history.title} subtitle={about.history.subtitle} />
        <ol className="about-timeline">
          {about.history.milestones.map((milestone) => <li key={milestone.label} data-reveal>
            <h3>{milestone.label}</h3>
            <ImageSlot image={milestone.image} contain />
          </li>)}
        </ol>
        <p className="about-history-copy about-prose" data-reveal>{about.history.text}</p>
      </section>

      <section id="conquistas" className="about-band">
        <div className="page-container about-section">
          <SectionTitle label="Conquistas estaduais e regionais" title={about.regional.title} />
          <div className="about-regional-intro" data-reveal>
            <div className="about-title-count"><strong>{about.regional.count}</strong><p>{about.regional.countLabel}</p></div>
            <div>
              <p className="about-prose">{about.regional.text}</p>
              <ul className="about-game-tags">{about.regional.games.map((game) => <li key={game}>{game}</li>)}</ul>
            </div>
          </div>
          <div className="about-results-grid">
            {about.regional.results.map((result) => <article className="about-result" key={result.event} data-reveal>
              <ImageSlot image={result.image} />
              <div className="about-result-copy">
                <h3>{result.event}</h3>
                <p className="eyebrow">{result.game}</p>
                <p className="about-result-place">{result.result}</p>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="nacionais" className="page-container about-section">
        <SectionTitle label="Resultados nacionais" title={about.national.title} subtitle={about.national.subtitle} />
        <div className="about-national-layout">
          <ul className="about-national-results">
            {about.national.results.map((result) => <li key={result} data-reveal>{result}</li>)}
          </ul>
          <div className="about-national-images" data-reveal>
            {about.national.images.map((image) => <ImageSlot key={image.src} image={image} />)}
          </div>
        </div>
      </section>

      <section id="cenario" className="about-band">
        <div className="page-container about-section">
          <SectionTitle label="Entenda o cenário" title={about.scene.title} subtitle={about.scene.subtitle} />
          <div className="about-scene-grid">
            {about.scene.blocks.map((block) => <article className="about-scene-block" key={block.title} data-reveal>
              <header><h3>{block.title}</h3>{block.subtitle && <p>{block.subtitle}</p>}</header>
              <div className="about-prose">{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <div className="about-importance"><h4 className="eyebrow text-accent">{block.importanceTitle}</h4><p>{block.importance}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="equipes" className="page-container about-section">
        <SectionTitle label="Nossas equipes" title={about.teams.title} subtitle={about.teams.subtitle} />
        <header className="about-group-heading"><h3>{about.teams.veteransTitle}</h3><p>{about.teams.veteransSubtitle}</p></header>
        <div className="about-teams-grid">
          {about.teams.veterans.map((team) => <article className="about-team" key={team.name} data-reveal>
            <ImageSlot image={team.image} />
            <div className="about-team-copy">
              <h4>{team.name}</h4>
              <p className="about-prose">{team.text}</p>
              <ul className="about-team-achievements">{team.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
              <p className="about-prose">{team.detail}</p>
            </div>
          </article>)}
        </div>
        <header className="about-group-heading about-prospects-heading"><h3>{about.teams.prospectsTitle}</h3><p>{about.teams.prospectsSubtitle}</p></header>
        <div className="about-prospects-grid">
          {about.teams.prospects.map((team) => <article key={team.name} data-reveal><h4>{team.name}</h4><p className="about-prose">{team.text}</p></article>)}
        </div>
      </section>

      <section id="jogadores" className="about-band">
        <div className="page-container about-section">
          <SectionTitle label="Jogadores premiados" title={about.players.title} subtitle={about.players.subtitle} />
          <p className="about-prose about-players-intro">{about.players.text}</p>
          <div className="about-players-grid">
            {about.players.entries.map((player) => <article className="about-player" key={player.name} data-reveal>
              <ImageSlot image={player.image} />
              <div className="about-player-copy">
                <p className="eyebrow text-accent">{player.award}</p>
                <h3>{player.name}</h3>
                <p className="about-player-game">{player.game}</p>
                <p className="about-prose">{player.text}</p>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="comunidade" className="page-container about-section">
        <SectionTitle label="Comunidade" title={about.community.title} subtitle={about.community.subtitle} />
        <p className="about-prose about-community-copy" data-reveal>{about.community.text}</p>
        <dl className="about-community-stats">
          {about.community.stats.map((stat) => <div key={stat.value} data-reveal><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
        </dl>
        <div className="about-community-gallery" data-reveal>
          {about.community.images.map((image) => <ImageSlot key={image.src} image={image} />)}
        </div>
      </section>
    </div>
  )
}
