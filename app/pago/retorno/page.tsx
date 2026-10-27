'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart/store';
import { formatMoney } from '@/lib/format';

interface ConfirmResult {
  status: 'paid' | 'failed';
  total: number;
  currency: string;
  authorizationCode: string | null;
}

function PayphoneReturnContent() {
  const params = useSearchParams();
  const clear = useCart((s) => s.clear);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = params.get('id');
    const clientTransactionId = params.get('clientTransactionId');
    if (!id || !clientTransactionId) {
      setState('error');
      setErrorMsg('No encontramos los datos del pago en la URL de retorno.');
      return;
    }

    let cancelled = false;
    fetch('/api/payphone/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), clientTransactionId }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setState('error');
          setErrorMsg(data?.error ?? 'No pudimos confirmar el pago.');
          return;
        }
        setResult(data);
        setState('ok');
        if (data.status === 'paid') clear();
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
        setErrorMsg('No pudimos confirmar el pago. Contáctanos si el cargo se realizó.');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'loading') {
    return (
      <div className="text-center">
        <p className="label">Confirmando tu pago con PayPhone…</p>
        <p className="mt-3 text-ink-600">No cierres esta página.</p>
      </div>
    );
  }

  if (state === 'error' || result?.status === 'failed') {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl tracking-tight">No pudimos confirmar tu pago</h1>
        <p className="mt-3 text-ink-600 text-pretty">
          {errorMsg ?? 'El pago no fue aprobado. Si el cargo se realizó en tu banco, escríbenos por WhatsApp.'}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/carrito" className="btn-primary">Volver al carrito</Link>
          <Link href="/" className="btn">Ir al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="font-display text-3xl tracking-tight">¡Pago aprobado!</h1>
      <p className="mt-3 text-ink-600">
        Cobramos {formatMoney(result!.total, result!.currency)}
        {result!.authorizationCode ? ` · autorización ${result!.authorizationCode}` : ''}.
      </p>
      <p className="mt-1 text-ink-600">Te contactaremos para coordinar la entrega.</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/catalogo" className="btn-primary">Seguir comprando</Link>
        <Link href="/" className="btn">Ir al inicio</Link>
      </div>
    </div>
  );
}

export default function PayphoneReturnPage() {
  return (
    <div className="container-page pt-16 pb-28 max-w-xl mx-auto">
      <Suspense fallback={<p className="text-center text-ink-600">Cargando…</p>}>
        <PayphoneReturnContent />
      </Suspense>
    </div>
  );
}
