'use client';

import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
      title={copied ? 'Copied!' : 'Copy code'}
      className={
        'absolute top-[5px] right-[5px] inline-flex items-center justify-center ' +
        'h-8 w-8 rounded-md border border-border bg-surface/90 backdrop-blur-sm ' +
        'text-c-muted hover:text-c-heading hover:bg-surface-hover ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-1 focus-visible:ring-offset-surface ' +
        'transition-colors cursor-pointer ' +
        (copied ? 'text-c-heading' : '')
      }
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ClipboardIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default CopyButton;
