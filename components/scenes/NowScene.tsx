'use client'

import nowData from '@/data/now.json'
import styles from './Scene.module.sass'

export default function NowScene() {
  return (
    <section
      className={styles.scene}
      data-scene="now"
      aria-label="Now"
      role="region"
    >
      <div className={styles.sceneContent}>
        <p data-animate className={styles.eyebrow}>Right now &mdash;</p>
        <ul className={styles.nowList}>
          {nowData.items.map((item, i) => (
            <li key={i} data-animate className={styles.nowItem}>
              <span className={styles.arrow}>&rarr;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
