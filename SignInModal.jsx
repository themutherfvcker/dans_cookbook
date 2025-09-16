"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  async function signInWithGoogle() {
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
  }

  async function signInWithEmail(e) {
    e.preventDefault()
    setError("")
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sign in to continue</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>

        <div className="p-5 space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.3 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.3 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.3 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.3 29.6 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 10.1-1.9 13.8-5.2l-6.4-5.3C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.7-11.2-8.6l-6.5 5C9.6 39.7 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.8-5.1 6.5-9.3 6.5-2.7 0-5.2-1-7.1-2.7l-6.5 5C15.3 40.3 19.4 42 24 42c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center text-xs text-gray-500">or</div>

          {!sent ? (
            <form onSubmit={signInWithEmail} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button className="w-full px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                Email me a sign-in link
              </button>
              <p className="text-xs text-gray-600">First login gives you 4 free credits.</p>
            </form>
          ) : (
            <div className="text-sm text-gray-700">
              Check your inbox for the sign-in link, then return here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
