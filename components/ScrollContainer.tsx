'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'
import HUDOverlay from '@/components/overlay/HUDOverlay'
import styles from '@/app/page.module.sass'

// WorldCanvas is browser-only (WebGL) — skip SSR
const WorldCanvas = dynamic(() => import('@/components/canvas/WorldCanvas'), {
  ssr: false,
})

gsap.registerPlugin(ScrollTrigger)

// Scroll track is 6× viewport (1 for the initial hold + 5 of scrub).
// Matches the previous GSAP `end: +=innerHeight * 5` range.
const SCROLL_MULTIPLIER = 6

export default function ScrollContainer() {
  const spacerRef      = useRef<HTMLDivElement>(null)
  const scrollProgress = useRef(0)

  useLayoutEffect(() => {
    const spacer = spacerRef.current
    if (!spacer) return

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true })
      ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
        },
      })
    }, spacerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={spacerRef}
      style={{ height: `${SCROLL_MULTIPLIER * 100}dvh`, position: 'relative' }}
    >
      <div
        id="scroll-container"
        className={styles.container}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
        }}
      >
        <WorldCanvas scrollProgress={scrollProgress} />
        <HUDOverlay scrollProgress={scrollProgress} />
      </div>
    </div>
  )
}
