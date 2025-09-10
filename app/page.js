/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

// ---- Generator constants (from your /app/generator/page.js) ----
const STYLE_CHIPS = [
  { label: "Photorealistic", text: "ultra realistic, natural lighting, 50mm lens, high detail" },
  { label: "Cinematic", text: "cinematic lighting, volumetric, dramatic shadows, 35mm film look" },
  { label: "Studio Portrait", text: "studio portrait, softbox lighting, sharp eyes, skin texture" },
  { label: "Fashion Editorial", text: "editorial fashion, clean backdrop, professional styling" },
  { label: "Moody", text: "moody, low-key lighting, high contrast, grain" },
  { label: "Vibrant", text: "vibrant colors, crisp detail, punchy contrast" },
]

const ASPECTS = [
  { k: "1:1",  w: 1024, h: 1024 },
  { k: "3:4",  w: 960,  h: 1280 },
  { k: "4:3",  w: 1280, h: 960  },
  { k: "16:9", w: 1536, h: 864  },
  { k: "9:16", w: 864,  h: 1536 },
]

// ---- Inline Generator section used on the homepage ----
function HomeGeneratorSection() {
  const [balance, setBalance] = useState(null)
  const [activeTab, setActiveTab] = useState("text") // "text" | "image"

  // Inputs
  const [prompt, setPrompt] = useState("a cinematic banana astronaut on the moon, 35mm film look")
  const [aspect, setAspect] = useState("1:1")
  const [strength, setStrength] = useState(0.6) // image→image only

  // UI state
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [resultUrl, setResultUrl] = useState("")
  const [history, setHistory] = useState([])

  // Upload state
  const [previewUrl, setPreviewUrl] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  // Load AOS CSS (via CDN) once
  useEffect(() => {
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css"
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = AOS_HREF
      document.head.appendChild(link)
    }
  }, [])

  // Init AOS when things change
  useEffect(() => {
    if (window.AOS) window.AOS.init({ duration: 600, easing: "ease-out", once: true })
  }, [resultUrl, history, activeTab])

  // Credits
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/session", { cache: "no-store" })
        const j = await r.json()
        if (typeof j?.balance === "number") setBalance(j.balance)
      } catch {}
    })()
  }, [])

  // Clean up preview blob
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function setPreviewFile(file) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }
  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Drag & drop
  useEffect(() => {
    if (activeTab !== "image") return
    const el = dropRef.current
    if (!el) return
    const onDrag = (e) => {
      e.preventDefault(); e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
      else if (e.type === "dragleave") setDragActive(false)
    }
    const onDrop = (e) => {
      e.preventDefault(); e.stopPropagation(); setDragActive(false)
      const f = e.dataTransfer?.files?.[0]; if (f) setPreviewFile(f)
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
  }, [activeTab, previewUrl])

  function applyChip(chipText) {
    if (!prompt || prompt === "a cinematic banana astronaut on the moon, 35mm film look") {
      setPrompt(chipText)
    } else {
      setPrompt(prev => `${prev.trim().replace(/\.$/, "")}. ${chipText}`)
    }
  }

  // Convert file → compressed DataURL (keeps JSON simple)
  async function fileToDataUrlCompressed(file, _maxDim = 1536, jpegQuality = 0.9) {
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
    const target = ASPECTS.find(a => a.k === aspect) || ASPECTS[0]
    const maxTarget = Math.max(target.w, target.h)
    const scale = Math.min(1, maxTarget / Math.max(w, h))
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const cvs = document.createElement("canvas")
    cvs.width = outW
    cvs.height = outH
    const ctx = cvs.getContext("2d")
    ctx.drawImage(img, 0, 0, outW, outH)
    const dataUrl = cvs.toDataURL("image/jpeg", jpegQuality)
    URL.revokeObjectURL(blobUrl)

    const approxBytes = Math.ceil((dataUrl.length - "data:image/jpeg;base64,".length) * 3 / 4)
    if (approxBytes > 5 * 1024 * 1024) {
      throw new Error("Compressed image still too big. Try a smaller image.")
    }
    return dataUrl
  }

  // Robust JSON reader (prevents “Unexpected end of JSON input”)
  async function safeReadJson(resp) {
    const raw = await resp.text()
    if (!raw) {
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText} (empty body)`)
      throw new Error("Empty response from server")
    }
    try {
      return JSON.parse(raw)
    } catch {
      const preview = raw.slice(0, 300).replace(/\s+/g, " ")
      throw new Error(`Non-JSON from server (status ${resp.status}). Preview: ${preview}`)
    }
  }

  async function onGenerate() {
    setBusy(true)
    setError("")
    setResultUrl("")
    try {
      if (!prompt.trim()) throw new Error("Please enter a prompt.")

      const meta = { aspect, strength }
      let resp
      if (activeTab === "image") {
        const file = fileInputRef.current?.files?.[0] || null
        if (!file) throw new Error("Please upload a reference image.")
        const imageDataUrl = await fileToDataUrlCompressed(file, 1536, 0.9)
        resp = await fetch("/api/vertex/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), imageDataUrl, meta }),
          cache: "no-store",
        })
      } else {
        resp = await fetch("/api/vertex/imagine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), meta }),
          cache: "no-store",
        })
      }

      const j = await safeReadJson(resp)
      if (!resp.ok || !j?.ok) throw new Error(j?.error || `HTTP ${resp.status}`)

      setResultUrl(j.dataUrl || "")
      setBalance(typeof j.balance === "number" ? j.balance : balance)
      setHistory(h => [{ url: j.dataUrl, at: Date.now(), prompt, mode: activeTab, aspect }, ...h].slice(0, 40))
    } catch (e) {
      setError(e?.message || "Generation failed")
    } finally {
      setBusy(false)
    }
  }

  const aspectHelp = "Aspect ratio hint (client-side). Your API may ignore it unless implemented server-side."

  return (
    <section id="generator" className="py-12 bg-gray-50" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Try The AI Editor
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Experience the power of nano-banana's natural language image editing. Credits:{" "}
            <span>{balance ?? "—"}</span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: controls */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-4">
            <div className="px-4 py-5 sm:p-6 space-y-5">
              {/* Tabs */}
              <div className="flex rounded-lg overflow-hidden border">
                <button
                  className={`flex-1 px-3 py-2 text-sm font-medium ${activeTab === "text" ? "bg-yellow-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => setActiveTab("text")}
                >
                  Text → Image
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm font-medium ${activeTab === "image" ? "bg-yellow-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => setActiveTab("image")}
                >
                  Image → Image
                </button>
              </div>

              {/* Quick styles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Styles</h3>
                  <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setPrompt("")}>
                    Clear prompt
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_CHIPS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      className="px-3 py-1.5 rounded-full text-xs font-medium border hover:bg-gray-50"
                      onClick={() => applyChip(c.text)}
                      title={c.text}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect + strength */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aspect Ratio</label>
                  <select
                    value={aspect}
                    onChange={(e) => setAspect(e.target.value)}
                    className="mt-1 w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                    title={aspectHelp}
                  >
                    {ASPECTS.map((a) => (
                      <option key={a.k} value={a.k}>{a.k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Edit Strength {activeTab === "image" ? `(${strength.toFixed(2)})` : ""}
                  </label>
                  <input
                    type="range"
                    className="mt-2 w-full"
                    min={0} max={1} step={0.05}
                    disabled={activeTab !== "image"}
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    title="Lower = follow image more. Higher = follow prompt more."
                  />
                </div>
              </div>

              {/* Upload (image→image) */}
              {activeTab === "image" && (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Reference Image</h2>
                    <button className="text-xs text-gray-500 hover:text-gray-700" onClick={clearPreview}>Clear</button>
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
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 rounded-md border" />
                        ) : null}
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
                </div>
              )}

              {/* Prompt */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={activeTab === "image" ? "Describe the edits you want to apply…" : "Describe the image you want to generate…"}
                />
              </div>

              <button
                onClick={onGenerate}
                disabled={busy}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60"
              >
                {busy ? "Generating…" : activeTab === "image" ? "Apply Edits (−1 credit)" : "Generate (−1 credit)"}
              </button>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <p className="text-xs text-gray-500">
                Aspect & strength are hints. Your API can read them from <code>meta</code> if implemented.
              </p>
            </div>
          </div>

          {/* Right: result & history */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900">Result</h2>
                  {resultUrl && (
                    <div className="flex gap-3">
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
                  )}
                </div>

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
                  </div>
                )}
              </div>
            </div>

            {/* Local history */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900">History (local)</h2>
                  {history.length > 0 && (
                    <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-gray-700">
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
                        title={`${h.mode === "image" ? "Image→Image" : "Text→Image"} • ${h.aspect} • ${h.prompt}`}
                      >
                        <img src={h.url} alt="" className="w-full h-32 object-cover group-hover:opacity-90" />
                        <div className="p-2 text-[11px] text-gray-600 line-clamp-2">
                          <span className="mr-1 inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                            {h.mode === "image" ? "I→I" : "T→I"}
                          </span>
                          <span className="mr-1 inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                            {h.aspect}
                          </span>
                          {h.prompt}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    // Ensure AOS CSS present
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css"
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = AOS_HREF
      document.head.appendChild(link)
    }

    // Init external libs when ready (needs THREE first)
    const initLibs = () => {
      try {
        if (window.AOS) window.AOS.init({ duration: 800, easing: "ease-in-out", once: true })
        if (window.feather) window.feather.replace()
        if (window.VANTA && window.THREE && !window._vanta) {
          window._vanta = window.VANTA.GLOBE({
            el: "#home",
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xffc107,
            backgroundColor: 0xf6d365,
            size: 0.8,
          })
        }
      } catch {}
    }

    const libTimer = setInterval(() => {
      if (window.THREE && window.VANTA && window.AOS && window.feather) {
        clearInterval(libTimer)
        initLibs()
      }
    }, 200)

    return () => {
      clearInterval(libTimer)
      if (window._vanta && window._vanta.destroy) {
        window._vanta.destroy()
        window._vanta = null
      }
    }
  }, [])

  return (
    <>
      {/* Tailwind via CDN */}
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />

      {/* THREE before Vanta */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" strategy="afterInteractive" />

      {/* Minimal custom styles */}
      <style>{`
        .hero-gradient { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04); }
        .banana-float { animation: nb-float 6s ease-in-out infinite; }
        @keyframes nb-float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
      `}</style>

      {/* --- NAV + HERO (unchanged) --- */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75" alt="Nano Banana" />
                <span className="ml-2 text-xl font-bold text-gray-900">Nano Banana</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Features</a>
              <a href="#showcase" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Showcase</a>
              <a href="#reviews" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Reviews</a>
              <a href="#faq" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">FAQ</a>
              <a href="/pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-yellow-500">Pricing</a>
            </div>
            <div className="flex items-center">
              <a href="#generator" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                Try Now
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="home" className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">The AI model that</span>
                  <span className="block text-white">outperforms Flux Kontext</span>
                </h1>
                <p className="mt-3 text-base text-gray-800 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character editing and scene preservation that surpasses Flux Kontext.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#generator" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-yellow-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img className="banana-float h-56 w-full object-contain sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75" alt="Banana decoration" />
        </div>
      </div>

      {/* ---- REPLACED AI IMAGE EDITOR with full Generator ---- */}
      <HomeGeneratorSection />

      {/* ---- Rest of homepage (unchanged) ---- */}
      <section id="features" className="py-12 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Why Choose Nano Banana?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Core Features</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Nano-banana is the most advanced AI image editor on LMArena. Revolutionize your photo editing with natural language understanding
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="message-square" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Natural Language Editing</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Edit images using simple text prompts. Nano-banana AI understands complex instructions like GPT for images</p>
                  </div>
                </div>
              </div>

              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="user" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Character Consistency</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Maintain perfect character details across edits. This model excels at preserving faces and identities</p>
                  </div>
                </div>
              </div>

              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="image" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Scene Preservation</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Seamlessly blend edits with original backgrounds. Superior scene fusion compared to Flux Kontext</p>
                  </div>
                </div>
              </div>

              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="zap" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">One-Shot Editing</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Perfect results in a single attempt. Nano-banana solves one-shot image editing challenges effortlessly</p>
                  </div>
                </div>
              </div>

              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="layers" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Multi-Image Context</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Process multiple images simultaneously. Support for advanced multi-image editing workflows</p>
                  </div>
                </div>
              </div>

              <div className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather="award" className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">AI UGC Creation</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Create consistent AI influencers and UGC content. Perfect for social media and marketing campaigns</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="py-12 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Lightning-Fast AI Creations</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Showcase</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">See what Nano Banana generates in milliseconds</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <img className="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb1/640/360" alt="Mountain generation" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Ultra-Fast Mountain Generation</h3>
                <p className="mt-1 text-sm text-gray-500">Created in 0.8 seconds with Nano Banana's optimized neural engine</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <img className="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb2/640/360" alt="Garden creation" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Instant Garden Creation</h3>
                <p className="mt-1 text-sm text-gray-500">Complex scene rendered in milliseconds using Nano Banana technology</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <img className="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb3/640/360" alt="Beach synthesis" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Beach Synthesis</h3>
                <p className="mt-1 text-sm text-gray-500">Nano Banana delivers photorealistic results at lightning speed</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <img className="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb4/640/360" alt="Aurora generation" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Rapid Aurora Generation</h3>
                <p className="mt-1 text-sm text-gray-500">Advanced effects processed instantly with Nano Banana AI</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a href="#generator" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              Try Nano Banana Generator
            </a>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-12 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">User Reviews</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">What creators are saying</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=11" alt="AIArtistPro" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">AIArtistPro</h3>
                    <p className="text-sm text-gray-500">Digital Creator</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    "This editor completely changed my workflow. The character consistency is incredible - miles ahead of Flux Kontext!"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=12" alt="ContentCreator" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">ContentCreator</h3>
                    <p className="text-sm text-gray-500">UGC Specialist</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    "Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=13" alt="PhotoEditor" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">PhotoEditor</h3>
                    <p className="text-sm text-gray-500">Professional Editor</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="faq" className="py-12 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Help Center</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">What is Nano Banana?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  It's a revolutionary AI image editing model that transforms photos using natural language prompts. This is currently the most powerful image editing model available, with exceptional consistency. It offers superior performance compared to Flux Kontext for consistent character editing and scene preservation.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">How does it work?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions like "place the creature in a snowy mountain" or "imagine the whole face and create it". It processes your text prompt and generates perfectly edited images.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">How is it better than Flux Kontext?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  This model excels in character consistency, scene blending, and one-shot editing. Users report it "completely destroys" Flux Kontext in preserving facial features and seamlessly integrating edits with backgrounds. It also supports multi-image context, making it ideal for creating consistent AI influencers.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">Can I use it for commercial projects?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. Many users leverage it for creating consistent AI influencers and product photography. The high-quality outputs are suitable for professional use.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">What types of edits can it handle?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications. It excels at understanding contextual instructions like "place in a blizzard" or "create the whole face" while maintaining photorealistic quality.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">Where can I try Nano Banana?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  You can try nano-banana on LMArena or through our web interface. Simply upload your image, enter a text prompt describing your desired edits, and watch as nano-banana AI transforms your photo with incredible accuracy and consistency.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-12 bg-yellow-600" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to revolutionize your image editing?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-yellow-100 sm:mt-4">
              Join thousands of creators using Nano Banana for their AI editing needs.
            </p>
            <div className="mt-10">
              <a href="#generator" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                Try Nano Banana Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About Nano Banana</h3>
              <p className="mt-4 text-base text-gray-300">
                The most advanced AI image editor that transforms photos using natural language prompts. Outperforms Flux Kontext in character consistency and scene preservation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#showcase" className="text-base text-gray-300 hover:text-white">Showcase</a></li>
                <li><a href="#faq" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
                <li><a href="/pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/privacy" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="/terms" className="text-base text-gray-300 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300"><span className="sr-only">Twitter</span><i data-feather="twitter" className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-gray-300"><span className="sr-only">Instagram</span><i data-feather="instagram" className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-gray-300"><span className="sr-only">GitHub</span><i data-feather="github" className="h-6 w-6" /></a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">&copy; {new Date().getFullYear()} Nano Banana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
