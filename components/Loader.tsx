import { useEffect, useState } from 'react';

export default function Loader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

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
