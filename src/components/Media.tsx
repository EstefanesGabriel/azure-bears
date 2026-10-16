import { useState } from 'react'
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
  const [failedSrc, setFailedSrc] = useState<string>()
  return (
    <div className={`content-media ${className}`}>
      {image && image.src !== failedSrc ? (
        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" onError={() => setFailedSrc(image.src)} />
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
