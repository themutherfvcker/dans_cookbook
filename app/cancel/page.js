export const metadata = { title: "Payment Canceled — Nano Banana" }

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <div className="bg-white border rounded-2xl shadow p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold">Payment canceled</h1>
        <p className="mt-3 text-gray-700">
          No problem — you can retry anytime.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/pricing"
            className="inline-flex items-center px-4 py-3 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200"
          >
            Back to Pricing
          </a>
          <a
            href="/#generator"
            className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700"
          >
            Use Free Credits
          </a>
        </div>
      </div>
    </main>
  )
}
