'use client';

import styles from './Overlay.module.sass';

interface AboutOverlayProps {
  visible: boolean;
}

export default function AboutOverlay({ visible }: AboutOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>The rebuild stalled.</p>
      <p className={styles.bodyLine}>
        The AI pilot never shipped. Nobody will touch the codebase. The last
        developer stopped replying.
      </p>
    </div>
  );
}
