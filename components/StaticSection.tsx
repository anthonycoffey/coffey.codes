// app/components/StaticSection.jsx - Server Component
export default function StaticSection({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
  background = 'bg-transparent',
}) {
  return (
    <div className={`w-full ${background} ${className}`}>
      <div className={`${maxWidth} mx-auto px-4 py-16 md:py-24`}>{children}</div>
    </div>
  );
}