'use client'

import styles from './Scene.module.sass'

export default function IntroScene() {
  return (
    <section
      className={styles.scene}
      data-scene="intro"
      aria-label="Intro"
      role="region"
    >
      <div className={styles.introContent}>
        <p data-animate className={styles.introHeadline}>
          Art is the point.
          <br />
          Everything else is the medium.
        </p>
        <p data-animate className={styles.introByline}>
          Anthony Coffey &mdash; Austin, TX
        </p>
      </div>
    </section>
  )
}
