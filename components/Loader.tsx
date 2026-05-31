import { useEffect, useState } from 'react';

// Hard safety cap — the loader always dismisses by this point even if the
// scene never signals ready (e.g. WebGL fails to init). Kept short so it never
// gates LCP: the overlay text behind it can paint as soon as it's gone.
const SAFETY_CAP_MS = 1500;

interface LoaderProps {
  /** Flips true once the WebGL scene has rendered its first frame. */
  loaded?: boolean;
}

export default function Loader({ loaded = false }: LoaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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

    // Safety net so the overlay can never hang past the cap.
    const timeout = setTimeout(() => {
      setLoading(false);
    }, SAFETY_CAP_MS);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(timeout);
    };
  }, []);

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
      </div>
    </div>
  );
}
