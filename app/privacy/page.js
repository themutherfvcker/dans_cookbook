export const metadata = { title: "Privacy Policy — Nano Banana" }

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 prose">
      <h1>Privacy Policy</h1>
      <p>We respect your privacy. This page describes how we handle data in the app.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Anonymous session cookie (to track credits)</li>
        <li>Payment info via Stripe (handled by Stripe)</li>
      </ul>
      <p>Contact: support@nanobanana-ai.dev</p>
    </main>
  )
}
