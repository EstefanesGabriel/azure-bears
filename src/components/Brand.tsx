import { site } from '../data/site'

export function Brand({ large = false }: { large?: boolean }) {
  return site.logo ? (
    <img
      className={large ? 'brand-image brand-image-large' : 'brand-image'}
      src={site.logo.src}
      alt={site.logo.alt}
      width={110}
      height={58}
    />
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
