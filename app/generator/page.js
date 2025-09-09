"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

export default function GeneratorPage() {
  const [balance, setBalance] = useState(null)
  const [prompt, setPrompt] = useState("a cinematic banana astronaut on the moon, 35mm film look")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [resultUrl, setResultUrl] = useState("")
  const [history, setHistory] = useState([]) // [{url, at, prompt}]
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)
  const dropRef = useRef(null)
  const previewRef = useRef(null)

  // --- Tailwind / libs (like homepage approach) ---
  useEffect(() => {
    // Add AOS CSS once
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css"
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = AOS_HREF
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    if (window.AOS) window.AOS.init({ duration: 600, easing: "ease-out", once: true })
  }, [resultUrl, history])

  // --- Fetch credit balance on mount ---
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/session", { cache: "no-store" })
        const j = await r.json()
        if (typeof j?.balance === "number") setBalance(j.balance)
      } catch {}
    })()
  }, [])

  // --- Helpers: image compression to dataURL (JSON-safe) ---
  async function fileToDataUrlCompressed(file, maxDim = 1536, jpegQuality = 0.9) {
    const okTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!okTypes.includes(file.type)) throw new Error("Please upload PNG, JPG, or WEBP.")
    if (file.size > 10 * 1024 * 1024) throw new Error("Image is too large. Keep under ~10MB.")

    const blobUrl = URL.createObjectURL(file)
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error("Could not read image"))
      i.src = blobUrl
    })
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    const scale = Math.min(1, maxDim / Math.max(w, h))
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const cvs = document.createElement("canvas")
    cvs.width = outW
    cvs.height = outH
    const ctx = cvs.getContext("2d")
    ctx.drawImage(img, 0, 0, outW, outH)
    const dataUrl = cvs.toDataURL("image/jpeg", jpegQuality)
    URL.revokeObjectURL(blobUrl)

    // small guard for base64 (~33% overhead)
    const approxBytes = Math.ceil((dataUrl.length - "data:image/jpeg;base64,".length) * 3 / 4)
    if (approxBytes > 5 * 1024 * 1024) {
      throw new Error("Compressed image still too big. Try a smaller image.")
    }
    return dataUrl
  }

  function setPreviewFile(file) {
    if (!previewRef.current) return
    const url = URL.createObjectURL(file)
    previewRef.current.src = url
    previewRef.current.dataset.filename = file.name || "upload"
  }

  function clearPreview() {
    if (previewRef.current) {
      previewRef.current.src = ""
      previewRef.current.removeAttribute("data-filename")
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // --- Drag & drop wiring ---
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const onDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
      else if (e.type === "dragleave") setDragActive(false)
    }
    const onDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) {
        try { setPreviewFile(f) } catch {}
      }
    }
    el.addEventListener("dragenter", onDrag)
    el.addEventListener("dragover", onDrag)
    el.addEventListener("dragleave", onDrag)
    el.addEventListener("drop", onDrop)
    return () => {
      el.removeEventListener("dragenter", onDrag)
      el.removeEventListener("dragover", onDrag)
      el.removeEventListener("dragleave", onDrag)
      el.removeEventListener("drop", onDrop)
    }
  }, [])

  // --- Generate handler ---
  async function onGenerate() {
    setBusy(true)
    setError("")
    setResultUrl("")
    try {
      const fileInput = fileInputRef.current
      const file = fileInput?.files?.[0] || null
      let resp
      if (file) {
        const imageDataUrl = await fileToDataUrlCompressed(file, 1536, 0.9)
        resp = await fetch("/api/vertex/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), imageDataUrl }),
        })
      } else {
        resp = await fetch("/api/vertex/imagine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        })
      }
      const j = await resp.json()
      if (!resp.ok || !j?.ok) {
        throw new Error(j?.error || `HTTP ${resp.status}`)
      }
      setResultUrl(j.dataUrl || "")
      setBalance(typeof j.balance === "number" ? j.balance : balance)
      setHistory((h) => [{ url: j.dataUrl, at: Date.now(), prompt }, ...h].slice(0, 30))
    } catch (e) {
      setError(e?.message || "Generation failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Tailwind via CDN */}
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img className="h-8 w-auto" src="/banana-decoration.png" alt="Nano Banana" />
              <a href="/" className="text-lg font-semibold text-gray-900">Nano Banana</a>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Generator</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/pricing" className="text-sm text-gray-700 hover:text-gray-900">Pricing</a>
              <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                Credits: {balance ?? "—"}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar: upload & prompt */}
          <section className="lg:col-span-4">
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Reference Image</h2>
                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={clearPreview}
                >Clear</button>
              </div>

              <div
                ref={dropRef}
                className={[
                  "rounded-md border-2 border-dashed",
                  dragActive ? "border-yellow-500 bg-yellow-50" : "border-gray-300 bg-gray-50"
                ].join(" ")}
              >
                <label htmlFor="file-input" className="cursor-pointer block">
                  <div className="px-6 py-6 text-center">
                    <img
                      ref={previewRef}
                      src=""
                      alt=""
                      className="mx-auto max-h-48 rounded-md border hidden"
                      onLoad={(e) => { e.currentTarget.classList.remove("hidden") }}
                    />
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium text-yellow-700 hover:text-yellow-800">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to ~10MB</p>
                  </div>
                </label>
                <input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPreviewFile(f)
                  }}
                />
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Describe your edit or generation…"
                />
              </div>

              <button
                onClick={onGenerate}
                disabled={busy}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60"
              >
                {busy ? "Generating…" : "Generate (−1 credit)"}
              </button>

              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Tip: With an image uploaded, we’ll **edit** it using your prompt. Without an image, we’ll **generate** from text.
              </p>
            </div>
          </section>

          {/* Right: canvas/result */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Result</h2>

              {!resultUrl && (
                <div className="h-72 border rounded-md grid place-items-center text-gray-500">
                  {busy ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle>
                        <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75"></path>
                      </svg>
                      <span>Generating…</span>
                    </div>
                  ) : (
                    <span>Generated image will appear here</span>
                  )}
                </div>
              )}

              {resultUrl && (
                <div className="space-y-3" data-aos="fade-in">
                  <img src={resultUrl} alt="Result" className="w-full h-auto rounded-md border" />
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={resultUrl}
                      download="nanobanana.png"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-black"
                    >
                      Download PNG
                    </a>
                    <button
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={() => setResultUrl("")}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Local history */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">History (local)</h2>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      className="group border rounded-md overflow-hidden text-left"
                      onClick={() => setResultUrl(h.url)}
                      title={h.prompt}
                    >
                      <img src={h.url} alt="" className="w-full h-32 object-cover group-hover:opacity-90" />
                      <div className="p-2 text-xs text-gray-600 line-clamp-2">{h.prompt}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
