import React from 'react';

// This layout file exists for the /lp route group.
// Header and Footer logic is handled conditionally in the root layout (app/layout.tsx).
// This component simply passes children through. It can be used for
// LP-specific layout elements in the future if needed.

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
