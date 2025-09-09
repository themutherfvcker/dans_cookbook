import Link from "next/link"

export const metadata = { title: "Payment Success — Nano Banana" }

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <div className="bg-white border rounded-2xl shadow p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold">🎉 Payment successful!</h1>
        <p className="mt-3 text-gray-700">
          Your credits will appear in a few seconds.
        </p>
        <Link
          href="/#generator"
          className="mt-6 inline-flex items-center px-4 py-3 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700"
        >
          Start Generating
        </Link>
      </div>
    </main>
  )
}
