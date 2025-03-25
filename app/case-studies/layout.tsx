export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:pb-16 min-h-[900px]">
      {children}
    </div>
  );
}
