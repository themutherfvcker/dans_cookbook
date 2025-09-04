'use client';

import { useEffect, useState } from 'react';

type SessionResp =
  | { ok: true; uid: string; credits: number }
  | { ok: false; error: string };

type CheckoutResp =
  | { ok: true; url: string }
  | { ok: false; error: string };

export default function Home() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadSession() {
    try {
      const res = await fetch('/api/session', { cache: 'no-store' });
      const data = (await res.json()) as SessionResp;
      if ('credits' in data) setCredits(data.credits);
    } catch (e) {
      // ignore for now
    }
  }

  useEffect(() => {
    // ensure user exists + show credits
    loadSession();

    // if we just returned from Stripe, show a friendly message
    const p = new URLSearchParams(window.location.search);
    if (p.get('success') === '1') setMsg('Payment successful! Credits added.');
    if (p.get('canceled') === '1') setMsg('Payment canceled.');
  }, []);

  async function startCheckout(creditsToBuy = 100) {
    try {
      setLoading(true);
      // ensure uid cookie exists
      await fetch('/api/session', { cache: 'no-store' });
      const res = await fetch(`/api/checkout?credits=${creditsToBuy}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as CheckoutResp;
      if (data.ok && data.url) {
        window.location.href = data.url; // go to Stripe Checkout
      } else {
        alert(data?.error || 'Checkout failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshCredits() {
    setMsg(null);
    await loadSession();
  }

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

        <button
          onClick={() => startCheckout(100)}
          disabled={loading}
          className="w-full rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 disabled:opacity-50"
        >
          {loading ? 'Opening Checkout…' : 'Buy 100 credits ($5 AUD)'}
        </button>

        <div className="text-xs text-gray-500">
          Test mode: use Stripe card <code>4242 4242 4242 4242</code>, any future
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
