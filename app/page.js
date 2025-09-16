"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SignInModal from "@/app/components/SignInModal";

function HomeGeneratorSection() {
  const [activeTab, setActiveTab] = useState("t2i");
  const [t2iPrompt, setT2iPrompt] = useState("");
  const [i2iPrompt, setI2iPrompt] = useState("");
  const [i2iFile, setI2iFile] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("credits").select("balance").eq("user_id", user.id).single();
        if (error) throw error;
        setBalance(data.balance);
      } else {
        setBalance(0);
      }
    } catch (e) {
      console.error("Error fetching balance:", e.message);
      setBalance(0);
    }
  };

  const handleGenerate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setShowSignIn(true);
      return;
    }

    setError("");
    setResultUrl(null);
    setLoading(true);

    try {
      let response;
      if (activeTab === "t2i") {
        if (!t2iPrompt) { setError("Please enter a prompt."); return; }
        response = await fetch("/api/vertex/imagine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: t2iPrompt }),
        });
      } else {
        if (!i2iFile) { setError("Please choose an image."); return; }
        if (!i2iPrompt) { setError("Please enter an edit prompt."); return; }

        const formData = new FormData();
        formData.append("prompt", i2iPrompt);
        formData.append("image", i2iFile);

        response = await fetch("/api/vertex/edit", {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setResultUrl(data.dataUrl);
      fetchBalance(); // Refresh balance after generation
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="generator" className="py-12 bg-white" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">AI Image Editor</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Try the Editor</p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Credits: {balance}
            <Link href="/pricing" className="ml-2 text-yellow-600 hover:text-yellow-500">Buy 100 credits ($5)</Link>
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setActiveTab("t2i")}
              className={`px-4 py-2 rounded-l-md text-sm font-medium ${activeTab === "t2i" ? "bg-yellow-600 text-white" : "bg-white text-gray-700 border"}`}
            >
              Text to Image
            </button>
            <button
              onClick={() => setActiveTab("i2i")}
              className={`px-4 py-2 rounded-r-md text-sm font-medium ${activeTab === "i2i" ? "bg-yellow-600 text-white" : "bg-white text-gray-700 border"}`}
            >
              Image to Image
            </button>
          </div>

          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

          {activeTab === "t2i" && (
            <div className="space-y-4">
              <textarea
                rows="4"
                className="w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="A cinematic banana astronaut on the moon, 35mm film look"
                value={t2iPrompt}
                onChange={(e) => setT2iPrompt(e.target.value)}
              ></textarea>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          )}

          {activeTab === "i2i" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setI2iFile(e.target.files[0])} />
                </label>
                <p className="pl-1">or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10 MB</p>
                {i2iFile && <p className="text-sm text-gray-700 mt-2">Selected file: {i2iFile.name}</p>}
              </div>
              <textarea
                rows="4"
                className="w-full rounded-md border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="An astronaut riding a banana on the moon, photorealistic"
                value={i2iPrompt}
                onChange={(e) => setI2iPrompt(e.target.value)}
              ></textarea>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          )}

          {resultUrl && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">Output</h3>
              <img src={resultUrl} alt="Generated Image" className="mt-4 mx-auto rounded-md shadow-md max-w-full h-auto" />
              <a
                href={resultUrl}
                download="nano-banana-image.png"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Download Image
              </a>
            </div>
          )}

          {!resultUrl && !loading && (
            <div className="mt-6 text-center text-gray-500">
              <h3 className="text-lg font-medium text-gray-900">Output</h3>
              <p className="mt-2">No image yet. Enter a prompt and generate.</p>
            </div>
          )}
        </div>
      </div>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </section>
  );
}

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
              <button
                onClick={() => setShowSignIn(true)}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Try Now
              </button>
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
                <button
                  onClick={() => setShowSignIn(true)}
                  className="inline-flex items-center px-6 py-3 rounded-md text-yellow-700 bg-white border border-transparent shadow hover:bg-gray-50"
                >
                  Get Started
                </button>
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
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Nano Banana</h3>
              <p className="mt-4 text-base text-gray-300">AI Image Editor</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul role="list" className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#showcase" className="text-base text-gray-300 hover:text-white">Showcase</a></li>
                <li><a href="#reviews" className="text-base text-gray-300 hover:text-white">Reviews</a></li>
                <li><a href="/pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul role="list" className="mt-4 space-y-4">
                <li><a href="/terms" className="text-base text-gray-300 hover:text-white">Terms</a></li>
                <li><a href="/privacy" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#faq" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">&copy; 2023 Nano Banana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

