'use client';

import { useState, useCallback, useEffect } from 'react';
import { CheckIcon, LinkIcon } from '@heroicons/react/20/solid';

type Props = {
  url: string;
};

export default function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Older browsers / non-secure contexts. Fall back silently;
      // the user can still right-click → copy from the link element.
    }
  }, [url]);

  // Auto-revert the visual "copied" state after 2 seconds so the button
  // re-arms for the next copy attempt.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
      className="inline-flex items-center gap-1 rounded-md p-1.5 text-c-muted hover:text-link hover:bg-surface-hover transition-colors"
    >
      {copied ? (
        <CheckIcon className="w-5 h-5" aria-hidden="true" />
      ) : (
        <LinkIcon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
