import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Pause,
  Play,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { home, modalities, news, partners, products } from '../data/home'
import { site } from '../data/site'
import { Media } from '../components/Media'
import { SectionHeading } from '../components/SectionHeading'
import { PartnerMark } from '../components/PartnerMark'

function Hero() {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!media.matches) video.current?.play().catch(() => setPlaying(false))
    const stop = () => {
      if (media.matches) video.current?.pause()
    }
    media.addEventListener('change', stop)
    return () => media.removeEventListener('change', stop)
  }, [])

  return (
    <section
      className={`hero ${site.heroImage || site.heroVideo ? 'hero-with-media' : ''}`}
      aria-labelledby="hero-title"
      data-parallax
    >
      {site.heroVideo ? (
        <video
          ref={video}
          className="hero-media"
          muted
          loop
          playsInline
          poster={site.heroImage?.src}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-hidden="true"
        >
          <source src={site.heroVideo} />
        </video>
      ) : site.heroImage ? (
        <img
          className="hero-media"
          src={site.heroImage.src}
          alt={site.heroImage.alt}
          fetchPriority="high"
        />
      ) : (
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-orbit orbit-three" />
          <img className="hero-emblem" src={site.symbol} alt="" />
          <div className="hero-cross cross-one">+</div>
          <div className="hero-cross cross-two">+</div>
          <span className="hero-coordinate">
            AZ / BR
            <br />
            PLAY TOGETHER.
          </span>
        </div>
      )}
      <div className="page-container hero-content">
        <div className="hero-topline">
          <p className="eyebrow">
            <span className="status-dot" />
            {home.hero.eyebrow}
          </p>
          <span className="eyebrow hero-edition">O NOSSO PRÓXIMO CAPÍTULO</span>
        </div>
        <div className="hero-body">
          <h1 id="hero-title" data-reveal>
            {home.hero.title[0]}
            <br />
            <span>{home.hero.title[1]}</span>
          </h1>
          <p className="hero-description" data-reveal>{home.hero.description}</p>
          <a href="#azure" className="button button-white" data-reveal>
            Conheça a Azure <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-bottom">
          <span className="hero-signature">
            AZURE BEARS<span>UNIVERSITY ESPORTS</span>
          </span>
          <a href="#novidades" className="hero-scroll">
            Explore nosso universo <ArrowDown size={19} aria-hidden="true" />
          </a>
        </div>
      </div>
      {site.heroVideo && (
        <button
          className="video-toggle icon-button"
          aria-label={
            playing ? 'Pausar vídeo de fundo' : 'Reproduzir vídeo de fundo'
          }
          onClick={() => {
            if (playing) video.current?.pause()
            else video.current?.play().catch(() => setPlaying(false))
          }}
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
      )}
    </section>
  )
}

