import { useState } from 'react'

export function GameIcon({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span className="recruit-game-icon" aria-hidden="true">
      {!failed && <img src={src} alt="" width={56} height={56} onError={() => setFailed(true)} />}
    </span>
  )
}
