'use client';

import { useEffect, useState } from 'react';

type SessionResp =
  | { ok: true; uid: string; credits: number }
  | { ok: false; error: string };

type CheckoutResp =
  | { ok: true; url: string }
  | { ok: false; error: string };

type UseResp =
  | { ok: true; credits: number }
  | { ok: false; error: string };

export default function Home() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingUse, setLoadingUse] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadSession() {
    try {
      const res = await fetch('/api/session', { cache: 'no-store' });
      const data = (await res.json()) as SessionResp;
      if ('credits' in data) setCredits(data.credits);
    } catch {}
  }

  useEffect(() => {
    loadSession();
    const p = new URLSearchParams(window.location.search);
    if (p.get('success') === '1') setMsg('Payment successful! Credits added.');
    if (p.get('canceled') === '1') setMsg('Payment canceled.');
  }, []);

  async function startCheckout(creditsToBuy = 100) {
    try {
      setLoadingCheckout(true);
      await fetch('/api/session', { cache: 'no-store' });
      const res = await fetch(`/api/checkout?credits=${creditsToBuy}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as CheckoutResp;
      if (data.ok) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Checkout failed.');
      }
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function useOneCredit() {
    try {
      setLoadingUse(true);
      const res = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });
      const data = (await res.json()) as UseResp;

      if ('credits' in data) {
        setCredits(data.credits);
        setMsg('Used 1 credit.');
      } else {
        // 402 from API means not enough credits
        alert(data.error || 'Unable to use credit.');
      }
    } finally {
      setLoadingUse(false);
    }
  }

  async function refreshCredits() {
    setMsg(null);
    await loadSession();
  }

  const canUse = (credits ?? 0) > 0;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">AI Image App</h1>

        <div className="text-gray-700">
          <div className="font-medium">Your credits:</div>
          <div className="text-3xl font-black">
            {credits === null ? '…' : credits}
          </div>
        </div>

        {msg && (
          <div className="rounded-lg bg-green-50 text-green-800 px-3 py-2 text-sm">
            {msg}{' '}
            <button
              onClick={refreshCredits}
              className="underline hover:no-underline ml-1"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => startCheckout(100)}
            disabled={loadingCheckout}
            className="w-full rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 disabled:opacity-50"
          >
            {loadingCheckout ? 'Opening Checkout…' : 'Buy 100 credits ($5 AUD)'}
          </button>

          <button
            onClick={useOneCredit}
            disabled={!canUse || loadingUse}
            className="w-full rounded-lg bg-black/90 hover:bg-black text-white font-semibold py-3 disabled:opacity-50"
            title={!canUse ? 'No credits left' : 'Use 1 credit'}
          >
            {loadingUse ? 'Using credit…' : 'Generate (uses 1 credit)'}
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Test mode: Stripe card <code>4242 4242 4242 4242</code>, any future
          expiry, any CVC.
        </div>

        <div className="text-sm text-gray-500">
          Quick links:{' '}
          <a href="/api/session" className="underline">
            /api/session
          </a>{' '}
          ·{' '}
          <a href="/api/ledger" className="underline">
            /api/ledger
          </a>
        </div>
      </div>
    </main>
  );
}
