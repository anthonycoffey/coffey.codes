'use client'

import styles from './Overlay.module.sass'

interface IntroOverlayProps {
  visible: boolean
}

export default function IntroOverlay({ visible }: IntroOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.headline}>Anthony Coffey</p>
      <p className={styles.byline}>Austin, Texas</p>
    </div>
  )
}
