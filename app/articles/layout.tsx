export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="prose prose-invert prose-lg font-sans max-w-none text-c-text leading-relaxed mx-auto px-4 py-8 md:pb-16 min-h-[900px] max-w-4xl">
      {children}
    </article>
  );
}
