'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Rendered in place of the children once a descendant throws during render or
   * lifecycle. Defaults to `null` — a silent, graceful removal of the failed
   * subtree rather than a crashed page.
   */
  fallback?: ReactNode;
  /** Called once when a descendant throws, for logging/telemetry. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Minimal, reusable React error boundary.
 *
 * The homepage uses it to isolate the WebGL scene: if `WorldCanvas` throws while
 * mounting (e.g. WebGL context creation fails on an old/blocked GPU), the throw
 * is contained here and the fallback renders instead — so the page keeps working
 * (dark background, HUD, scroll, contact links) rather than bubbling to
 * `app/global-error.tsx` and replacing the entire page.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
