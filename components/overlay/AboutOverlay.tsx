'use client';

import styles from './Overlay.module.sass';

interface AboutOverlayProps {
  visible: boolean;
}

export default function AboutOverlay({ visible }: AboutOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>Sound familiar?</p>
      <p className={styles.bodyLine}>
        A rebuild that stalled. An AI pilot that demos well and never ships. A
        codebase nobody wants to open.
      </p>
    </div>
  );
}
