'use client';

import styles from './Overlay.module.sass';

interface FinalOverlayProps {
  visible: boolean;
}

export default function FinalOverlay({ visible }: FinalOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>Want to know more?</p>
      <p className={styles.bodyLine}>
        <a href="/contact">&rarr;&nbsp;&nbsp;reach out</a>
      </p>
    </div>
  );
}
