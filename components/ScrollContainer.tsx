'use client'

import { useEffect, useRef } from 'react'
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

export default function ScrollContainer() {
  const containerRef   = useRef<HTMLDivElement>(null)
  const scrollProgress = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Mobile: CSS handles vertical snap scroll — skip GSAP
    if (window.innerWidth < 768) return

    const SCROLL_LENGTH = window.innerHeight * 5

    const trigger = ScrollTrigger.create({
      trigger: container,
      pin: true,
      scrub: 1,
      end: () => `+=${SCROLL_LENGTH}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div id="scroll-container" ref={containerRef} className={styles.container}>
      <WorldCanvas scrollProgress={scrollProgress} />
      <HUDOverlay scrollProgress={scrollProgress} />
    </div>
  )
}
