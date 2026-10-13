import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navigation, secondaryNavigation } from '../data/site'
import { Brand } from './Brand'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open) element.showModal()
    else element.close()
    const previousOverflow = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" aria-label="Azure Bears — início">
            <Brand />
          </Link>
          <nav className="desktop-navigation" aria-label="Navegação principal">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/#comunidade" className="header-cta">
            Faça parte <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            className="mobile-menu-toggle icon-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-dialog"
        aria-label="Menu principal"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
      >
        <div className="mobile-dialog-inner">
          <div className="flex items-center justify-between">
            <Brand />
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X />
            </button>
          </div>
          <nav aria-label="Navegação mobile" className="mobile-navigation">
            {navigation.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setOpen(false)}
              >
                <span className="menu-index">0{index + 1}</span>
                {item.label}
                <ArrowUpRight size={20} aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
          <div className="mobile-secondary">
            {secondaryNavigation.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="eyebrow text-muted">Da universidade para o jogo.</p>
        </div>
      </dialog>
    </>
  )
}
