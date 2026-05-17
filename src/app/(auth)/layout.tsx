export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--brand-teal)_0%,transparent_55%)] opacity-[0.06]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
