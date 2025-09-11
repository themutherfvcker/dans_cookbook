export const metadata = { title: "Docs", description: "How to use Nano Banana AI image generator." }

export default function Docs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-6">Docs</h1>
      <ol className="list-decimal ml-6 space-y-3">
        <li>Click <strong>Generate</strong> on the homepage with your prompt.</li>
        <li>Each image costs <strong>1 credit</strong>. Buy more on the Pricing page.</li>
        <li>Download your PNG or re-generate with tweaks.</li>
      </ol>
    </div>
  )
}
