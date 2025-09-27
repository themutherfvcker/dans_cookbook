"use client";

import { useState } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Tailwind CSS is compiled; no runtime CDN */}

      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-[rgba(20,83,45,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="flex-shrink-0 flex items-center">
                <i data-feather="book-open" className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Sixth Sense Cooking</span>
              </a>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <a href="#about" className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium">About</a>
              <a href="#recipes" className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium">Recipes</a>
              <a href="#author" className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium">Author</a>
              <a href="#testimonials" className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium">Testimonials</a>
              <button
                onClick={async () => {
                  try { const resp = await fetch('/api/session', { method: 'GET' }); await resp.json().catch(() => ({})) } catch {}
                  try {
                    const r = await fetch('/api/checkout/book', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    const j = await r.json()
                    if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
                    window.location.href = j.url
                  } catch (e) {
                    const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || ''
                    if (link) { window.location.href = link; return }
                    alert(`Checkout failed: ${e?.message || e}`)
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Buy Now
              </button>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500" aria-controls="mobile-menu" aria-expanded={mobileOpen} id="mobile-menu-button">
                <span className="sr-only">Toggle menu</span>
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${mobileOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50">About</a>
            <a href="#recipes" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50">Recipes</a>
            <a href="#author" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50">Author</a>
            <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50">Testimonials</a>
            <button
              onClick={async () => {
                try { const resp = await fetch('/api/session', { method: 'GET' }); await resp.json().catch(() => ({})) } catch {}
                try {
                  const r = await fetch('/api/checkout/book', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                  const j = await r.json()
                  if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
                  window.location.href = j.url
                } catch (e) {
                  const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || ''
                  if (link) { window.location.href = link; return }
                  alert(`Checkout failed: ${e?.message || e}`)
                }
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      </nav>

       {/* Sixth Sense Cooking */}
      <section className="relative overflow-hidden bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900">Sixth Sense Cooking</h2>
              <p className="mt-5 text-xl md:text-2xl text-gray-700 max-w-2xl">Unlock your culinary intuition with Daniel Webb's revolutionary approach to cooking</p>
              <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl">A cookbook that blends flavor, music, and creativity to take your cooking to the next level.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={async () => {
                    try {
                      const resp = await fetch('/api/session', { method: 'GET' })
                      await resp.json().catch(() => ({}))
                    } catch {}
                    try {
                      const r = await fetch('/api/checkout/book', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                      const j = await r.json()
                      if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
                      window.location.href = j.url
                    } catch (e) {
                      const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || ''
                      if (link) { window.location.href = link; return }
                      alert(`Checkout failed: ${e?.message || e}`)
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition duration-300 w-full sm:w-auto text-center"
                >
                  Buy the Book - $29.99
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-[320px] sm:max-w-[380px] md:max-w-[480px] lg:max-w-[520px] lg:ml-auto mx-auto">
                <img src="/cookbook3.png" alt="Open spread mockup" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedication */}
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Dedication to Auntie Helen</h2>
              <p className="mt-2 text-lg text-red-100">The hardest-working publican in Wheatley—and the spark behind this book.</p>
              <p className="mt-6 text-red-50 leading-relaxed">
                My Auntie Helen, who I’m dedicating this book to, owned pubs from a young age and to this day is the hardest working and most driven person I have ever met – and I’ve met a few. She ran a pub in the village of Wheatley called the Sun Inn. Wheatley is a sleepy yet bubbly little village in Oxfordshire. I love the way it all works and it has such a country feel but yet it’s so close to London.
              </p>
            </div>
            <div>
              <div className="relative rounded-xl overflow-hidden ring-1 ring-white/15 shadow-2xl h-[240px] sm:h-[300px] lg:h-[360px] w-full">
                <img
                  src="/DedicationInn.jpg"
                  alt="Sun Inn, Wheatley"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center 50%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

         {/* Not Just Recipes Section */}
      <section className="relative">
        <div className="relative w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[620px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/DanHoldingBookKitchen.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 35%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-24">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-block rounded-xl bg-black/55 backdrop-blur-sm p-6 sm:p-8 shadow-lg mx-auto lg:mx-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-extrabold tracking-tight text-white">Not Just Recipes. A Journey.</h1>
                <p className="mt-5 text-base sm:text-lg md:text-xl text-red-100">Sixth Sense Cooking isn’t just a cookbook—it’s a window into Dan’s world of experimenting, exploring ingredients, and finding inspiration through music.</p>
                <ul className="mt-7 space-y-3">
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white text-xs">✓</span>
                    <span className="text-white text-base sm:text-lg">120+ pages of recipes, tips, and stories</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white text-xs">✓</span>
                    <span className="text-white text-base sm:text-lg">Webby’s Hot Tips with every dish</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white text-xs">✓</span>
                    <span className="text-white text-base sm:text-lg">Inspired by songs that shaped each recipe</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={async () => {
                      try { const resp = await fetch('/api/session', { method: 'GET' }); await resp.json().catch(() => ({})) } catch {}
                      try {
                        const r = await fetch('/api/checkout/book', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                        const j = await r.json()
                        if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
                        window.location.href = j.url
                      } catch (e) { alert(`Checkout failed: ${e?.message || e}`) }
                    }}
                    className="inline-block w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-base font-semibold transition duration-300"
                  >
                    Buy the Book - $29.99
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>  

      

      







      {/* Author Section */}
      <section id="author" className="py-16 sm:py-18 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="relative" data-aos="fade-right">
              <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[420px] mx-auto lg:mx-0">
                <div className="relative aspect-[3/4]">
                  <img className="absolute inset-0 w-full h-full rounded-lg object-cover" src="/DanielWebb.png" alt="Daniel Webb" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-900">Daniel Webb</h3>
                <p className="text-gray-600">Chef & Culinary Philosopher</p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0" data-aos="fade-left">
              <h2 className="text-3xl font-extrabold text-gray-900">About Dan</h2>
              <p className="mt-4 text-lg text-gray-600">Daniel Webb has spent over 20 years in professional kitchens around the world, from Michelin-starred restaurants to humble street food stalls. His journey led him to develop a unique approach to cooking that emphasizes intuition over rigid recipes.</p>
              <p className="mt-4 text-lg text-gray-600">After teaching cooking classes for a decade, Daniel realized that the most successful cooks weren't those who followed recipes perfectly, but those who learned to trust their senses and adapt creatively.</p>
              <p className="mt-4 text-lg text-gray-600">"Sixth Sense Cooking" distills Daniel's philosophy into an accessible system that anyone can use to become a more confident, creative cook.</p>
              <p className="mt-4 text-lg text-gray-600">Born and raised in the Cotswolds, inspired by family, pubs, and community, Dan grew into a chef passionate about giving ingredients a stage. His cooking is guided by honesty, music, and creativity—values that run through this book.</p>
              <div className="mt-8 flex space-x-4">
                <a href="#" className="text-red-600 hover:text-red-700"><i data-feather="instagram" className="h-6 w-6" /></a>
                <a href="#" className="text-red-600 hover:text-red-700"><i data-feather="twitter" className="h-6 w-6" /></a>
                <a href="#" className="text-red-600 hover:text-red-700"><i data-feather="youtube" className="h-6 w-6" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center" data-aos="fade-up">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">What Readers Are Saying</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-8 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img className="h-12 w-12 rounded-full" src="http://static.photos/people/200x200/1" alt="Sarah J." />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Sarah J.</h3>
                  <p className="text-gray-500">Home Cook</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 font-hand text-xl">"This book completely changed how I approach cooking. I no longer panic when I'm missing an ingredient—I just adapt! Daniel's sensory exercises have made me so much more confident in the kitchen."</p>
                <div className="mt-4 flex text-red-500">
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img className="h-12 w-12 rounded-full" src="http://static.photos/people/200x200/2" alt="Michael T." />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Michael T.</h3>
                  <p className="text-gray-500">Professional Chef</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 font-hand text-xl">"Even after culinary school and years in professional kitchens, this book taught me new ways to connect with ingredients. It's rare to find a cookbook that changes your fundamental approach to cooking."</p>
                <div className="mt-4 flex text-red-500">
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img className="h-12 w-12 rounded-full" src="http://static.photos/people/200x200/3" alt="Emma R." />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Emma R.</h3>
                  <p className="text-gray-500">Food Blogger</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 font-hand text-xl">"I've reviewed hundreds of cookbooks, but none have had the lasting impact on my cooking that Sixth Sense Cooking has. It's not just recipes—it's a whole new way of thinking about food."</p>
                <div className="mt-4 flex text-red-500">
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                  <i data-feather="star" className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section id="purchase" className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative" data-aos="fade-right">
              <div className="relative rounded-xl overflow-hidden shadow-2xl floating h-[360px] sm:h-[460px] lg:h-[520px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/DanBehindBookKitchen.png"
                  alt="Sixth Sense Cooking Book"
                  style={{ objectPosition: "center 35%" }}
                />
              </div>
            </div>
            <div className="mt-10 lg:mt-0 text-white" data-aos="fade-left">
              <h2 className="text-3xl font-extrabold">Get Your Copy Today</h2>
              <p className="mt-4 text-xl">Transform your cooking with Daniel Webb's revolutionary approach</p>
              <div className="mt-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold">$29.99</span>
                  <span className="ml-2 text-lg font-medium text-red-200">+ shipping</span>
                </div>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center"><i data-feather="check" className="h-5 w-5 text-green-300" /><span className="ml-3">Hardcover, 320 pages</span></li>
                  <li className="flex items-center"><i data-feather="check" className="h-5 w-5 text-green-300" /><span className="ml-3">100+ intuitive recipes</span></li>
                  <li className="flex items-center"><i data-feather="check" className="h-5 w-5 text-green-300" /><span className="ml-3">Sensory development exercises</span></li>
                  <li className="flex items-center"><i data-feather="check" className="h-5 w-5 text-green-300" /><span className="ml-3">Bonus online video content</span></li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={async () => {
                      try {
                        const resp = await fetch('/api/session', { method: 'GET' })
                        await resp.json().catch(() => ({}))
                      } catch {}
                      try {
                        const r = await fetch('/api/checkout/book', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                        const j = await r.json()
                        if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
                        window.location.href = j.url
                      } catch (e) {
                        const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || ''
                        if (link) { window.location.href = link; return }
                        alert(`Checkout failed: ${e?.message || e}`)
                      }
                    }}
                    className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition duration-300"
                  >
                    Buy Now
                    <i data-feather="shopping-cart" className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center" data-aos="fade-up">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Frequently Asked Questions</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Need More Information?</p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6" data-aos="fade-up">
                <button className="flex items-start justify-between w-full text-left focus:outline-none">
                  <span className="text-lg font-medium text-gray-900">Is this book suitable for beginners?</span>
                  <span className="ml-6 h-7 flex items-center"><i data-feather="plus" className="h-6 w-6 text-red-600" /></span>
                </button>
                <div className="mt-2 hidden" id="faq1">
                  <p className="text-gray-600">Absolutely! While experienced cooks will gain new insights, Daniel specifically designed the book to help beginners develop good habits from the start. The sensory exercises and intuitive approach will give you confidence in the kitchen much faster than traditional recipe-following.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6" data-aos="fade-up">
                <button className="flex items-start justify-between w-full text-left focus:outline-none">
                  <span className="text-lg font-medium text-gray-900">How is this different from other cookbooks?</span>
                  <span className="ml-6 h-7 flex items-center"><i data-feather="plus" className="h-6 w-6 text-red-600" /></span>
                </button>
                <div className="mt-2 hidden" id="faq2">
                  <p className="text-gray-600">Most cookbooks focus on giving you exact recipes to follow. Sixth Sense Cooking teaches you how to cook without rigid recipes by developing your intuition and understanding of ingredients. It's less about memorizing measurements and more about learning to trust your senses.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6" data-aos="fade-up">
                <button className="flex items-start justify-between w-full text-left focus:outline-none">
                  <span className="text-lg font-medium text-gray-900">Are there vegetarian/vegan options?</span>
                  <span className="ml-6 h-7 flex items-center"><i data-feather="plus" className="h-6 w-6 text-red-600" /></span>
                </button>
                <div className="mt-2 hidden" id="faq3">
                  <p className="text-gray-600">Yes! While the book isn't exclusively vegetarian, the intuitive approach makes it easy to adapt recipes to any dietary preference. Many recipes focus on vegetables, grains, and legumes, and the techniques taught will help you create delicious plant-based meals.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6" data-aos="fade-up">
                <button className="flex items-start justify-between w-full text-left focus:outline-none">
                  <span className="text-lg font-medium text-gray-900">Do you offer international shipping?</span>
                  <span className="ml-6 h-7 flex items-center"><i data-feather="plus" className="h-6 w-6 text-red-600" /></span>
                </button>
                <div className="mt-2 hidden" id="faq4">
                  <p className="text-gray-600">We ship worldwide! Shipping costs will vary depending on your location. During checkout, you'll see the exact shipping cost for your country. Delivery typically takes 7-14 business days for international orders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <i data-feather="book-open" className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-xl font-bold">Sixth Sense Cooking</span>
              </div>
              <p className="text-gray-400 text-base">Unlock your culinary intuition with Daniel Webb's revolutionary approach to cooking.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white"><i data-feather="instagram" className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><i data-feather="facebook" className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><i data-feather="twitter" className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><i data-feather="youtube" className="h-6 w-6" /></a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Navigation</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#about" className="text-base text-gray-300 hover:text-white">About</a></li>
                    <li><a href="#recipes" className="text-base text-gray-300 hover:text-white">Recipes</a></li>
                    <li><a href="#author" className="text-base text-gray-300 hover:text-white">Author</a></li>
                    <li><a href="#testimonials" className="text-base text-gray-300 hover:text-white">Testimonials</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Shipping Policy</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Refund Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="mailto:info@sixthsensecooking.com" className="text-base text-gray-300 hover:text-white">info@sixthsensecooking.com</a></li>
      
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
                  <ul className="mt-4 space-y-4">
                    
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-400 text-center">&copy; 2025 Sixth Sense Cooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
