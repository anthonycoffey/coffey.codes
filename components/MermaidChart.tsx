'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
}

let mermaidInitialized = false;

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (isClient && !mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'loose',
      });
      mermaidInitialized = true;
    }

    if (isClient) {
      try {
        const timerId = setTimeout(() => {
          mermaid.contentLoaded();
        }, 0);
        return () => clearTimeout(timerId);
      } catch (e) {
        console.error('Error calling mermaid.contentLoaded():', e);
      }
    }
  }, [chart, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <pre className="mermaid" key={chart}>
      {chart}
    </pre>
  );
};

export default MermaidChart;
