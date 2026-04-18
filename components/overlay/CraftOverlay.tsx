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
        The tools and trends may change, but my work is the same.
      </p>
    </div>
  );
}