function NewsSection() {
  const latest = [...news]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 3)
  return (
    <section
      id="novidades"
      className="page-container section-space"
      aria-labelledby="news-title"
    >
      <SectionHeading
        id="news-title"
        eyebrow={home.news.eyebrow}
        title={home.news.title}
        link={{ to: '/noticias', label: 'Todas as notícias' }}
      />
      {latest.length ? (
        <div className="news-grid">
          {latest.map((item) => (
            <Link
              to={`/noticias/${item.slug}`}
              key={item.id}
              className="news-card"
              data-reveal
              data-motion-card
            >
              <Media image={item.image} label="AZURE ATUAL" />
              <p className="eyebrow card-category">
                {item.category}{' '}
                <span>
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'medium',
                    timeZone: 'America/Sao_Paulo',
                  }).format(new Date(item.publishedAt))}
                </span>
              </p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="text-link">
                Ler notícia <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="news-empty" data-reveal>
          <div className="journal-art" aria-hidden="true">
            <span className="eyebrow">AZURE BEARS / JOURNAL</span>
            <div className="journal-circle" />
            <strong>
              BEAR
              <br />
              WITH US.
            </strong>
            <span className="journal-bottom">
              O PRÓXIMO CAPÍTULO É AZURE. <ArrowUpRight size={25} />
            </span>
          </div>
          <div className="news-empty-copy">
            <span className="small-label">
              <span className="status-dot" />
              Novidades em breve
            </span>
            <h3>{home.news.emptyTitle}</h3>
            <p>{home.news.emptyDescription}</p>
            <Link className="text-link" to="/noticias">
              Nosso espaço de notícias{' '}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

function TeamsSection() {
  return (
    <section
      className="teams-section section-space"
      aria-labelledby="teams-title"
    >
      <div className="page-container">
        <SectionHeading
          id="teams-title"
          eyebrow={home.teams.eyebrow}
          title={home.teams.title}
          link={{ to: '/equipes', label: 'Todas as equipes' }}
        />
        {modalities.length ? (
          <div className="teams-grid">
            {modalities.map((item) => (
              <Link
                className="team-card"
                data-reveal
                data-motion-card
                to={`/equipes/${item.slug}`}
                key={item.id}
              >
                <Media image={item.image} label={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="teams-empty" data-reveal>
            <div className="teams-wordmark" aria-hidden="true">
              <img className="teams-brand-lettering" src={site.wordmark} alt="" />
              <div className="teams-wordmark-caption">
                <Asterisk size={24} /> ONE NAME. ONE TEAM.
              </div>
            </div>
            <div className="teams-empty-copy">
              <p className="eyebrow">A mesma camisa. A mesma vontade.</p>
              <h3>{home.teams.emptyTitle}</h3>
              <p>{home.teams.emptyDescription}</p>
              <Link className="button button-outline" to="/equipes">
                Conheça nossas equipes{' '}
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function StoreSection() {
  const [category, setCategory] = useState('Todos')
  const visible = products
    .filter((product) => category === 'Todos' || product.category === category)
    .slice(0, 4)
  return (
    <section
      className="page-container section-space"
      aria-labelledby="store-title"
    >
      <SectionHeading
        id="store-title"
        eyebrow={home.store.eyebrow}
        title={home.store.title}
        link={{ to: '/loja', label: 'Explore a loja' }}
      />
      {products.length ? (
        <>
          <div
            className="category-filters"
            role="group"
            aria-label="Filtrar produtos"
          >
            {['Todos', 'Vestuário', 'Acessórios'].map((item) => (
              <button
                key={item}
                aria-pressed={item === category}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="products-grid" aria-live="polite">
            {visible.map((item) => (
              <Link
                className="product-card"
                data-reveal
                data-motion-card
                to={`/loja/${item.slug}`}
                key={item.id}
              >
                <Media image={item.image} label={item.name} />
                <h3>{item.name}</h3>
                {item.referencePrice !== undefined && (
                  <p>
                    Referência:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.referencePrice)}
                  </p>
                )}
                <span className="text-link">
                  Conhecer produto <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </Link>
            ))}
            {!visible.length && (
              <p className="text-muted">
                Ainda não há produtos nesta categoria.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="store-empty" data-reveal>
          <div className="store-art" aria-hidden="true">
            <span className="eyebrow">AZURE BEARS — OFF THE GAME</span>
            <span className="store-art-type">
              MAIS QUE
              <br />
              UMA
              <br />
              <span>CAMISA.</span>
            </span>
            <span className="store-art-bottom">
              É PERTENCER. <Asterisk size={36} />
            </span>
          </div>
          <div className="store-empty-copy">
            <span className="small-label">Loja oficial · Em breve</span>
            <h3>
              LEVE O NOSSO
              <br />
              NOME COM VOCÊ.
            </h3>
            <p>{home.store.emptyDescription}</p>
            <Link to="/loja" className="button button-white">
              Conheça a loja <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <span className="store-note">
              Solicitações de interesse.
              <br />
              Disponibilidade e compra combinadas com a equipe.
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

function PartnersSection() {
  return (
    <section className="partners-section" aria-labelledby="partners-title" data-reveal>
      <div className="page-container">
        <p className="eyebrow text-muted">Juntos, vamos além</p>
        <h2 id="partners-title">QUEM FORTALECE O NOSSO JOGO.</h2>
        {partners.length ? (
          <div className="partner-grid">
            {partners.map((partner) => (
              <PartnerMark
                key={`${partner.id}-${partner.logo?.src ?? ''}`}
                partner={partner}
              />
            ))}
          </div>
        ) : (
          <p className="partners-empty">
            Um espaço para as marcas e instituições que caminham com a Azure.
            <br />
            Nossos parceiros serão apresentados aqui em breve.
          </p>
        )}
        <Link to="/parceiros" className="text-link">
          Conheça nossos parceiros <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <div className="identity-strip" aria-hidden="true">
        <span>COMUNIDADE</span>
        <Asterisk />
        <span>COMPETIÇÃO</span>
        <Asterisk />
        <span>CONEXÃO</span>
        <Asterisk />
        <span className="strip-last">AZURE BEARS</span>
      </div>
      <section
        id="azure"
        className="page-container introduction"
        aria-labelledby="intro-title"
        data-reveal
      >
        <div>
          <p className="eyebrow text-muted">Muito além de uma partida</p>
          <h2 id="intro-title">
            DA UNIVERSIDADE.
            <br />
            <span className="text-accent">PARA O JOGO.</span>
          </h2>
        </div>
        <div className="intro-copy">
          <p>{site.description}</p>
          <Link className="text-link" to="/sobre">
            Essa é a nossa história{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <NewsSection />
      <TeamsSection />
      <StoreSection />
      <PartnersSection />
      <section
        id="comunidade"
        className="community-section"
        aria-labelledby="community-title"
      >
        <div className="page-container community-inner" data-reveal>
          <div>
            <p className="eyebrow">{home.community.eyebrow}</p>
            <h2 id="community-title">{home.community.title}</h2>
          </div>
          <div className="community-copy">
            <p>{home.community.description}</p>
            <Link to="/seletivas" className="button button-dark">
              Quero fazer parte <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <Link to="/diretoria" className="text-link">
              Conheça a organização <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <span className="community-decoration" aria-hidden="true">
          +
        </span>
      </section>
    </>
  )
}
