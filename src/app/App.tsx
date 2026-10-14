import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { navigation, secondaryNavigation } from '../data/site'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { HomePage } from '../pages/HomePage'
import { RecruitmentPage } from '../pages/RecruitmentPage'
import { AboutPage } from '../pages/AboutPage'

const pages = [...navigation.slice(1), ...secondaryNavigation]

function PendingPage({ title }: { title: string }) {
  return (
    <section className="page-container pending-page">
      <p className="eyebrow text-accent">Nosso universo está crescendo</p>
      <h1>
        {title.toUpperCase()}
        <span className="text-accent">.</span>
      </h1>
      <p>
        Esta parte da Azure está sendo preparada.
        <br />
        Em breve, você encontra tudo por aqui.
      </p>
      <Link to="/" className="button button-white">
        <ArrowLeft size={18} aria-hidden="true" />
        Voltar para o início
      </Link>
      <span className="pending-watermark" aria-hidden="true">
        AZURE
      </span>
    </section>
  )
}

function NotFoundPage() {
  return (
    <section className="page-container pending-page">
      <p className="eyebrow text-accent">404 · Fora do mapa</p>
      <h1>
        ESSA ROTA
        <br />
        NÃO ESTÁ NO JOGO.
      </h1>
      <p>A página que você procura não foi encontrada.</p>
      <Link to="/" className="button button-white">
        Voltar para o início
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  )
}

export function App() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    const page = pages.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    )
    document.title =
      pathname === '/'
        ? 'Azure Bears — O jogo é nosso'
        : `${page?.label ?? 'Página não encontrada'} — Azure Bears`
    const frame = requestAnimationFrame(() => {
      if (hash)
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'instant'
              : 'smooth',
          })
      else window.scrollTo({ top: 0, behavior: 'instant' })
      if (previousPath.current !== pathname)
        document.getElementById('conteudo')?.focus({ preventScroll: true })
      previousPath.current = pathname
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return (
    <>
      <SiteHeader />
      <main id="conteudo" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/seletivas" element={<RecruitmentPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          {pages.filter((page) => page.path !== '/seletivas' && page.path !== '/sobre').map((page) => (
            <Route
              key={page.path}
              path={`${page.path}/*`}
              element={<PendingPage title={page.label} />}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  )
}
