'use client'

import styles from './Scene.module.sass'

export default function AboutScene() {
  return (
    <section
      className={styles.scene}
      data-scene="about"
      aria-label="About"
      role="region"
    >
      <div className={styles.sceneContent}>
        <p data-animate className={styles.leadLine}>
          Musician. Director. Engineer. Actor.
          <br />
          Not a list &mdash; a life.
        </p>
        <p data-animate className={styles.bodyLine}>
          Austin, Texas. Studio wired for whatever comes next.
          <br />
          Art is the purpose. Code is one of the languages.
        </p>
      </div>
    </section>
  )
}
