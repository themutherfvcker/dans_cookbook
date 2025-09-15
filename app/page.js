"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";

export default function HomePage() {
  // -------- Vanta / Lib init --------
  const vantaRef = useRef(null);
  const vantaInstance = useRef(null);

  useEffect(() => {
    // Ensure AOS CSS
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css";
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = AOS_HREF;
      document.head.appendChild(link);
    }

    // Wait for libs, then init
    const tryInit = () => {
      try {
        if (window.AOS) window.AOS.init({ duration: 800, easing: "ease-in-out", once: true });
        if (window.feather) window.feather.replace();

        if (!vantaInstance.current && window.VANTA && window.THREE && vantaRef.current) {
          vantaInstance.current = window.VANTA.GLOBE({
            el: vantaRef.current,
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
          });
        }
      } catch {
        /* noop */
      }
    };

    const t = setInterval(() => {
      if (window.THREE && window.VANTA && window.AOS && window.feather) {
        clearInterval(t);
        tryInit();
      }
    }, 200);

    return () => {
      clearInterval(t);
      if (vantaInstance.current?.destroy) {
        vantaInstance.current.destroy();
        vantaInstance.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Tailwind via CDN (keeps things simple) */}
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      {/* Order matters: THREE -> VANTA -> AOS -> feather */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" strategy="afterInteractive" />

      {/* Minimal custom styles for hero + banana float */}
      <style>{`
        .hero-gradient { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04); }
        .banana-float { animation: nb-float 6s ease-in-out infinite; }
        @keyframes nb-float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
      `}</style>

      {/* NAV */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75"
                  alt="Nano Banana"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">Nano Banana</span>
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
              <Link href="/pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-yellow-500">
                Pricing
              </Link>
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
      <div className="hero-gradient relative overflow-hidden">
        <div ref={vantaRef} id="home" className="absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div className="relative z-10">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Text-based photo editor.</span>
                <span className="block text-white">Change anything. Keep what matters.</span>
              </h1>
              <p className="mt-4 text-base text-gray-800 sm:text-lg md:text-xl max-w-xl">
                Edit with plain text prompts while preserving faces, identities, and details. Nano Banana makes hard edits feel easy.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="#generator"
                  className="inline-flex items-center px-6 py-3 rounded-md text-yellow-700 bg-white border border-transparent shadow hover:bg-gray-50"
                >
                  Get Started
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center px-6 py-3 rounded-md text-white bg-yellow-600/70 hover:bg-yellow-600"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Banana visual (stacks on mobile; absolute only on lg+) */}
            <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[460px]">
              <img
                className="banana-float absolute inset-x-0 bottom-0 mx-auto w-64 sm:w-80 lg:w-[520px] lg:bottom-[-24px] lg:right-0 lg:left-auto lg:mx-0"
                src="https://nanobanana.ai/_next/image?url=%2Fbanana-decoration.png&w=640&q=75"
                alt="Banana decoration"
              />
            </div>
          </div>
        </div>
      </div>

      {/* GENERATOR (inline) */}
      <HomeGeneratorSection />

      {/* FEATURES */}
      <section id="features" className="py-12 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Why Choose Nano Banana?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Core Features</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Natural-language editing with unmatched consistency. Keep faces and identities while changing anything else.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["message-square", "Natural Language Editing", "Edit images using plain text prompts—no masks or layers required."],
              ["user", "Character Consistency", "Maintain faces and details across edits and variations."],
              ["image", "Scene Preservation", "Blend edits with the original background so results look seamless."],
              ["zap", "One-Shot Editing", "High-quality results in a single pass for most edits."],
              ["layers", "Multi-Image Context", "Use multiple references to guide style, identity, or scene."],
              ["award", "AI UGC Creation", "Perfect for influencers and marketers needing consistent on-brand visuals."],
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
                  <p className="mt-4 text-sm text-gray-500">{body}</p>
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
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">See what Nano Banana can do in seconds.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <img className="w-full h-auto object-cover rounded-md" src={`https://picsum.photos/seed/nb${n}/640/360`} alt={`Showcase ${n}`} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Sample {n}</h3>
                  <p className="mt-1 text-sm text-gray-500">Generated with the Nano Banana editor.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="#generator"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Try the Generator
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
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">What creators are saying.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              ["AIArtistPro", "Digital Creator", "https://i.pravatar.cc/100?img=11", "Changed my workflow. Consistency is incredible—way ahead of anything I used before."],
              ["ContentCreator", "UGC Specialist", "https://i.pravatar.cc/100?img=12", "Keeping faces across edits is the real superpower. Clients notice the difference."],
              ["PhotoEditor", "Pro Editor", "https://i.pravatar.cc/100?img=13", "One-shot edits that look natural. Background blends are smooth and realistic."],
            ].map(([name, role, avatar, quote]) => (
              <div key={name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={avatar} alt={name} />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-500">{role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">&ldquo;{quote}&rdquo;</p>
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
                <dt className="text-lg leading-6 font-medium text-gray-900">What is Nano Banana?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  A text-based photo editor that understands complex instructions and preserves the details you care about.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">How does it work?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Upload an image (or start from text), describe your edit, and generate. No manual masking required.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">Is it better than other tools?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  We focus on identity and scene preservation so results look consistent across edits and versions.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">Can I use it commercially?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes—great for UGC, social, and marketing where brand/identity consistency matters.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-yellow-600" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to revolutionize your image editing?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-yellow-100 sm:mt-4">
            Join creators using Nano Banana for fast, consistent edits.
          </p>
          <div className="mt-8">
            <a
              href="#generator"
              className="inline-flex items-center px-6 py-3 rounded-md text-yellow-700 bg-white hover:bg-gray-50"
            >
              Try Nano Banana Now
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About Nano Banana</h3>
              <p className="mt-4 text-base text-gray-300">
                The most advanced text-based image editor for precise, natural-looking results.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#showcase" className="text-base text-gray-300 hover:text-white">Showcase</a></li>
                <li><a href="#faq" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
                <li><Link href="/pricing" className="text-base text-gray-300 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="/privacy" className="text-base text-gray-300 hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="text-base text-gray-300 hover:text-white">Terms</Link></li>
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
              &copy; {new Date().getFullYear()} Nano Banana. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* =========================
   HomeGeneratorSection
   ========================= */
function HomeGeneratorSection() {
  const [active, setActive] = useState("image"); // "image" | "text"
  const [prompt, setPrompt] = useState("a cinematic banana astronaut on the moon, 35mm film look");
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/session", { cache: "no-store" });
        const j = await r.json();
        if (typeof j?.balance === "number") setBalance(j.balance);
      } catch {
        /* noop */
      }
    })();
  }, []);

  async function runGenerate() {
    if (loading) return;
    const p = (prompt || "").trim();
    if (!p) {
      alert("Please enter a prompt");
      return;
    }
    if (active === "image" && !file) {
      alert("Please upload a reference image or switch to Text to Image.");
      return;
    }

    setLoading(true);
    setResultUrl(null);
    try {
      let resp;
      if (active === "image") {
        const fd = new FormData();
        fd.append("prompt", p);
        fd.append("image", file, file.name);
        resp = await fetch("/api/vertex/edit", { method: "POST", body: fd });
      } else {
        resp = await fetch("/api/vertex/imagine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p }),
        });
      }

      const j = await resp.json();
      if (!resp.ok || !j?.ok) {
        throw new Error(j?.error || `HTTP ${resp.status}`);
      }
      if (typeof j?.balance === "number") setBalance(j.balance);
      setResultUrl(j.dataUrl || null);
    } catch (e) {
      alert(e?.message || "Generate failed");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setResultUrl(null);
    setFile(null);
  }

  async function subscribe() {
    try {
      const r = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success_url: `${location.origin}/success`,
          cancel_url: `${location.origin}/cancel`,
        }),
      });
      const j = await r.json();
      if (r.ok && j?.url) {
        window.location.href = j.url;
      } else {
        alert(j?.error || "Failed to start subscription");
      }
    } catch (e) {
      alert(e?.message || "Subscription failed");
    }
  }

  return (
    <section id="generator" className="py-12 bg-gray-50" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Try the Editor
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Credits: <span className="font-semibold">{balance ?? "—"}</span>
          </p>
          <div className="mt-2 flex items-center gap-2 justify-center">
            <Link href="/pricing" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-yellow-600 text-white hover:bg-yellow-700">
              Buy 100 credits ($5)
            </Link>
            <button onClick={subscribe} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-black">
              Subscribe $5/mo
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* Tabs */}
              <div className="flex w-full rounded-lg overflow-hidden border">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    active === "image" ? "bg-yellow-50 text-yellow-700" : "bg-white text-gray-700"
                  }`}
                  onClick={() => setActive("image")}
                >
                  Image to Image
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    active === "text" ? "bg-yellow-50 text-yellow-700" : "bg-white text-gray-700"
                  }`}
                  onClick={() => setActive("text")}
                >
                  Text to Image
                </button>
              </div>

              {/* Content */}
              <div className="mt-6">
                {active === "image" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700">Reference Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 items-center justify-center">
                          <label
                            htmlFor="nb-file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="nb-file"
                              name="nb-file"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                          </label>
                          <p className="pl-2">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10 MB</p>
                        {file ? <p className="text-xs text-gray-600">Selected: {file.name}</p> : null}
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="mt-4">
                  <label htmlFor="nb-prompt" className="block text-sm font-medium text-gray-700">
                    Prompt
                  </label>
                  <textarea
                    id="nb-prompt"
                    rows={4}
                    className="mt-1 shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the edit or the image you want…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={runGenerate}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60"
                  >
                    {loading ? "Generating…" : "Generate"}
                  </button>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Output</h3>
              <p className="mt-1 text-sm text-gray-500">Your AI creation appears here.</p>
              <div className="mt-5 border-t border-gray-200" />
              <div className="mt-6 min-h-[16rem] flex items-center justify-center">
                {!resultUrl ? (
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm">No image yet. Enter a prompt and generate.</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <img src={resultUrl} alt="Result" className="w-full h-auto rounded-md border" />
                    <div className="mt-3 flex gap-3">
                      <a
                        href={resultUrl}
                        download="nanobanana.png"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-black"
                      >
                        Download PNG
                      </a>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border hover:bg-gray-50"
                      >
                        Buy credits
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
