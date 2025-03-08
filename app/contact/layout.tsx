export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:pb-16 min-h-[800px]">
      {children}
    </div>
  );
}
