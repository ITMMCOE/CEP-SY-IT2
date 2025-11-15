import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import './StaggeredMenu.css'

export default function StaggeredMenu({
  position = 'right',
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = false,
  colors = ['#0f0f0f', '#1f1f1f'],
  menuButtonColor = '#222',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  logoUrl = '',
  accentColor = '#8b5cf6',
  onMenuOpen,
  onMenuClose,
  isOpen: controlledOpen,
  onClose: controlledClose,
  onItemClick,
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledClose ? controlledClose : setInternalOpen
  const overlayRef = useRef(null)
  const listRef = useRef(null)
  const socialsRef = useRef(null)
  const buttonRef = useRef(null)
  const tlRef = useRef(null)

  const gradient = useMemo(() => `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, [colors])

  useEffect(() => {
    const overlay = overlayRef.current
    const list = listRef.current
    const socials = socialsRef.current

    // Set initial hidden state
    gsap.set(overlay, { xPercent: position === 'right' ? 100 : -100, autoAlpha: 0 })
    gsap.set([list?.children, socials?.children].flat().filter(Boolean), {
      y: 30,
      autoAlpha: 0,
    })

    // Build timeline once
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    tl.to(overlay, { xPercent: 0, autoAlpha: 1, duration: 0.5 })
      .to(
        list?.children || [],
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.5 },
        '-=0.2'
      )
      .to(socials?.children || [], { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4 }, '-=0.3')

    tlRef.current = tl

    return () => tl.kill()
  }, [position])

  useEffect(() => {
    if (!tlRef.current) return
    if (open) {
      tlRef.current.play()
      onMenuOpen && onMenuOpen()
      if (changeMenuColorOnOpen && buttonRef.current) {
        buttonRef.current.style.color = openMenuButtonColor
      }
    } else {
      tlRef.current.reverse()
      onMenuClose && onMenuClose()
      if (changeMenuColorOnOpen && buttonRef.current) {
        buttonRef.current.style.color = menuButtonColor
      }
    }
  }, [open, onMenuOpen, onMenuClose, changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor])

  const toggle = () => {
    if (controlledClose) {
      controlledClose(!open)
    } else {
      setInternalOpen((v) => !v)
    }
  }

  const handleItemClick = () => {
    if (controlledClose) {
      controlledClose(false)
    } else {
      setInternalOpen(false)
    }
  }

  const handleSocialClick = (e, link) => {
    // Handle special links like #logout
    if (link.startsWith('#') && onItemClick) {
      e.preventDefault()
      onItemClick(link)
    }
    handleItemClick()
  }

  return (
    <>
      {controlledOpen === undefined && (
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="staggered-menu__button"
          style={{ color: menuButtonColor }}
          onClick={toggle}
          ref={buttonRef}
        >
          <span className={`hamburger ${open ? 'is-open' : ''}`}>
            <i />
            <i />
            <i />
          </span>
        </button>
      )}

      {/* Backdrop overlay for blur effect */}
      {open && <div className="staggered-menu__backdrop" onClick={toggle} />}

      <aside
        ref={overlayRef}
        className={`staggered-menu__overlay ${position}`}
        style={{ backgroundImage: gradient }}
      >
        <div className="staggered-menu__inner">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="staggered-menu__logo" />
          ) : (
            <div className="staggered-menu__logo--placeholder" />
          )}

          <ul className="staggered-menu__list" ref={listRef}>
            {items.map((item, idx) => {
              const isExternal = /^(https?:\/\/|\/admin)/i.test(item.link)
              const content = (
                <>
                  {displayItemNumbering && (
                    <span className="staggered-menu__number">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                  <span className="staggered-menu__label">{item.label}</span>
                </>
              )
              return (
                <li key={idx} className="staggered-menu__item">
                  {isExternal ? (
                    <a href={item.link} aria-label={item.ariaLabel || item.label} onClick={handleItemClick}>
                      {content}
                    </a>
                  ) : (
                    <Link to={item.link} aria-label={item.ariaLabel || item.label} onClick={handleItemClick}>
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          {displaySocials && socialItems?.length > 0 && (
            <ul className="staggered-menu__socials" ref={socialsRef}>
              {socialItems.map((s, i) => {
                const isExt = /^(https?:\/\/|\/admin)/i.test(s.link)
                const isHash = s.link.startsWith('#')
                return (
                  <li key={i}>
                    {isHash ? (
                      <a href={s.link} onClick={(e) => handleSocialClick(e, s.link)}>
                        {s.label}
                      </a>
                    ) : isExt ? (
                      <a href={s.link} onClick={handleItemClick}>
                        {s.label}
                      </a>
                    ) : (
                      <Link to={s.link} onClick={handleItemClick}>
                        {s.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
