'use client'

import styles from './Scene.module.sass'

export default function CraftScene() {
  return (
    <section
      className={styles.scene}
      data-scene="craft"
      aria-label="Craft"
      role="region"
    >
      <div className={styles.sceneContent}>
        <p data-animate className={styles.leadLine}>
          
          <br />
          The work isn&apos;t.
        </p>
        <p data-animate className={styles.bodyLine}>
          Chaos is fine. Clarity is the goal.
        </p>
      </div>
    </section>
  )
}
