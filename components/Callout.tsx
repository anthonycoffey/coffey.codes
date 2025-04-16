import React from 'react';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'tip' | 'warning' | 'danger';
  // Add other props like 'title' if needed later
}

const Callout: React.FC<CalloutProps> = ({ children, type = 'info' }) => {
  const baseStyle = 'p-4 rounded-md border my-4'; // Common styles

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    tip: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  // Add icons later if desired
  const icons = {
    info: 'ℹ️',
    tip: '💡',
    warning: '⚠️',
    danger: '🚫',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]} flex items-start`}>
      {/* Added flex items-start */}
      <span className="mr-2 text-xl leading-tight">{icons[type]}</span>{' '}
      {/* Adjusted size/spacing */}
      <div className="flex-1 font-medium">{children}</div>{' '}
      {/* Wrap children for flex */}
    </div>
  );
};

export { Callout };
