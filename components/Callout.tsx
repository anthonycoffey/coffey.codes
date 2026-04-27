import React from 'react';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'tip' | 'warning' | 'danger';
}

const icons: Record<NonNullable<CalloutProps['type']>, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
  danger: '🚫',
};

// Visual personality (tinted bg / matching border / tinted text) is preserved
// from the original implementation. Color values are sourced from CSS variables
// declared in styles/global.sass under .callout — see SPEC-008.
const Callout: React.FC<CalloutProps> = ({ children, type = 'info' }) => {
  return (
    <div
      data-callout-type={type}
      className="callout flex items-start relative px-2 rounded-md border my-4 text-sm"
    >
      <span className="text-xl absolute top-5 -left-8">{icons[type]}</span>
      <div className="leading-6">{children}</div>
    </div>
  );
};

export { Callout };
