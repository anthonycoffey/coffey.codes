interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function RetroWindow({ title, children, className = '' }: RetroWindowProps) {
  return (
    <div className={`retro-window ${className}`}>
      <div className="retro-window-bar">
        <span className="retro-dot retro-dot-red" />
        <span className="retro-dot retro-dot-yellow" />
        <span className="retro-dot retro-dot-green" />
        <span className="ml-2 text-sm font-mono text-c-muted truncate">{title}</span>
      </div>
      <div className="bg-surface">
        {children}
      </div>
    </div>
  );
}
