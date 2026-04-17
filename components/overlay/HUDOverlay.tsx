'use client'

import { useEffect, useRef, useState } from 'react'
import IntroOverlay from './IntroOverlay'
import AboutOverlay from './AboutOverlay'
import CraftOverlay from './CraftOverlay'
import styles from './Overlay.module.sass'

// ── Visibility thresholds — matched to storyboard ──────────────────────────
// 0.00–0.15: No text. Merkaba dispersing into stars — pure visual.
// 0.15–0.35: "Art is the point." UFO hovering.
// 0.35–0.52: "Musician. Director." UFO flyby happens.
// 0.52–0.68: "The process is messy." Camera holds at planet horizon.
// 0.68+:     Satellite + Gate content handled in 3D via drei <Html>.

interface HUDOverlayProps {
  scrollProgress: React.RefObject<number>
}

interface VisState {
  intro: boolean
  about: boolean
  craft: boolean
}

export default function HUDOverlay({ scrollProgress }: HUDOverlayProps) {
  const [vis, setVis] = useState<VisState>({ intro: false, about: false, craft: false })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const p = scrollProgress.current ?? 0

      const next: VisState = {
        intro: p >= 0.15 && p < 0.35,
        about: p >= 0.35 && p < 0.52,
        craft: p >= 0.52 && p < 0.68,
      }

      setVis(prev => {
        // Only trigger re-render when something actually changes
        if (prev.intro === next.intro && prev.about === next.about && prev.craft === next.craft) {
          return prev
        }
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scrollProgress])

  return (
    <div className={styles.overlay}>
      <IntroOverlay visible={vis.intro} />
      <AboutOverlay visible={vis.about} />
      <CraftOverlay visible={vis.craft} />
      {/* Zones 68%+ (Now + Connect) use surface-mounted content
          inside Satellite.tsx and Gate.tsx via drei <Html> */}
    </div>
  )
}
