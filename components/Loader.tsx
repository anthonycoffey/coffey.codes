import { useEffect, useState } from 'react';
import { LOADER_DISMISSED_EVENT } from '@/lib/loaderEvents';

type LoaderWindow = Window &
  typeof globalThis & { __appLoaderActive?: boolean };

// Desktop safety cap — the loader always dismisses by this point even if the
// scene never signals ready (e.g. WebGL fails to init). Kept short so it never
// gates LCP: the overlay text behind it can paint as soon as it's gone.
const SAFETY_CAP_MS = 1500;
// After a mobile "tap to explore", give the scene generous time to initialise
// on a low-end device before the loader force-dismisses as a fallback.
const POST_TAP_CAP_MS = 8000;

interface LoaderProps {
  /** Flips true once the WebGL scene has rendered its first frame. */
  loaded?: boolean;
  /**
   * When true, the loader becomes a "tap to explore" gate: it does NOT
   * auto-dismiss, and the WebGL scene is mounted (by the parent) only after the
   * user taps. This keeps the heavy scene off the main thread for visitors who
   * never interact — most importantly Lighthouse/PSI — so mobile TBT stays low.
   */
  gate?: boolean;
  /** Called when the user taps the gate to start the experience. */
  onStart?: () => void;
}

export default function Loader({
  loaded = false,
  gate = false,
  onStart,
}: LoaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  // Avoid a hydration mismatch: the gate button is client-only state.
  const [mounted, setMounted] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => setMounted(true), []);

  // Advertise whether the loading overlay is currently up, and announce when it
  // slides away, so dependent UI (consent banner) can sequence itself.
  useEffect(() => {
    const w = window as LoaderWindow;
    if (loading) {
      w.__appLoaderActive = true;
    } else {
      w.__appLoaderActive = false;
      window.dispatchEvent(new Event(LOADER_DISMISSED_EVENT));
    }
  }, [loading]);

  // If the loader unmounts while still up (e.g. navigating away before it
  // dismisses), clear the flag and announce so dependents aren't left waiting.
  useEffect(() => {
    return () => {
      const w = window as LoaderWindow;
      w.__appLoaderActive = false;
      window.dispatchEvent(new Event(LOADER_DISMISSED_EVENT));
    };
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  // Dismiss as soon as the scene reports its first frame.
  useEffect(() => {
    if (loaded) setLoading(false);
  }, [loaded]);

  // Typing animation + progress bar — runs once on mount.
  useEffect(() => {
    const fullText = 'LOADING...';
    let i = 0;
    const typeInterval = setInterval(() => {
      setText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 50);

    requestAnimationFrame(() => {
      setTimeout(() => setProgress(100), 100);
    });

    return () => clearInterval(typeInterval);
  }, []);

  // Auto-dismiss safety net. While gating and awaiting the tap there is no cap
  // (the loader is meant to wait indefinitely); once tapped — or on desktop,
  // which never gates — a cap guarantees the overlay can't hang.
  useEffect(() => {
    if (gate && !tapped) return;
    const cap = setTimeout(
      () => setLoading(false),
      tapped ? POST_TAP_CAP_MS : SAFETY_CAP_MS,
    );
    return () => clearTimeout(cap);
  }, [gate, tapped]);

  const handleStart = () => {
    setTapped(true);
    onStart?.();
  };

  // Show the gate prompt once mounted, gating, not yet tapped, and the intro
  // typing has finished.
  const showGate = mounted && gate && !tapped && !isTyping;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-transform duration-200 ease-in-out ${
        loading ? 'loading' : '-translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-64 space-y-4">
        <div className="font-mono text-xl text-[#FFCC00]">
          {text}
          <span className={isTyping ? '' : 'animate-blink'}>█</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-900 shadow-[0_0_10px_#FFCC00]">
          <div
            className="h-full bg-[#FFCC00] shadow-[0_0_10px_#FFCC00] transition-all duration-[2500ms] ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {showGate && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-full border border-[#FFCC00] px-4 py-2 font-mono text-sm text-[#FFCC00] shadow-[0_0_10px_#FFCC00] transition-colors hover:bg-[#FFCC00] hover:text-black"
          >
            TAP TO EXPLORE
          </button>
        )}
      </div>
    </div>
  );
}
