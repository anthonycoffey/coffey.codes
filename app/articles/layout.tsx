export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans text-c-text leading-relaxed mx-auto max-w-4xl px-4 md:pb-16 min-h-[900px]">
      {children}
    </div>
  );
}
