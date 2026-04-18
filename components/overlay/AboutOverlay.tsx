'use client';

import styles from './Overlay.module.sass';

interface AboutOverlayProps {
  visible: boolean;
}

export default function AboutOverlay({ visible }: AboutOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>Musician. Engineer. Artist. Maker.</p>
      <p className={styles.bodyLine}>
        Creativity is at the core of everything I do.
      </p>
    </div>
  );
}
