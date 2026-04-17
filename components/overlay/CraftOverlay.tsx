'use client'

import styles from './Overlay.module.sass'

interface CraftOverlayProps {
  visible: boolean
}

export default function CraftOverlay({ visible }: CraftOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>
        The process is supposed to be messy.
        <br />
        The work isn&apos;t.
      </p>
      <p className={styles.bodyLine}>
        Chaos is fine. Clarity is the goal.
      </p>
    </div>
  )
}
