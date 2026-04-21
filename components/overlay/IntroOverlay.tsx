'use client';

import styles from './Overlay.module.sass';
import { LinkIcon } from '@heroicons/react/24/outline';

interface IntroOverlayProps {
  visible: boolean;
}

export default function IntroOverlay({ visible }: IntroOverlayProps) {
  return (
    <div className={`${styles.introPanel} ${visible ? styles.visible : ''}`}>
      <h1 className={styles.leadLine}>
        👨‍🚀
        <br />
        Who Am I?
      </h1>
      <p className={styles.byline}>Anthony Coffey - Austin, Texas</p>

      <div className={styles.socialLinks}>
        {/* GitHub */}
        <a
          href="https://github.com/anthonycoffey"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.iconLink}
          aria-label="GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.heroSize}
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com/in/coffeyanthony"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.iconLink}
          aria-label="LinkedIn"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.heroSize}
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>

        {/* Linktree */}
        <a
          href="https://linktr.ee/coffeycodes"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.iconLink}
          aria-label="Linktree Hub"
        >
          <LinkIcon className={styles.heroSize} />
        </a>
      </div>
    </div>
  );
}
