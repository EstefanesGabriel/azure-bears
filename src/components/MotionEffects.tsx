import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Progressive enhancement: content stays visible when motion or JS is unavailable. */
export function MotionEffects() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let dispose = () => {}

    function start() {
      const main = document.getElementById('conteudo')
      if (!main || reducedMotion.matches) return () => {}
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
      const seen = new WeakSet<Element>()
      const animations = new Map<HTMLElement, Animation>()
      const pending = new Set<HTMLElement>()
      let pointerFrame = 0
      let scrollFrame = 0
      let latestPointer: PointerEvent | null = null
      let scrollDistance = 0
      let measureProgress = true
      let activeCard: HTMLElement | null = null
      let activeScene: HTMLElement | null = null
      const progress = document.querySelector<HTMLElement>('[data-page-progress]')

      const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
        let order = 0
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer?.unobserve(entry.target)
          const element = entry.target as HTMLElement
          pending.delete(element)
          if (!element.isConnected || document.hidden || element.contains(document.activeElement) || !element.animate) {
            element.removeAttribute('data-reveal-pending')
            return
          }
          // Promote only the elements entering the viewport, then release their layers.
          element.style.willChange = 'opacity, translate'
          const animation = element.animate([
            { opacity: 0, translate: '0 20px' },
            { opacity: 1, translate: '0 0' },
          ], { duration: 520, delay: Math.min(order++ * 35, 105), easing: 'cubic-bezier(.22, .61, .36, 1)', fill: 'backwards' })
          element.removeAttribute('data-reveal-pending')
          animations.set(element, animation)
          animation.onfinish = animation.oncancel = () => {
            if (animations.get(element) !== animation) return
            element.style.removeProperty('will-change')
            animations.delete(element)
          }
        })
      }, { threshold: 0, rootMargin: '0px 0px 64px 0px' })

      function register(node: HTMLElement) {
        const elements = [...node.querySelectorAll<HTMLElement>('[data-reveal]')]
        if (node.matches('[data-reveal]')) elements.unshift(node)
        elements.forEach((element) => {
          if (seen.has(element)) return
          seen.add(element)
          if (!observer || !element.animate || document.hidden || element.contains(document.activeElement)) return
          // Set the starting state before paint, never after visible text has appeared.
          element.setAttribute('data-reveal-pending', '')
          pending.add(element)
          observer?.observe(element)
        })
      }
      register(main)
      const mutations = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => { if (node instanceof HTMLElement) register(node) })
          record.removedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return
            const elements = [node, ...node.querySelectorAll<HTMLElement>('[data-reveal]')]
            elements.forEach((element) => {
              observer?.unobserve(element)
              animations.get(element)?.cancel()
              pending.delete(element)
              element.removeAttribute('data-reveal-pending')
            })
          })
        })
        invalidateProgress()
      })
      mutations.observe(main, { childList: true, subtree: true })
      const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(invalidateProgress)
      resizeObserver?.observe(document.body)

      function resetCard() {
        activeCard?.style.removeProperty('--tilt-x')
        activeCard?.style.removeProperty('--tilt-y')
        activeCard?.style.removeProperty('--glow-x')
        activeCard?.style.removeProperty('--glow-y')
        activeCard?.removeAttribute('data-pointer-active')
        activeCard = null
      }
      function resetScene() {
        activeScene?.style.removeProperty('--scene-x')
        activeScene?.style.removeProperty('--scene-y')
        activeScene = null
      }
      function resetPointer() {
        cancelAnimationFrame(pointerFrame)
        pointerFrame = 0
        latestPointer = null
        resetCard()
        resetScene()
      }
      function onPointerMove(event: PointerEvent) {
        if (!finePointer.matches || event.pointerType !== 'mouse' || document.hidden) return
        latestPointer = event
        if (pointerFrame) return
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0
          const pointer = latestPointer
          if (!pointer) return
          const target = pointer.target instanceof Element ? pointer.target : null
          const card = target?.closest<HTMLElement>('[data-motion-card]') ?? null
          const scene = target?.closest<HTMLElement>('[data-parallax]') ?? null
          // Finish geometry reads before changing any styles in this frame.
          const cardRect = card?.getBoundingClientRect()
          const sceneRect = scene?.getBoundingClientRect()
          if (activeCard !== card) resetCard()
          if (activeScene !== scene) resetScene()
          if (card && cardRect) {
            activeCard = card
            const x = Math.max(0, Math.min(1, (pointer.clientX - cardRect.left) / cardRect.width))
            const y = Math.max(0, Math.min(1, (pointer.clientY - cardRect.top) / cardRect.height))
            card.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`)
            card.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`)
            card.style.setProperty('--glow-x', `${x * 100}%`)
            card.style.setProperty('--glow-y', `${y * 100}%`)
            card.setAttribute('data-pointer-active', '')
          }
          if (scene && sceneRect) {
            activeScene = scene
            const x = Math.max(-0.5, Math.min(0.5, (pointer.clientX - sceneRect.left) / sceneRect.width - 0.5))
            const y = Math.max(-0.5, Math.min(0.5, (pointer.clientY - sceneRect.top) / sceneRect.height - 0.5))
            scene.style.setProperty('--scene-x', `${x * 30}px`)
            scene.style.setProperty('--scene-y', `${y * 22}px`)
          }
        })
      }
      function scheduleProgress() {
        if (scrollFrame) return
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0
          if (measureProgress) {
            scrollDistance = document.documentElement.scrollHeight - window.innerHeight
            measureProgress = false
          }
          const fraction = scrollDistance > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollDistance)) : 0
          if (progress) progress.style.transform = `scaleX(${fraction})`
        })
      }
      function invalidateProgress() {
        measureProgress = true
        scheduleProgress()
      }
      function onResize() {
        resetPointer()
        invalidateProgress()
      }
      function onScroll() {
        resetPointer()
        scheduleProgress()
      }
      function onPointerOut(event: PointerEvent) { if (!event.relatedTarget) resetPointer() }
      function onFocus(event: FocusEvent) {
        pending.forEach((element) => {
          if (event.target instanceof Node && element.contains(event.target)) {
            observer?.unobserve(element)
            element.removeAttribute('data-reveal-pending')
            pending.delete(element)
          }
        })
        animations.forEach((animation, element) => {
          if (event.target instanceof Node && element.contains(event.target)) animation.cancel()
        })
      }
      function onVisibility() {
        if (document.hidden) {
          resetPointer()
          animations.forEach((animation) => animation.cancel())
        } else invalidateProgress()
      }

      document.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerout', onPointerOut)
      document.addEventListener('focusin', onFocus)
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
      window.addEventListener('blur', resetPointer)
      finePointer.addEventListener('change', resetPointer)
      scheduleProgress()

      return () => {
        observer?.disconnect()
        mutations.disconnect()
        resizeObserver?.disconnect()
        pending.forEach((element) => element.removeAttribute('data-reveal-pending'))
        animations.forEach((animation, element) => {
          animation.cancel()
          element.style.removeProperty('will-change')
        })
        animations.clear()
        resetPointer()
        cancelAnimationFrame(scrollFrame)
        progress?.style.removeProperty('transform')
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerout', onPointerOut)
        document.removeEventListener('focusin', onFocus)
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('blur', resetPointer)
        finePointer.removeEventListener('change', resetPointer)
      }
    }

    function syncPreference() {
      dispose()
      dispose = start()
    }
    syncPreference()
    reducedMotion.addEventListener('change', syncPreference)
    return () => {
      dispose()
      reducedMotion.removeEventListener('change', syncPreference)
    }
  }, [pathname])

  return <div className="page-scroll-progress" data-page-progress aria-hidden="true" />
}
