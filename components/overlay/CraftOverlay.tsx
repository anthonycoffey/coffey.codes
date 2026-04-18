'use client';

import styles from './Overlay.module.sass';

interface CraftOverlayProps {
  visible: boolean;
}

export default function CraftOverlay({ visible }: CraftOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>I solve problems for people.</p>
      <p className={styles.bodyLine}>
        The tools and trends change, but what I do remains the same.
        <br /> How can I help?
      </p>
    </div>
  );
}
