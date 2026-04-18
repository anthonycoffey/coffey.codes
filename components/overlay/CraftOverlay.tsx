'use client';

import styles from './Overlay.module.sass';

interface CraftOverlayProps {
  visible: boolean;
}

export default function CraftOverlay({ visible }: CraftOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>I solve big problems.</p>
      <p className={styles.bodyLine}>
        The trends and tools change, but my role does not.
      </p>
    </div>
  );
}
