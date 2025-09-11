"use client"
import { useState } from "react"

const CHECKOUT_ENDPOINT = "/api/checkout" // change later to your real Stripe endpoint

export default function PlansModal({ open, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  if (!open) return null

  async function goCheckout(plan) {
    setError("")
    if (!CHECKOUT_ENDPOINT) { window.location.href = "/pricing"; return }
    try {
      setBusy(true)
      const res = await fetch(`${CHECKOUT_ENDPOINT}?plan=${encodeURIComponent(plan)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error(`Checkout failed (${res.status})`)
      const j = await res.json()
      if (j?.url) window.location.href = j.url
      else throw new Error("No checkout URL returned")
    } catch (e) {
      setError(e?.message || "Could not start checkout")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Get more credits</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>
        <div className="p-5 space-y-4 text-sm text-gray-700">
          <p className="text-gray-600">You’ve used your free credits. Choose a plan to keep going.</p>

          <div className="grid gap-3">
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Starter</div>
                  <div className="text-xs text-gray-500">100 images • best for trying things out</div>
                </div>
                <button
                  onClick={() => goCheckout("starter")}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-60"
                >
                  {busy ? "Loading…" : "Buy Starter"}
                </button>
              </div>
            </div>

            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Pro</div>
                  <div className="text-xs text-gray-500">500 images • best for regular use</div>
                </div>
                <button
                  onClick={() => goCheckout("pro")}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                >
                  {busy ? "Loading…" : "Buy Pro"}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="pt-2">
            Prefer to compare plans first?{" "}
            <a className="text-yellow-700 hover:text-yellow-800 underline" href="/pricing">See pricing</a>
          </div>
        </div>
      </div>
    </div>
  )
}
