"use client"

import { useState } from "react"

export const metadata = { title: "Pricing — Nano Banana" }

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onBuy() {
    setLoading(true)
    setError("")
    try {
      // POST to your existing API route that creates a Stripe Checkout session
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // you can add optional metadata fields if your /api/checkout supports it
          success_url: `${location.origin}/success`,
          cancel_url: `${location.origin}/cancel`,
        }),
      })
      const j = await r.json()
      if (!r.ok || !j?.url) {
        throw new Error(j?.error || `HTTP ${r.status}`)
      }
      // Hard redirect to Stripe Checkout
      window.location.href = j.url
    } catch (e) {
      setError(e.message || "Checkout failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Pricing</h1>
        <p className="mt-3 text-lg text-gray-600">
          Start generating instantly. Credits never expire.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starter */}
          <div className="bg-white rounded-2xl shadow p-8 border">
            <h2 className="text-2xl font-bold">Starter</h2>
            <p className="text-gray-500 mt-1">For testing and light use</p>
            <div className="mt-6">
              <div className="text-5xl font-extrabold">$5<span className="text-2xl align-top ml-1">AUD</span></div>
              <div className="text-gray-500 mt-1">100 credits</div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li>• 1 credit per generate</li>
              <li>• Fast queue</li>
              <li>• Email support</li>
            </ul>
            <button
              onClick={onBuy}
              disabled={loading}
              className="mt-8 w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Buy 100 credits ($5)"}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}
          </div>

          {/* Pro (you can wire a second Stripe price later) */}
          <div className="bg-white rounded-2xl shadow p-8 border">
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-gray-500 mt-1">For creators and teams</p>
            <div className="mt-6">
              <div className="text-5xl font-extrabold">$19<span className="text-2xl align-top ml-1">AUD</span></div>
              <div className="text-gray-500 mt-1">500 credits</div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li>• 1 credit per generate</li>
              <li>• Priority queue</li>
              <li>• Commercial usage</li>
            </ul>
            <button
              onClick={onBuy}
              disabled={loading}
              className="mt-8 w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-gray-800 bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              title="Wire a second Stripe price in /api/checkout if desired"
            >
              {loading ? "Redirecting…" : "Buy Pro (uses Starter price for now)"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Taxes/VAT may apply at checkout. Payments are processed by Stripe.
        </p>
      </section>
    </main>
  )
}
