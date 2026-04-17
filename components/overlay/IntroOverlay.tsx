'use client'

import styles from './Overlay.module.sass'

interface IntroOverlayProps {
  visible: boolean
}

export default function IntroOverlay({ visible }: IntroOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.headline}>
        Art is the point.
        <br />
        Everything else is the medium.
      </p>
      <p className={styles.byline}>Anthony Coffey &mdash; Austin, TX</p>
    </div>
  )
}
