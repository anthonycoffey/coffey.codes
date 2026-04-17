'use client'

import styles from './Overlay.module.sass'

interface ShineOverlayProps {
  visible: boolean
}

export default function ShineOverlay({ visible }: ShineOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.byline}>Anthony Coffey</p>
      <p className={styles.headline}>
        Shine on, you crazy diamond.
      </p>
      <p className={styles.bodyLine}>
        Let&rsquo;s build something worth remembering.
      </p>
    </div>
  )
}
