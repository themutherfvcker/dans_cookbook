"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function HomePage() {
  useEffect(() => {
    // --- Ensure AOS CSS is present ---
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css"
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = AOS_HREF
      document.head.appendChild(link)
    }

    // --- Init external libs when available (needs THREE before Vanta) ---
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
            minHeight: 200,
            minWidth: 200,
            scale: 1,
            scaleMobile: 1,
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

    // --- DOM refs ---
    const genBtn = document.getElementById("nb-generate")
    const promptEl = document.getElementById("main-prompt")
    const outEl = document.getElementById("nb-output")
    const balEl = document.getElementById("nb-balance")
    const fileInput = document.getElementById("file-upload")
    const fileNote = document.getElementById("nb-file-note")

    // --- helpers ---
    const nbEmptyOutput = `
      <div class="mt-6 flex flex-col items-center justify-center h-64">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No images generated yet</h3>
        <p class="mt-1 text-sm text-gray-500">Enter your prompt and unleash the power</p>
      </div>
    `
    if (outEl && !outEl.innerHTML.trim()) outEl.innerHTML = nbEmptyOutput

    async function refreshBalance() {
      try {
        const r = await fetch("/api/session", { cache: "no-store" })
        const j = await r.json()
        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance)
      } catch {}
    }

    function showLoading() {
      if (!outEl) return
      outEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-gray-600">
          <svg class="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <div>Generating… (1 credit)</div>
        </div>
      `
    }

    function showError(msg) {
      if (!outEl) return
      outEl.innerHTML = `<p class="text-red-600">Error: ${msg}</p>`
    }

    // Read, downscale, and encode the selected image to a data URL
    async function fileToDataUrlCompressed(file, maxDim = 1280, jpegQuality = 0.9) {
      // Validate type
      const okTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!okTypes.includes(file.type)) {
        throw new Error("Please upload a PNG, JPG, or WEBP image.")
      }
      // Soft size guard (client-side, typical Vercel limits ~4–5MB for serverless body)
      const MAX_RAW_BYTES = 8 * 1024 * 1024 // 8MB raw input; we’ll compress below
      if (file.size > MAX_RAW_BYTES) {
        throw new Error("File is too large. Please use an image under 8MB.")
      }

      const blobUrl = URL.createObjectURL(file)
      const img = await new Promise((resolve, reject) => {
        const im = new Image()
        im.onload = () => resolve(im)
        im.onerror = () => reject(new Error("Could not read image"))
        im.src = blobUrl
      })

      // Compute scale
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      const scale = Math.min(1, maxDim / Math.max(w, h))
      const outW = Math.max(1, Math.round(w * scale))
      const outH = Math.max(1, Math.round(h * scale))

      // Draw to canvas and encode JPG
      const cvs = document.createElement("canvas")
      cvs.width = outW
      cvs.height = outH
      const ctx = cvs.getContext("2d")
      ctx.drawImage(img, 0, 0, outW, outH)

      const dataUrl = cvs.toDataURL("image/jpeg", jpegQuality)

      // cleanup
      URL.revokeObjectURL(blobUrl)

      // Small guard on final payload size (~3–4x bigger than bytes due to base64)
      const approxBytes = Math.ceil((dataUrl.length - "data:image/jpeg;base64,".length) * 3 / 4)
      if (approxBytes > 4.5 * 1024 * 1024) {
        throw new Error("Compressed image is still too large for the server. Try a smaller image or lower quality.")
      }
      return dataUrl
    }

    // File chooser note
    function updateFileNote() {
      if (!fileInput || !fileNote) return
      const f = fileInput.files?.[0]
      if (!f) { fileNote.textContent = "PNG, JPG, WEBP up to ~8MB"; return }
      const kb = Math.round(f.size / 1024)
      fileNote.textContent = `${f.name} — ${kb} KB`
    }
    fileInput?.addEventListener("change", updateFileNote)

    async function onGenerate() {
      const prompt = promptEl?.value?.trim()
      if (!prompt) { alert("Please enter a prompt"); return }
      showLoading()

      try {
        const file = fileInput?.files?.[0] || null
        let resp
        if (file) {
          // Convert to compressed data URL and send JSON to /api/vertex/edit
          const imageDataUrl = await fileToDataUrlCompressed(file, 1280, 0.9)
          resp = await fetch("/api/vertex/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, imageDataUrl }),
          })
        } else {
          // Text-only
          resp = await fetch("/api/vertex/imagine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          })
        }

        const j = await resp.json()
        if (!resp.ok || !j?.ok) {
          showError(j?.error || `HTTP ${resp.status}`)
          return
        }

        const dataUrl = j.dataUrl
        outEl.innerHTML = `
          <div class="w-full">
            <img src="${dataUrl}" alt="Result" class="w-full h-auto rounded-md border" />
            <div class="mt-3 flex gap-3">
              <a href="${dataUrl}" download="nanobanana.png"
                 class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-black">
                Download PNG
              </a>
              <button id="nb-clear" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50">
                Clear
              </button>
            </div>
          </div>
        `
        document.getElementById("nb-clear")?.addEventListener("click", () => { outEl.innerHTML = nbEmptyOutput })
        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance)
      } catch (e) {
        showError(e?.message || "Unexpected error.")
      }
    }

    if (genBtn) genBtn.addEventListener("click", onGenerate)
    refreshBalance()

    return () => {
      clearInterval(libTimer)
      if (genBtn) genBtn.removeEventListener("click", onGenerate)
      fileInput?.removeEventListener("change", updateFileNote)
      if (window._vanta && window._vanta.destroy) { window._vanta.destroy(); window._vanta = null }
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

      <style>{`
        .hero-gradient { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04); }
        .banana-float { animation: nb-float 6s ease-in-out infinite; }
        @keyframes nb-float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
      `}</style>

      {/* Full site HTML injected */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
  <!-- Navbar -->
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <img class="h-8 w-auto" src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75" alt="Nano Banana">
            <span class="ml-2 text-xl font-bold text-gray-900">Nano Banana</span>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <a href="#features" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Features</a>
          <a href="#showcase" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Showcase</a>
          <a href="#reviews" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">Reviews</a>
          <a href="#faq" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">FAQ</a>
          <a href="/pricing" class="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-yellow-500">Pricing</a>
        </div>
        <div class="flex items-center">
          <a href="#generator" class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            Try Now
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <div id="home" class="hero-gradient relative overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
        <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div class="sm:text-center lg:text-left">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span class="block">The AI model that</span>
              <span class="block text-white">outperforms Flux Kontext</span>
            </h1>
            <p class="mt-3 text-base text-gray-800 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character editing and scene preservation that surpasses Flux Kontext.
            </p>
            <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div class="rounded-md shadow">
                <a href="#generator" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-yellow-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Get Started
                </a>
              </div>
              <div class="mt-3 sm:mt-0 sm:ml-3">
                <a href="#features" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
      <img class="banana-float h-56 w-full object-contain sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75" alt="Banana decoration">
    </div>
  </div>

  <!-- Generator -->
  <section id="generator" class="py-12 bg-gray-50" data-aos="fade-up">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="lg:text-center">
        <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
        <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Try The AI Editor</p>
        <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Experience the power of nano-banana's natural language image editing. Credits: <span id="nb-balance">—</span>
        </p>
      </div>

      <div class="mt-10">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <!-- Left -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Prompt Engine</h3>
              <p class="mt-1 text-sm text-gray-500">Transform your image with AI-powered editing</p>
              <div class="mt-5 border-t border-gray-200"></div>

              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-900">Batch Processing Pro</h4>
                <p class="mt-1 text-sm text-gray-500">Enable batch mode to process multiple images at once</p>

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700">Reference Image</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div class="space-y-1 text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="flex text-sm text-gray-600">
                        <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only">
                        </label>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p id="nb-file-note" class="text-xs text-gray-500">PNG, JPG, WEBP up to ~8MB</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <label for="main-prompt" class="block text-sm font-medium text-gray-700">Main Prompt</label>
                  <div class="mt-1">
                    <textarea id="main-prompt" name="main-prompt" rows="4" class="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Describe the edits you want to make...">a cinematic banana astronaut on the moon, 35mm film look</textarea>
                  </div>
                </div>

                <div class="mt-5">
                  <button id="nb-generate" type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Output Gallery</h3>
              <p class="mt-1 text-sm text-gray-500">Your ultra-fast AI creations appear here instantly</p>
              <div class="mt-5 border-t border-gray-200"></div>
              <div id="nb-output" class="mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- (rest of your sections unchanged: Features, Showcase, Reviews, FAQ, CTA, Footer) -->
          `,
        }}
      />
    </>
  )
}
