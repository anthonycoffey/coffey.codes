import { useEffect, useState } from 'react';
import { LOADER_DISMISSED_EVENT } from '@/lib/loaderEvents';

type LoaderWindow = Window &
  typeof globalThis & { __appLoaderActive?: boolean };

// Desktop safety cap — the loader always dismisses by this point even if the
// scene never signals ready (e.g. WebGL fails to init). Kept short so it never
// gates LCP: the overlay text behind it can paint as soon as it's gone.
const SAFETY_CAP_MS = 1500;
// After the visitor enters, give the scene generous time to download and
// initialise (cold chunk on a low-end device) before the loader force-dismisses
// as a fallback.
const POST_TAP_CAP_MS = 8000;

// Progress-bar fill timing. The gate ("SCENE LOADED." + tap button) is only
// revealed once the bar has visibly filled, so it never pops in over a
// half-full bar. Kept snappy so the wait stays short.
const BAR_START_MS = 80; // let the empty bar paint before it animates
const BAR_FILL_MS = 1100; // CSS transition duration for the fill
const FILL_COMPLETE_MS = BAR_START_MS + BAR_FILL_MS + 120; // + small buffer

interface LoaderProps {
  /** Flips true once the WebGL scene has rendered its first frame. */
  loaded?: boolean;
  /**
   * When true, the loader becomes a "click/tap to enter" gate: it does NOT
   * auto-dismiss, and the WebGL scene is mounted (by the parent) only after the
   * user enters. This keeps the heavy scene off the main thread for visitors who
   * never interact — most importantly Lighthouse/PSI — so TBT stays low on every
   * viewport.
   */
  gate?: boolean;
  /** Label for the gate button — e.g. "TAP TO ENTER" / "CLICK TO ENTER". */
  enterLabel?: string;
  /** Called when the user enters the gate to start the experience. */
  onStart?: () => void;
}

export default function Loader({
  loaded = false,
  gate = false,
  enterLabel = 'TAP TO ENTER',
  onStart,
}: LoaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  // True once the progress bar has finished filling.
  const [filled, setFilled] = useState(false);
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

    // Kick the bar from 0 → 100 after a beat, then mark it filled once the
    // transition has visibly completed.
    const startTimer = setTimeout(() => setProgress(100), BAR_START_MS);
    const fillTimer = setTimeout(() => setFilled(true), FILL_COMPLETE_MS);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(startTimer);
      clearTimeout(fillTimer);
    };
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

  // Gate prompt: shown once mounted, gating, not yet tapped, and the bar has
  // filled (so it never appears over a half-full bar).
  const showGate = mounted && gate && !tapped && filled;

  // "SCENE LOADED." replaces the typing "LOADING..." line once the gate is
  // ready, and — crucially — stays put after the tap so it doesn't flicker
  // back to "LOADING..." before the overlay slides away.
  const sceneLoaded = showGate || tapped;
  const statusText = sceneLoaded ? 'SCENE LOADED.' : text;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-transform duration-200 ease-in-out ${
        loading ? 'loading' : '-translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-64 space-y-4">
        <div
          className={`font-mono text-xl text-[#FFCC00] ${
            sceneLoaded ? 'text-center' : 'text-left'
          }`}
        >
          {statusText}
          <span className={isTyping ? '' : 'animate-blink'}>█</span>
        </div>
        {/* Progress bar is only meaningful while loading — hide it once the
            scene is reported loaded (the blinking cursor stays). */}
        {!sceneLoaded && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-900 shadow-[0_0_10px_#FFCC00]">
            <div
              className="h-full bg-[#FFCC00] shadow-[0_0_10px_#FFCC00] transition-all ease-out"
              style={{
                width: `${progress}%`,
                transitionDuration: `${BAR_FILL_MS}ms`,
              }}
            />
          </div>
        )}
        {showGate && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-full border border-[#FFCC00] px-4 py-2 font-mono text-sm text-[#FFCC00] shadow-[0_0_10px_#FFCC00] transition-colors hover:bg-[#FFCC00] hover:text-black"
          >
            {enterLabel}
          </button>
        )}
      </div>
    </div>
  );
}
