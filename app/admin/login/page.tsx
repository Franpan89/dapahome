import Link from 'next/link';
import { loginAction } from '@/app/admin/actions';

export const metadata = { title: 'Acceso admin' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-brand-gradient text-white">
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link href="/" className="font-display text-2xl tracking-tight">Dapa·Home</Link>
          <div>
            <div className="label text-white/80">Panel admin</div>
            <h1 className="mt-2 font-display text-5xl leading-[1.05] tracking-tight max-w-md text-balance">
              Edita tu catálogo en segundos. Comparte el link al instante.
            </h1>
          </div>
          <div className="text-2xs text-white/70">© Dapa Home</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form action={loginAction} className="w-full max-w-sm space-y-5">
          <div>
            <div className="label">Bienvenido(a)</div>
            <h2 className="mt-1 font-display text-3xl tracking-tight">Iniciar sesión</h2>
          </div>

          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error === 'unauthorized'
                ? 'Tu cuenta no tiene permisos de admin.'
                : error === 'missing-env'
                ? 'Supabase aún no está configurado. Completa .env.local con tus credenciales.'
                : error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="input mt-1.5" />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="input mt-1.5" />
          </div>

          <button type="submit" className="btn-primary w-full">Entrar</button>
          <p className="text-2xs text-ink-600 text-center">
            Sólo personal autorizado de Dapa Home.
          </p>
        </form>
      </div>
    </div>
  );
}
