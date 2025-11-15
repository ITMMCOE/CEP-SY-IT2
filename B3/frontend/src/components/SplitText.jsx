import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'

export default function SplitText({
  text = '',
  className = '',
  delay = 60, // ms between each piece
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars', // 'chars' | 'words'
  from = { opacity: 0, y: 20 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  textAlign = 'left',
  tag = 'div',
}) {
  const containerRef = useRef(null)
  const parts = useMemo(() => {
    if (splitType === 'words') return text.split(/(\s+)/)
    // default chars
    return Array.from(text)
  }, [text, splitType])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const children = Array.from(el.querySelectorAll('[data-split-item]'))
    gsap.set(children, from)

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              ...to,
              stagger: delay / 1000,
              duration,
              ease,
            })
            obs.disconnect()
          }
        })
      },
      { threshold, rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, duration, ease, from, to, threshold, rootMargin])

  const Tag = tag
  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ display: 'inline-block', textAlign }}
      aria-label={text}
    >
      {parts.map((p, i) => (
        p.match(/\s+/) ? (
          <span key={`space-${i}`}>{p}</span>
        ) : (
          <span
            key={`p-${i}`}
            data-split-item
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {p}
          </span>
        )
      ))}
    </Tag>
  )
}
