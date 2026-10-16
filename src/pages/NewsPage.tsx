import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Media } from '../components/Media'
import { formatNewsDate, visibleNews } from '../data/news'
import type { NewsItem } from '../models/content'
import '../styles/news.css'

function NewsMeta({ item }: { item: NewsItem }) {
  return <p className="journal-meta"><span>{item.category}</span><time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time></p>
}

function NewsLink({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return <Link to={`/noticias/${item.slug}`} className={`journal-story${featured ? ' journal-featured' : ''}`} data-reveal>
    <Media image={item.image} label={item.category.toUpperCase()} />
    <div className="journal-story-copy"><NewsMeta item={item} /><h3>{item.title}</h3><p>{item.summary}</p><span className="text-link">Ler notícia <ArrowUpRight size={18} aria-hidden="true" /></span></div>
  </Link>
}

function NewsList() {
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const items = visibleNews()
  const categories = [...new Set(items.map((item) => item.category))]
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const filtered = items.filter((item) => (!category || item.category === category) && normalize(`${item.title} ${item.summary} ${item.category}`).includes(normalize(query.trim())))
  const [featured, ...rest] = filtered

  return <div className="journal-page">
    <section className="page-container journal-hero" aria-labelledby="journal-title">
      <div data-reveal><p className="eyebrow text-accent">Azure Bears / Notícias</p><h1 id="journal-title">O JOGO PASSA.<br /><span>A HISTÓRIA FICA.</span></h1></div>
      <div className="journal-intro" data-reveal><p>Do servidor ao campus. Acompanhe as histórias, os encontros e tudo que movimenta a Azure.</p><a href="#publicacoes" className="text-link">Explore as notícias <ArrowDown size={18} aria-hidden="true" /></a></div>
    </section>
    <section id="publicacoes" className="page-container journal-publications" aria-labelledby="journal-list-title">
      <div className="journal-heading"><h2 id="journal-list-title">NO RADAR.</h2><span>O UNIVERSO AZURE EM PAUTA</span></div>
      <div className="journal-toolbar">
        <div className="journal-filters" aria-label="Categorias de notícias"><button type="button" aria-pressed={!category} onClick={() => setCategory('')}>Todas</button>{categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div>
        <label className="journal-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar notícias</span><input type="search" placeholder="Buscar no mural" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </div>
      <p className="journal-count" role="status">{filtered.length} {filtered.length === 1 ? 'publicação' : 'publicações'}</p>
      {featured ? <><NewsLink item={featured} featured /><div className="journal-grid">{rest.map((item) => <NewsLink key={item.id} item={item} />)}</div></> :
        <div className="journal-empty"><h3>{items.length ? 'Nenhuma notícia por aqui.' : 'O próximo capítulo vem aí.'}</h3><p>{items.length ? 'Experimente outra palavra ou categoria.' : 'As próximas novidades da Azure serão publicadas neste espaço.'}</p>{(query || category) && <button type="button" className="button button-white" onClick={() => { setQuery(''); setCategory('') }}>Limpar filtros</button>}</div>}
    </section>
  </div>
}

function NewsArticle({ slug }: { slug: string }) {
  const items = visibleNews()
  const item = items.find((entry) => entry.slug === slug)
  const related = items.filter((entry) => entry.slug !== slug).slice(0, 3)

  if (!item) return <section className="page-container journal-empty"><p className="eyebrow text-accent">Notícias</p><h1>NOTÍCIA NÃO ENCONTRADA.</h1><p>Esta publicação não está disponível.</p><Link className="button button-white" to="/noticias"><ArrowLeft size={18} aria-hidden="true" />Voltar às notícias</Link></section>

  return <div className="journal-page">
    <article className="page-container journal-article">
      <Link to="/noticias" className="text-link"><ArrowLeft size={18} aria-hidden="true" />Todas as notícias</Link>
      <header className="journal-article-header" data-reveal><NewsMeta item={item} /><h1>{item.title}</h1><p>{item.summary}</p></header>
      {item.image && <Media image={item.image} label="AZURE ATUAL" className="journal-cover" />}
      <div className="journal-body">{item.content.map((section, index) => <section key={index}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</section>)}</div>
      <div className="journal-article-end"><span>AZURE BEARS / DA UNIVERSIDADE PARA O JOGO.</span><Link className="text-link" to="/noticias">Voltar ao mural <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </article>
    {related.length > 0 && <section className="page-container journal-related" aria-labelledby="journal-related-title"><h2 id="journal-related-title">CONTINUE NO RADAR.</h2><div className="journal-grid">{related.map((entry) => <NewsLink key={entry.id} item={entry} />)}</div></section>}
  </div>
}

export function NewsPage() {
  const { slug } = useParams()
  return slug ? <NewsArticle key={slug} slug={slug} /> : <NewsList />
}
