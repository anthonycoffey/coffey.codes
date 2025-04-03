'use client';

import React, { useEffect, useState } from 'react'; // Import useState
import mermaid from 'mermaid'; // Still need this for initialize

interface MermaidChartProps {
  chart: string;
}

// Flag to ensure initialization happens only once per page load
let mermaidInitialized = false;

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  // State to track if we are on the client and mounted
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true only after component mounts on the client
    setIsClient(true);

    // Initialize Mermaid globally on the client, but only once.
    if (isClient && !mermaidInitialized) { // Ensure we are client-side before initializing
      mermaid.initialize({
        startOnLoad: true, // Let Mermaid find elements with class="mermaid"
        securityLevel: 'loose', // Keep loose for now, might help
        // theme: 'default' // Optional theme
      });
      mermaidInitialized = true;
      // console.log('Mermaid initialized globally');
    }

    // Signal Mermaid to look for new diagrams after initialization or chart change
    if (isClient) {
      try {
        // Delay slightly to ensure the <pre> tag is in the DOM
        const timerId = setTimeout(() => {
          mermaid.contentLoaded();
          // console.log('mermaid.contentLoaded() called');
        }, 0);
        return () => clearTimeout(timerId); // Cleanup timeout
      } catch (e) {
        console.error('Error calling mermaid.contentLoaded():', e);
      }
    }

  }, [chart, isClient]); // Re-run effect if chart content or isClient changes

  // Only render the <pre> tag on the client after the initial mount
  // This prevents the hydration mismatch error.
  if (!isClient) {
    // Render null or a placeholder matching server output during SSR/hydration
    return null;
  }

  // Render the actual Mermaid content container on the client
  return (
    <pre className="mermaid" key={chart}>
      {chart}
    </pre>
  );
};

export default MermaidChart;
