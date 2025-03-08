'use client';

import React, { useState } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        fontSize: '1rem',
      }}
      aria-label="Copy code"
    >
      {copied ? '✔️' : '📋'}
    </button>
  );
}

export default CopyButton;
