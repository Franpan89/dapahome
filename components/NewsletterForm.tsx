'use client';

import { useState, useTransition } from 'react';
import { subscribeNewsletter } from '@/app/actions/newsletter';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData();
    fd.set('email', email);
    fd.set('source', 'footer');
    startTransition(async () => {
      const r = await subscribeNewsletter(fd);
      setResult(r);
      if (r.ok) setEmail('');
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label htmlFor="newsletter-email" className="label">Recibe novedades</label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary px-4 disabled:opacity-50"
        >
          {pending ? '…' : 'Suscribir'}
        </button>
      </div>
      {result && (
        <p
          role="status"
          className={`text-2xs ${result.ok ? 'text-success' : 'text-danger'}`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}
