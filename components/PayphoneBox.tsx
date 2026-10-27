'use client';

import { useEffect, useId, useRef, useState } from 'react';

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (containerId: string) => void };
  }
}

const SCRIPT_SRC = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js';
const CSS_HREF = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css';

let scriptPromise: Promise<void> | null = null;

function loadPayphoneAssets() {
  if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.PPaymentButtonBox) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SCRIPT_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('payphoneScriptFailed'));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface PayphoneBoxProps {
  token: string;
  storeId?: string;
  clientTransactionId: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  reference: string;
  currency?: string;
}

export function PayphoneBox(props: PayphoneBoxProps) {
  const containerId = useId().replace(/[:]/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPayphoneAssets()
      .then(() => {
        if (cancelled || renderedRef.current || !containerRef.current || !window.PPaymentButtonBox) return;
        renderedRef.current = true;
        new window.PPaymentButtonBox({
          token: props.token,
          storeId: props.storeId,
          clientTransactionId: props.clientTransactionId,
          amount: props.amount,
          amountWithoutTax: props.amountWithoutTax,
          amountWithTax: props.amountWithTax,
          tax: props.tax,
          currency: props.currency ?? 'USD',
          reference: props.reference,
          lang: 'es',
          defaultMethod: 'card',
        }).render(containerId);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.clientTransactionId]);

  if (failed) {
    return (
      <p className="text-xs text-danger">
        No pudimos cargar PayPhone. Revisa tu conexión o intenta de nuevo en unos segundos.
      </p>
    );
  }

  return <div id={containerId} ref={containerRef} className="min-h-[52px]" />;
}
