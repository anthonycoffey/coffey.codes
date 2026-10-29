'use client';

import styles from './Overlay.module.sass';

interface CraftOverlayProps {
  visible: boolean;
}

export default function CraftOverlay({ visible }: CraftOverlayProps) {
  return (
    <div className={`${styles.hudPanel} ${visible ? styles.visible : ''}`}>
      <p className={styles.leadLine}>
        Legacy rebuilds.
        <br /> Production AI.
        <br /> Cloud + DevOps.
      </p>
      <p className={styles.bodyLine}>
        12 years, hands on the keyboard — through HIPAA, FDA and security
        review.
      </p>
    </div>
  );
}
