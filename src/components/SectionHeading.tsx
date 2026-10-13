import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  id: string
  eyebrow: string
  title: string
  link?: { to: string; label: string }
}

export function SectionHeading({ id, eyebrow, title, link }: Props) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow section-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {link && (
        <Link className="text-link" to={link.to}>
          {link.label}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
