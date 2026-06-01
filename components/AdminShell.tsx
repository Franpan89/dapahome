import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';

export function AdminShell({ children, email }: { children: React.ReactNode; email?: string | null }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-ink-200/60 bg-surface lg:sticky lg:top-0 lg:h-dvh">
        <div className="p-6 border-b border-ink-200/60">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded bg-brand-gradient text-white font-display font-semibold">d</span>
            <div>
              <div className="font-display text-lg leading-none">Dapa Home</div>
              <div className="text-2xs text-ink-600">Panel admin</div>
            </div>
          </Link>
          {email && <div className="mt-4 text-2xs text-ink-600 truncate">{email}</div>}
        </div>
        <nav className="p-3 grid gap-1 text-sm">
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/productos">Productos</AdminLink>
          <AdminLink href="/admin/categorias">Categorías</AdminLink>
          <AdminLink href="/admin/instalaciones">Instalaciones</AdminLink>
          <AdminLink href="/admin/blog">Blog</AdminLink>
          <AdminLink href="/admin/newsletter">Newsletter</AdminLink>
          <AdminLink href="/admin/configuracion">Configuración</AdminLink>
          <div className="my-2 border-t border-ink-200/60" />
          <Link href="/" className="rounded-md px-3 py-2 hover:bg-ink-100">← Ver sitio</Link>
          <form action={logoutAction}>
            <button className="w-full text-left rounded-md px-3 py-2 hover:bg-ink-100 text-danger">Cerrar sesión</button>
          </form>
        </nav>
      </aside>
      <div className="p-6 lg:p-10 bg-ink-100/40">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-md px-3 py-2 hover:bg-accent hover:text-primary transition-colors">
      {children}
    </Link>
  );
}
