import { useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
}
declare global { interface Window { turnstile?: TurnstileApi } }
let loading: Promise<TurnstileApi> | undefined
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loading) return loading
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => finish(new Error('timeout')), 15_000)
    function finish(error?: Error) {
      clearTimeout(timeout)
      script.onload = script.onerror = null
      if (error || !window.turnstile) { script.remove(); loading = undefined; reject(error ?? new Error('unavailable')) }
      else resolve(window.turnstile)
    }
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => finish()
    script.onerror = () => finish(new Error('unavailable'))
    document.head.append(script)
  })
  return loading
}

export function Turnstile({ siteKey, action, refresh, onToken, onError }: {
  siteKey: string; action: string; refresh: number; onToken: (token: string) => void; onError: () => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onToken, onError })
  callbacks.current = { onToken, onError }
  useEffect(() => {
    let disposed = false
    let widget: string | undefined
    let api: TurnstileApi | undefined
    loadTurnstile().then((loaded) => {
      if (disposed || !container.current) return
      api = loaded
      widget = api.render(container.current, {
        sitekey: siteKey, action, theme: 'dark', size: 'flexible',
        callback: (token: string) => { if (!disposed) callbacks.current.onToken(token) },
        'expired-callback': () => { if (!disposed) callbacks.current.onToken('') },
        'error-callback': () => { if (!disposed) { callbacks.current.onToken(''); callbacks.current.onError() } },
      })
    }).catch(() => { if (!disposed) callbacks.current.onError() })
    return () => { disposed = true; if (widget !== undefined) api?.remove(widget) }
  }, [siteKey, action, refresh])
  return <div ref={container} className="submission-challenge" />
}
