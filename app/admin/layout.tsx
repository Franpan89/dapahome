// Admin layout: minimal shell. Auth se valida por página.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink-100">{children}</div>;
}
