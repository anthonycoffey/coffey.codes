'use client'

import styles from './Overlay.module.sass'

interface ShineOverlayProps {
  visible: boolean
}

export default function ShineOverlay({ visible }: ShineOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.headline}>Anthony Coffey</p>
      <p className={styles.bodyLine}>
        <a href="/contact">&rarr;&nbsp;&nbsp;reach out</a>
      </p>
    </div>
  )
}
