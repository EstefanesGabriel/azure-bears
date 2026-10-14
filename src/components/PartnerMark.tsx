import { useState } from 'react'
import type { Partner } from '../models/content'

export function PartnerMark({ partner }: { partner: Partner }) {
  const [imageFailed, setImageFailed] = useState(false)
  const content = partner.logo && !imageFailed ? (
    <img
      src={partner.logo.src}
      alt={partner.logo.alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <span className="partner-name">{partner.name}</span>
  )

  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  )
}
