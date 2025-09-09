"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function HomePage() {
  useEffect(() => {
    // --- Ensure AOS CSS is present (insert <link> into <head>) ---
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css"
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = AOS_HREF
      document.head.appendChild(link)
    }

    // --- Init external libs when available (requires THREE first) ---
    const initLibs = () => {
      try {
        if (window.AOS) window.AOS.init({ duration: 800, easing: "ease-in-out", once: true })
        if (window.feather) window.feather.replace()
        if (window.VANTA && window.THREE && !window._vanta) {
          window._vanta = window.VANTA.GLOBE({
            el: "#home",
            THREE: window.THREE, // <- IMPORTANT: pass THREE explicitly
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

    // Poll until all libs are loaded in the right order
    const libTimer = setInterval(() => {
      if (window.THREE && window.VANTA && window.AOS && window.feather) {
        clearInterval(libTimer)
        initLibs()
      }
    }, 200)

    // --- Wire the generator button to your API ---
    const genBtn = document.getElementById("nb-generate")
    const promptEl = document.getElementById("main-prompt")
    const outEl = document.getElementById("nb-output")
    const balEl = document.getElementById("nb-balance")

    async function refreshBalance() {
      try {
        const r = await fetch("/api/session", { cache: "no-store" })
        const j = await r.json()
        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance)
      } catch {}
    }

    async function onGenerate() {
      if (!promptEl || !outEl) return
      const prompt = promptEl.value?.trim()
      if (!prompt) {
        alert("Please enter a prompt")
        return
      }
      // UI: loading state
      outEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-gray-600">
          <svg class="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <div>Generating… (1 credit)</div>
        </div>
      `

      try {
        const resp = await fetch("/api/vertex/imagine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })
        const j = await resp.json()
        if (!resp.ok || !j?.ok) {
          const msg = j?.error || `HTTP ${resp.status}`
          outEl.innerHTML = `<p class="text-red-600">Error: ${msg}</p>`
          return
        }
        const dataUrl = j.dataUrl
        outEl.innerHTML = `
          <div class="w-full">
            <img src="${dataUrl}" alt="Generated" class="w-full h-auto rounded-md border" />
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
        const clearBtn = document.getElementById("nb-clear")
        if (clearBtn) clearBtn.addEventListener("click", () => { outEl.innerHTML = nbEmptyOutput })
        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance)
      } catch (e) {
        outEl.innerHTML = `<p class="text-red-600">Unexpected error. ${e?.message || ""}</p>`
      }
    }

    const nbEmptyOutput = `
      <div class="mt-6 flex flex-col items-center justify-center h-64">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No images generated yet</h3>
        <p class="mt-1 text-sm text-gray-500">Enter your prompt and unleash the power</p>
      </div>
    `
    if (outEl && !outEl.innerHTML.trim()) outEl.innerHTML = nbEmptyOutput

    if (genBtn) genBtn.addEventListener("click", onGenerate)
    refreshBalance()

    return () => {
      clearInterval(libTimer)
      if (genBtn) genBtn.removeEventListener("click", onGenerate)
      if (window._vanta && window._vanta.destroy) {
        window._vanta.destroy()
        window._vanta = null
      }
    }
  }, [])

  return (
    <>
      {/* Tailwind via CDN (easiest option) */}
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />

      {/* Load THREE *before* Vanta */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
      />
      {/* External libs that depend on THREE */}
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

      {/* Full site HTML (BODY ONLY) */}
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

  <!-- Hero Section -->
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

  <!-- Generator Section -->
  <section id="generator" class="py-12 bg-gray-50" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
              <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Try The AI Editor
              </p>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  Experience the power of nano-banana's natural language image editing. Credits: <span id="nb-balance">—</span>
              </p>
          </div>

          <div class="mt-10">
              <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <!-- Left Column -->
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
                                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 00-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                          </svg>
                                          <div class="flex text-sm text-gray-600">
                                              <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                                                  <span>Upload a file</span>
                                                  <input id="file-upload" name="file-upload" type="file" class="sr-only">
                                              </label>
                                              <p class="pl-1">or drag and drop</p>
                                          </div>
                                          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 50MB</p>
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

                  <!-- Right Column -->
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

  <!-- Features Section -->
  <section id="features" class="py-12 bg-white" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
              <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">Why Choose Nano Banana?</h2>
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Core Features
              </p>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  Nano-banana is the most advanced AI image editor on LMArena. Revolutionize your photo editing with natural language understanding
              </p>
          </div>

          <div class="mt-10">
              <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="message-square" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">Natural Language Editing</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Edit images using simple text prompts. Nano-banana AI understands complex instructions like GPT for images
                              </p>
                          </div>
                      </div>
                  </div>

                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="user" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">Character Consistency</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Maintain perfect character details across edits. This model excels at preserving faces and identities
                              </p>
                          </div>
                      </div>
                  </div>

                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="image" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">Scene Preservation</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Seamlessly blend edits with original backgrounds. Superior scene fusion compared to Flux Kontext
                              </p>
                          </div>
                      </div>
                  </div>

                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="zap" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">One-Shot Editing</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Perfect results in a single attempt. Nano-banana solves one-shot image editing challenges effortlessly
                              </p>
                          </div>
                      </div>
                  </div>

                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="layers" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">Multi-Image Context</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Process multiple images simultaneously. Support for advanced multi-image editing workflows
                              </p>
                          </div>
                      </div>
                  </div>

                  <div class="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                      <div class="px-4 py-5 sm:p-6">
                          <div class="flex items-center">
                              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                  <i data-feather="award" class="h-6 w-6 text-yellow-600"></i>
                              </div>
                              <div class="ml-5 w-0 flex-1">
                                  <h3 class="text-lg font-medium text-gray-900">AI UGC Creation</h3>
                              </div>
                          </div>
                          <div class="mt-4">
                              <p class="text-sm text-gray-500">
                                  Create consistent AI influencers and UGC content. Perfect for social media and marketing campaigns
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>

  <!-- Showcase Section -->
  <section id="showcase" class="py-12 bg-gray-50" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
              <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">Lightning-Fast AI Creations</h2>
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Showcase
              </p>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  See what Nano Banana generates in milliseconds
              </p>
          </div>

          <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <img class="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb1/640/360" alt="Mountain generation">
                      <h3 class="mt-4 text-lg font-medium text-gray-900">Ultra-Fast Mountain Generation</h3>
                      <p class="mt-1 text-sm text-gray-500">Created in 0.8 seconds with Nano Banana's optimized neural engine</p>
                  </div>
              </div>

              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <img class="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb2/640/360" alt="Garden creation">
                      <h3 class="mt-4 text-lg font-medium text-gray-900">Instant Garden Creation</h3>
                      <p class="mt-1 text-sm text-gray-500">Complex scene rendered in milliseconds using Nano Banana technology</p>
                  </div>
              </div>

              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <img class="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb3/640/360" alt="Beach synthesis">
                      <h3 class="mt-4 text-lg font-medium text-gray-900">Real-time Beach Synthesis</h3>
                      <p class="mt-1 text-sm text-gray-500">Nano Banana delivers photorealistic results at lightning speed</p>
                  </div>
              </div>

              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <img class="w-full h-auto object-cover rounded-md" src="https://picsum.photos/seed/nb4/640/360" alt="Aurora generation">
                      <h3 class="mt-4 text-lg font-medium text-gray-900">Rapid Aurora Generation</h3>
                      <p class="mt-1 text-sm text-gray-500">Advanced effects processed instantly with Nano Banana AI</p>
                  </div>
              </div>
          </div>

          <div class="mt-10 text-center">
              <a href="#generator" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  Try Nano Banana Generator
              </a>
          </div>
      </div>
  </section>

  <!-- Reviews Section -->
  <section id="reviews" class="py-12 bg-white" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
              <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">Testimonials</h2>
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  User Reviews
              </p>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  What creators are saying
              </p>
          </div>

          <div class="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=11" alt="AIArtistPro">
                          </div>
                          <div class="ml-4">
                              <h3 class="text-lg font-medium text-gray-900">AIArtistPro</h3>
                              <p class="text-sm text-gray-500">Digital Creator</p>
                          </div>
                      </div>
                      <div class="mt-4">
                          <p class="text-sm text-gray-600">
                              "This editor completely changed my workflow. The character consistency is incredible - miles ahead of Flux Kontext!"
                          </p>
                      </div>
                  </div>
              </div>

              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=12" alt="ContentCreator">
                          </div>
                          <div class="ml-4">
                              <h3 class="text-lg font-medium text-gray-900">ContentCreator</h3>
                              <p class="text-sm text-gray-500">UGC Specialist</p>
                          </div>
                      </div>
                      <div class="mt-4">
                          <p class="text-sm text-gray-600">
                              "Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!"
                          </p>
                      </div>
                  </div>
              </div>

              <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100?img=13" alt="PhotoEditor">
                          </div>
                          <div class="ml-4">
                              <h3 class="text-lg font-medium text-gray-900">PhotoEditor</h3>
                              <p class="text-sm text-gray-500">Professional Editor</p>
                          </div>
                      </div>
                      <div class="mt-4">
                          <p class="text-sm text-gray-600">
                              "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!"
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="py-12 bg-gray-50" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
              <h2 class="text-base text-yellow-600 font-semibold tracking-wide uppercase">Help Center</h2>
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Frequently Asked Questions
              </p>
          </div>

          <div class="mt-10 max-w-3xl mx-auto">
              <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">What is Nano Banana?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          It's a revolutionary AI image editing model that transforms photos using natural language prompts. This is currently the most powerful image editing model available, with exceptional consistency. It offers superior performance compared to Flux Kontext for consistent character editing and scene preservation.
                      </dd>
                  </div>
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">How does it work?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions like "place the creature in a snowy mountain" or "imagine the whole face and create it". It processes your text prompt and generates perfectly edited images.
                      </dd>
                  </div>
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">How is it better than Flux Kontext?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          This model excels in character consistency, scene blending, and one-shot editing. Users report it "completely destroys" Flux Kontext in preserving facial features and seamlessly integrating edits with backgrounds. It also supports multi-image context, making it ideal for creating consistent AI influencers.
                      </dd>
                  </div>
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">Can I use it for commercial projects?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          Yes! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. Many users leverage it for creating consistent AI influencers and product photography. The high-quality outputs are suitable for professional use.
                      </dd>
                  </div>
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">What types of edits can it handle?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications. It excels at understanding contextual instructions like "place in a blizzard" or "create the whole face" while maintaining photorealistic quality.
                      </dd>
                  </div>
                  <div>
                      <dt class="text-lg leading-6 font-medium text-gray-900">Where can I try Nano Banana?</dt>
                      <dd class="mt-2 text-base text-gray-500">
                          You can try nano-banana on LMArena or through our web interface. Simply upload your image, enter a text prompt describing your desired edits, and watch as nano-banana AI transforms your photo with incredible accuracy and consistency.
                      </dd>
                  </div>
              </dl>
          </div>
      </div>
  </section>

  <!-- CTA Section -->
  <section class="py-12 bg-yellow-600" data-aos="fade-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
              <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Ready to revolutionize your image editing?
              </h2>
              <p class="mt-3 max-w-2xl mx-auto text-xl text-yellow-100 sm:mt-4">
                  Join thousands of creators using Nano Banana for their AI editing needs.
              </p>
              <div class="mt-10">
                  <a href="#generator" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                      Try Nano Banana Now
                  </a>
              </div>
          </div>
      </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div class="col-span-2">
                  <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">About Nano Banana</h3>
                  <p class="mt-4 text-base text-gray-300">
                      The most advanced AI image editor that transforms photos using natural language prompts. Outperforms Flux Kontext in character consistency and scene preservation.
                  </p>
              </div>
              <div>
                  <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                  <ul class="mt-4 space-y-4">
                      <li><a href="#features" class="text-base text-gray-300 hover:text-white">Features</a></li>
                      <li><a href="#showcase" class="text-base text-gray-300 hover:text-white">Showcase</a></li>
                      <li><a href="#faq" class="text-base text-gray-300 hover:text-white">FAQ</a></li>
                      <li><a href="/pricing" class="text-base text-gray-300 hover:text-white">Pricing</a></li>
                  </ul>
              </div>
              <div>
                  <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                  <ul class="mt-4 space-y-4">
                      <li><a href="/privacy" class="text-base text-gray-300 hover:text-white">Privacy</a></li>
                      <li><a href="/terms" class="text-base text-gray-300 hover:text-white">Terms</a></li>
                      <li><a href="#" class="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
                  </ul>
              </div>
          </div>
          <div class="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
              <div class="flex space-x-6 md:order-2">
                  <a href="#" class="text-gray-400 hover:text-gray-300"><span class="sr-only">Twitter</span><i data-feather="twitter" class="h-6 w-6"></i></a>
                  <a href="#" class="text-gray-400 hover:text-gray-300"><span class="sr-only">Instagram</span><i data-feather="instagram" class="h-6 w-6"></i></a>
                  <a href="#" class="text-gray-400 hover:text-gray-300"><span class="sr-only">GitHub</span><i data-feather="github" class="h-6 w-6"></i></a>
              </div>
              <p class="mt-8 text-base text-gray-400 md:mt-0 md:order-1">&copy; ${new Date().getFullYear()} Nano Banana. All rights reserved.</p>
          </div>
      </div>
  </footer>
          `,
        }}
      />
    </>
  )
}
