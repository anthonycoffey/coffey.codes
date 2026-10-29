'use client';

import styles from './Overlay.module.sass';

interface FinalOverlayProps {
  visible: boolean;
}

export default function FinalOverlay({ visible }: FinalOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>Tell me what&rsquo;s broken.</p>
      <p className={styles.bodyLine}>
        <a href="/contact">&rarr;&nbsp;&nbsp;start a conversation</a>
      </p>
    </div>
  );
}
