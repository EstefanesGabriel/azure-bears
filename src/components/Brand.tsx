import { site } from '../data/site'

export function Brand({ large = false }: { large?: boolean }) {
  return site.logoUrso ? (
    <div className="brand-container">
      <img
        className={large ? 'brand-image brand-image-large' : 'brand-image'}
        src={site.logoUrso.src}
        alt={site.logoUrso.alt}
      />

      {site.logoLetras && (
        <img
          className={large ? 'brand-image brand-image-large' : 'brand-image'}
          src={site.logoLetras.src}
          alt={site.logoLetras.alt}
        />
      )}
    </div>
  ) : (
    <span
      className={`brand ${large ? 'brand-large' : ''}`}
      aria-label={site.name}
    >
      <span>AZURE</span>
      <span>
        BEARS<span className="brand-dot">.</span>
      </span>
    </span>
  )
}