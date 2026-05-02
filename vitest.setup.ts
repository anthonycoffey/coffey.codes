import '@testing-library/jest-dom';

// jsdom lacks ResizeObserver, which @visx/tooltip's useTooltipInPortal needs.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const filterMessage = (msg: string) =>
  msg.includes('is using incorrect casing') ||
  msg.includes('is unrecognized in this browser') ||
  msg.includes('React does not recognize the') ||
  msg.includes('for a non-boolean attribute') ||
  msg.includes('Unknown event handler property');

const originalConsoleError = console.error;
console.error = (...args) => {
  const fullMsg = args
    .map((a) => (typeof a === 'string' ? a : String(a)))
    .join(' ');
  if (filterMessage(fullMsg)) return;
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const fullMsg = args
    .map((a) => (typeof a === 'string' ? a : String(a)))
    .join(' ');
  if (filterMessage(fullMsg)) return;
  originalConsoleWarn(...args);
};
