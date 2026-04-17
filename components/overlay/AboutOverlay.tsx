'use client'

import styles from './Overlay.module.sass'

interface AboutOverlayProps {
  visible: boolean
}

export default function AboutOverlay({ visible }: AboutOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>
        Musician. Director. Engineer. Actor.
        <br />
        Not a list &mdash; a life.
      </p>
      <p className={styles.bodyLine}>
        Austin, Texas. Studio wired for whatever comes next.
        <br />
        Art is the purpose. Code is one of the languages.
      </p>
    </div>
  )
}
