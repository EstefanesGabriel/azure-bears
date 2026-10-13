import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { navigation, secondaryNavigation, site } from '../data/site'
import { Brand } from './Brand'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        <div>
          <Link to="/" aria-label="Azure Bears — início">
            <Brand large />
          </Link>
          <p className="footer-tagline">
            Da universidade
            <br />
            para o jogo.
          </p>
        </div>
        <div>
          <p className="eyebrow footer-label">Explore</p>
          <nav className="footer-links" aria-label="Navegação do rodapé">
            {navigation.slice(1).map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="eyebrow footer-label">Faça parte</p>
          <nav className="footer-links" aria-label="Organização">
            {secondaryNavigation.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="eyebrow footer-label">Conecte-se</p>
          {site.socialLinks.length ? (
            <div className="footer-links">
              {site.socialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : (
            <p className="footer-social-empty">
              Nossos canais oficiais
              <br />
              estarão aqui em breve.
            </p>
          )}
          <p className="university-label">
            E-sports universitário <span>UTFPR</span>
          </p>
        </div>
      </div>
      <div className="page-container footer-bottom">
        <p>© {new Date().getFullYear()} Azure Bears</p>
        <span>COMUNIDADE. COMPETIÇÃO. CONEXÃO.</span>
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'instant'
                : 'smooth',
            })
          }
        >
          Voltar ao topo <ArrowUp size={15} aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}
