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
      <p className={styles.bodyLine}>
        <a
          href="/Anthony%20Coffey%20-%20Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          &rarr;&nbsp;&nbsp;view the resume
        </a>
      </p>
    </div>
  );
}
