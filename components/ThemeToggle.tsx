'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  /**
   * Visual context. `page` = sits on canvas/surface (default).
   * `chrome` = sits on the dark navbar — uses white-on-dark styling.
   */
  variant?: 'page' | 'chrome';
}

export default function ThemeToggle({
  className = '',
  variant = 'page',
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} aria-hidden="true" />;
  }

  const isDark = theme === 'dark';

  const toneClasses =
    variant === 'chrome'
      ? 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
      : 'border-border text-c-muted hover:text-c-heading hover:bg-surface-hover';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-1.5 rounded-full border transition-colors ${toneClasses} ${className}`}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </button>
  );
}
