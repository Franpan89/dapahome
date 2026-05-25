import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page py-32 text-center">
      <div className="label">404</div>
      <h1 className="mt-2 font-display text-6xl tracking-tight">Página no encontrada</h1>
      <p className="mt-4 text-ink-600">El producto o página que buscas ya no está disponible.</p>
      <Link href="/catalogo" className="btn-primary mt-8 inline-flex">Ir al catálogo</Link>
    </div>
  );
}
