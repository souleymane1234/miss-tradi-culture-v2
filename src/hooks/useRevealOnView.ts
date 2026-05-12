import { useEffect, useRef, useState } from 'react'

export function useRevealOnView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || isVisible) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          ob.disconnect()
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08, ...options },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [isVisible])

  return { ref, isVisible }
}
