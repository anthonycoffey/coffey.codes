import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '@/components/ErrorBoundary';

// A child that throws during render, to trip the boundary.
function Boom(): never {
  throw new Error('WebGL context creation failed');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors to console.error; silence it so the test
    // output stays clean (and assert we still handle the error ourselves).
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>healthy scene</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy scene')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('renders the fallback when a descendant throws', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('renders nothing (null) by default when a descendant throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    // Graceful, silent removal of the failed subtree — no crash, no fallback.
    expect(container).toBeEmptyDOMElement();
  });

  it('invokes onError with the thrown error', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary fallback={null} onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe(
      'WebGL context creation failed',
    );
  });
});
