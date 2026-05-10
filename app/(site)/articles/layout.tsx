import '@/styles/article-prose.sass';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 md:pb-16 min-h-[900px]">
      {children}
    </div>
  );
}
