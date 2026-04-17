'use client'

import styles from './Scene.module.sass'

export default function ConnectScene() {
  return (
    <section
      className={styles.scene}
      data-scene="connect"
      aria-label="Connect"
      role="region"
    >
      <div className={styles.sceneContent}>
        <p data-animate className={styles.leadLine}>
          I don&apos;t pitch.
          <br />
          I talk.
        </p>
        <a data-animate href="/contact" className={styles.ctaLink}>
          &rarr;&nbsp; reach out
        </a>
      </div>
    </section>
  )
}
