import type { ImageAsset } from '../models/content'

export function Media({
  image,
  label,
  className = '',
}: {
  image?: ImageAsset
  label: string
  className?: string
}) {
  return (
    <div className={`content-media ${className}`}>
      {image ? (
        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
      ) : (
        <div className="media-fallback" aria-hidden="true">
          <span>AZURE BEARS</span>
          <strong>{label}</strong>
          <span>DA UNIVERSIDADE PARA O JOGO.</span>
        </div>
      )}
    </div>
  )
}
