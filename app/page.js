"use client";

import Head from "next/head";
import { useEffect } from "react";
import Script from "next/script";

export default function HomePage() {
  useEffect(() => {
    // Ensure AOS CSS is present
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css";
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = AOS_HREF;
      document.head.appendChild(link);
    }

    // Init external libs when available (requires THREE first)
    const initLibs = () => {
      try {
        if (window.AOS) window.AOS.init({ duration: 800, easing: "ease-in-out", once: true });
        if (window.feather) window.feather.replace();
        if (window.VANTA && window.THREE && !window._vanta) {
          window._vanta = window.VANTA.GLOBE({
            el: "#home-hero",
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
          });
        }
      } catch {}
    };

    const libTimer = setInterval(() => {
      if (window.THREE && window.VANTA && window.AOS && window.feather) {
        clearInterval(libTimer);
        initLibs();
      }
    }, 200);

    // ---- Generator wiring (text-to-image or image-to-image, 1 credit) ----
    const genBtn = document.getElementById("nb-generate");
    const promptEl = document.getElementById("main-prompt");
    const outEl = document.getElementById("nb-output");
    const balEl = document.getElementById("nb-balance");
    const fileInput = document.getElementById("file-upload");

    async function refreshBalance() {
      try {
        const r = await fetch("/api/session", { cache: "no-store" });
        const j = await r.json();
        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance);
      } catch {}
    }

    const nbEmptyOutput = `
      <div class="mt-6 flex flex-col items-center justify-center h-64">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No images generated yet</h3>
        <p class="mt-1 text-sm text-gray-500">Enter your prompt and unleash the power</p>
      </div>
    `;

    if (outEl && !outEl.innerHTML.trim()) outEl.innerHTML = nbEmptyOutput;

    async function onGenerate() {
      if (!promptEl || !outEl) return;
      const prompt = promptEl.value?.trim();
      if (!prompt) {
        alert("Please enter a prompt");
        return;
      }

      outEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-gray-600">
          <svg class="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <div>Generating… (1 credit)</div>
        </div>
      `;

      try {
        const file = fileInput?.files?.[0] || null;
        let resp;

        if (file) {
          // Image + prompt → /api/vertex/edit (multipart)
          const fd = new FormData();
          fd.append("prompt", prompt);
          fd.append("image", file, file.name);
          resp = await fetch("/api/vertex/edit", { method: "POST", body: fd });
        } else {
          // Text-only → /api/vertex/imagine (JSON)
          resp = await fetch("/api/vertex/imagine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });
        }

        const j = await resp.json();
        if (!resp.ok || !j?.ok) {
          const msg = j?.error || `HTTP ${resp.status}`;
          outEl.innerHTML = `<p class="text-red-600">Error: ${msg}</p>`;
          return;
        }

        const dataUrl = j.dataUrl;
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
        `;
        const clearBtn = document.getElementById("nb-clear");
        if (clearBtn) clearBtn.addEventListener("click", () => { outEl.innerHTML = nbEmptyOutput; });

        if (typeof j?.balance === "number" && balEl) balEl.textContent = String(j.balance);
      } catch (e) {
        outEl.innerHTML = `<p class="text-red-600">Unexpected error. ${e?.message || ""}</p>`;
      }
    }

    if (genBtn) genBtn.addEventListener("click", onGenerate);
    refreshBalance();

    return () => {
      clearInterval(libTimer);
      if (genBtn) genBtn.removeEventListener("click", onGenerate);
      if (window._vanta && window._vanta.destroy) {
        window._vanta.destroy();
        window._vanta = null;
      }
    };
  }, []);

  return (
    <>
      {/* SEO */}
      <Head>
        <title>NanoBanana – Text-Based AI Image Editor</title>
        <meta
          name="description"
          content="Edit photos with simple text prompts. NanoBanana preserves faces, characters, and scenes with unmatched accuracy."
        />
      </Head>

      {/* Tailwind via CDN */}
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      {/* THREE before Vanta */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="afterInteractive" />
      {/* Dependent libs */}
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

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75"
                  alt="NanoBanana"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">NanoBanana</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">
                Features
              </a>
              <a href="#showcase" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">
                Showcase
              </a>
              <a href="#reviews" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">
                Reviews
              </a>
              <a href="#faq" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-yellow-500">
                FAQ
              </a>
              <a href="/pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-yellow-500">
                Pricing
              </a>
            </div>
            <div className="flex items-center">
              <a
                href="#generator"
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Try Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div id="home-hero" className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-10 pt-12 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-24 xl:pb-28">
            <main className="mt-6 mx-auto max-w-7xl px-4 sm:mt-10 sm:px-6 md:mt-12 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">AI Image Editing with</span>
                  <span className="block text-white">Simple Text</span>
                </h1>
                <p className="mt-3 text-base text-gray-900 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Type what you want changed. NanoBanana preserves faces, characters, and scenes with unmatched accuracy.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                  <a
                    href="#generator"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-yellow-700 bg-white hover:bg-gray-50"
                  >
                    Try NanoBanana Free
                  </a>
                  <a
                    href="/pricing"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 bg-opacity-80 hover:bg-opacity-90"
                  >
                    View Pricing
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="banana-float h-56 w-full object-contain sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75"
            alt="Banana decoration"
          />
        </div>
      </div>

      {/* GENERATOR */}
      <section id="generator" className="py-12 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Edit with Text — Keep Faces & Scenes
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Credits: <span id="nb-balance">—</span>
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: controls */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Prompt Engine</h3>
                <p className="mt-1 text-sm text-gray-500">Text-to-image or image-to-image — it just works.</p>
                <div className="mt-5 border-t border-gray-200" />

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Reference Image (optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 50MB</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="main-prompt" className="block text-sm font-medium text-gray-700">
                    Prompt
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="main-prompt"
                      name="main-prompt"
                      rows={4}
                      className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe the image you want, or edits to apply…"
                      defaultValue="a cinematic banana astronaut on the moon, 35mm film look"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    id="nb-generate"
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Generate (−1 credit)
                  </button>
                  <a
                    href="/pricing"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    Buy 100 credits ($5)
                  </a>
                </div>
              </div>
            </div>

            {/* Right: output */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Your AI creation appears here.</p>
                <div className="mt-5 border-t border-gray-200" />
                <div id="nb-output" className="mt-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-12 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Why Choose NanoBanana?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Core Features</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              NanoBanana is a text-based AI image editor that preserves faces, characters, and scenes with exceptional consistency.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["message-square", "Natural Language Editing", "Edit images using simple text prompts. Complex instructions understood."],
              ["user", "Character Consistency", "Maintain face and identity details across edits."],
              ["image", "Scene Preservation", "Seamlessly blend edits with original backgrounds."],
              ["zap", "One-Shot Editing", "Great results on the first try for common tasks."],
              ["layers", "Multi-Image Context", "Process multiple images in one workflow."],
              ["award", "AI UGC Creation", "Create consistent influencers and product shots."],
            ].map(([icon, title, body]) => (
              <div key={title} className="feature-card bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <i data-feather={icon} className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" className="py-12 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Lightning-Fast AI Creations</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Showcase</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">See what NanoBanana generates in seconds.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <img
                    className="w-full h-auto object-cover rounded-md"
                    src={`https://picsum.photos/seed/nb${n}/640/360`}
                    alt={`Showcase ${n}`}
                  />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Sample {n}</h3>
                  <p className="mt-1 text-sm text-gray-500">Generated using the text-based editor.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="#generator"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Try NanoBanana Generator
            </a>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-12 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">User Reviews</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">What creators are saying</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { img: 11, name: "AIArtistPro", role: "Digital Creator", text: "Changed my workflow. Consistency is incredible." },
              { img: 12, name: "ContentCreator", role: "UGC Specialist", text: "Maintains face details across edits. Love it." },
              { img: 13, name: "PhotoEditor", role: "Pro Editor", text: "Scene blending looks natural and realistic." },
            ].map(({ img, name, role, text }) => (
              <div key={name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/100?img=${img}`} alt={name} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-500">{role}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">“{text}”</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Help Center</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">What is NanoBanana?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  A text-based AI image editor. Describe edits in words; we keep faces and scenes consistent.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">How does it work?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Upload an image or start from text, type the changes you want, and generate.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">Commercial use?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes — perfect for UGC, ads, and product imagery.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">What edits can it handle?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Face completion, background changes, object placement, styles, and more.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-yellow-600" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to edit images with simple text?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-yellow-100 sm:mt-4">
              Join creators who rely on NanoBanana for consistent results.
            </p>
            <div className="mt-10">
              <a
                href="#generator"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Try NanoBanana Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About NanoBanana</h3>
              <p className="mt-4 text-base text-gray-300">
                The text-based AI image editor that preserves faces, characters, and scenes with unmatched accuracy.
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
              <a href="#" className="text-gray-400 hover:text-gray-300" aria-label="Twitter">
                <i data-feather="twitter" className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300" aria-label="Instagram">
                <i data-feather="instagram" className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300" aria-label="GitHub">
                <i data-feather="github" className="h-6 w-6" />
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; {new Date().getFullYear()} NanoBanana. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
