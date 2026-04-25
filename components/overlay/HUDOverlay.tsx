'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import IntroOverlay from './IntroOverlay';
import AboutOverlay from './AboutOverlay';
import CraftOverlay from './CraftOverlay';
import FinalOverlay from './FinalOverlay';
import styles from './Overlay.module.sass';

// ── Visibility thresholds — matched to storyboard ──────────────────────────
// 0.00–0.15: No text. Merkaba dispersing into stars — pure visual.
// 0.15–0.35: "Art is the point." UFO hovering.
// 0.35–0.52: "Musician. Director." UFO flyby happens.
// 0.52–0.68: "The process is messy." Camera holds at planet horizon.
// 0.68–0.82: Satellite orbiting, planet zone.
// 0.82–1.00: "Want to know more?" Galaxy fills frame.

interface HUDOverlayProps {
  scrollProgress: React.RefObject<number | null>;
}

interface VisState {
  intro: boolean;
  about: boolean;
  craft: boolean;
  final: boolean;
}

type ActiveSection = 'intro' | 'about' | 'craft' | 'final' | null;

export default function HUDOverlay({ scrollProgress }: HUDOverlayProps) {
  const [vis, setVis] = useState<VisState>({
    intro: false,
    about: false,
    craft: false,
    final: false,
  });
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(true);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const p = scrollProgress.current ?? 0;

      const next: VisState = {
        intro: p >= 0.15 && p < 0.35,
        about: p >= 0.35 && p < 0.52,
        craft: p >= 0.52 && p < 0.68,
        final: p >= 0.82,
      };

      setVis((prev) => {
        if (
          prev.intro === next.intro &&
          prev.about === next.about &&
          prev.craft === next.craft &&
          prev.final === next.final
        )
          return prev;
        return next;
      });

      let nextActive: ActiveSection = null;
      if (p >= 0.82) nextActive = 'final';
      else if (p >= 0.52) nextActive = 'craft';
      else if (p >= 0.35) nextActive = 'about';
      else if (p >= 0.15) nextActive = 'intro';

      setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
      setShowPrompt(p < 0.1);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollProgress]);

  const scrollTo = (progress: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: progress * scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.overlay}>
      <IntroOverlay visible={vis.intro} />
      <AboutOverlay visible={vis.about} />
      <CraftOverlay visible={vis.craft} />
      <FinalOverlay visible={vis.final} />

      {/* Table of Contents */}
      <div className={styles.tocContainer}>
        <ul className={styles.tocList}>
          <li className={styles.tocItem}>
            <a
              onClick={() => scrollTo(0.15)}
              className={`${styles.tocLink} ${activeSection === 'intro' ? styles.active : ''}`}
            >
              System.init
            </a>
          </li>
          <li className={styles.tocItem}>
            <a
              onClick={() => scrollTo(0.35)}
              className={`${styles.tocLink} ${activeSection === 'about' ? styles.active : ''}`}
            >
              Profiles
            </a>
          </li>
          <li className={styles.tocItem}>
            <a
              onClick={() => scrollTo(0.52)}
              className={`${styles.tocLink} ${activeSection === 'craft' ? styles.active : ''}`}
            >
              Craft
            </a>
          </li>
          <li className={styles.tocItem}>
            <a
              onClick={() => scrollTo(0.82)}
              className={`${styles.tocLink} ${activeSection === 'final' ? styles.active : ''}`}
            >
              Connect
            </a>
          </li>
        </ul>
      </div>

      {/* Scroll Prompt */}
      <div className={`${styles.scrollPromptContainer} ${showPrompt ? styles.visible : ''}`}>
        <span className={styles.scrollPromptText}>System Ready // Scroll to Explore</span>
        <button
          className={`${styles.scrollPromptButton} ${styles.bouncing}`}
          onClick={() => scrollTo(0.15)}
          aria-label="Scroll to first slide"
        >
          <ArrowDownIcon className={styles.heroSize} />
        </button>
      </div>
    </div>
  );
}

