import { ArrowDown, ArrowUpRight, Asterisk, MoveUpRight } from 'lucide-react'
import { PartnerMark } from '../components/PartnerMark'
import { visiblePartners } from '../data/partners'
import { site } from '../data/site'
import '../styles/partners.css'

export function PartnersPage() {
  const partners = visiblePartners()

  return (
    <div className="allies-page">
      <section className="page-container allies-hero" aria-labelledby="allies-title">
        <div data-reveal>
          <p className="eyebrow text-accent">Azure Bears / Parceiros</p>
          <h1 id="allies-title">JUNTOS,<br />O JOGO VAI<br /><span>MAIS LONGE.</span></h1>
        </div>
        <div className="allies-hero-side" data-reveal>
          <div className="allies-emblem" aria-hidden="true"><Asterisk /><MoveUpRight /></div>
          <p>Por trás de cada novo capítulo, existem conexões que fazem a diferença. Conheça quem caminha com a Azure Bears.</p>
          <a href="#nossos-parceiros" className="text-link">Conheça nossos parceiros <ArrowDown size={18} aria-hidden="true" /></a>
        </div>
      </section>

      <div className="allies-band" aria-hidden="true"><span>COMUNIDADE</span><Asterisk /><span>CONEXÃO</span><Asterisk /><span>COMPETIÇÃO</span></div>

      <section id="nossos-parceiros" className="page-container allies-list" aria-labelledby="allies-list-title">
        <div className="allies-list-heading" data-reveal>
          <div><p className="eyebrow text-accent">Do nosso lado</p><h2 id="allies-list-title">QUEM JOGA JUNTO.</h2></div>
          <span>AZURE BEARS × PARCEIROS</span>
        </div>
        {partners.map((partner) => (
          <article className="allies-partner" key={partner.id} aria-labelledby={`partner-${partner.id}`}>
            <div className="allies-logo" data-reveal>
              <PartnerMark key={`${partner.id}-${partner.logo?.src ?? ''}`} partner={partner} />
            </div>
            <div className="allies-copy" data-reveal>
              <p className="eyebrow">{partner.category || 'Parceiro'} Azure Bears</p>
              <h3 id={`partner-${partner.id}`}>{partner.name}</h3>
              {partner.headline && <h4>{partner.headline}</h4>}
              {partner.description?.map((paragraph, paragraphIndex) => <p className="allies-description" key={paragraphIndex}>{paragraph}</p>)}
              {partner.url && <a className="text-link" href={partner.url} target="_blank" rel="noopener noreferrer">Conheça {partner.name} <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></a>}
            </div>
          </article>
        ))}
        {!partners.length && <p className="allies-empty">Novas conexões estão a caminho. Em breve, conheça os parceiros da Azure Bears por aqui.</p>}
      </section>

      <section className="allies-contact" aria-labelledby="allies-contact-title">
        <div className="page-container allies-contact-inner" data-reveal>
          <div><p className="eyebrow">O próximo capítulo pode ser com você</p><h2 id="allies-contact-title">SUA MARCA.<br />NO NOSSO TIME.</h2></div>
          <div><p>Vamos conversar sobre como fazer parte do universo da Azure Bears?</p><span className="allies-email">{site.contactEmail}</span></div>
        </div>
      </section>
    </div>
  )
}
