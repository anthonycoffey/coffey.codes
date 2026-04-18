'use client';

import styles from './Overlay.module.sass';

interface AboutOverlayProps {
  visible: boolean;
}

export default function AboutOverlay({ visible }: AboutOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>
        Musician.
        <br /> Engineer.
        <br /> Artist. Maker.
      </p>
      <p className={styles.bodyLine}>
        <span className={[styles.rainbow, styles.boldupper].join(' ')}>
          Creativity
        </span>{' '}
        is at the core of everything that I love to do.
      </p>
    </div>
  );
}
