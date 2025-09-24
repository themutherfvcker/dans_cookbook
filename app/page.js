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
              <a href="#purchase" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">Buy Now</a>
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
            <a href="#purchase" className="block px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700">Buy Now</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">Sixth Sense Cooking</h1>
              <p className="mt-5 text-xl md:text-2xl text-gray-700 max-w-2xl">Unlock your culinary intuition with Daniel Webb's revolutionary approach to cooking</p>
              <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl">A cookbook that blends flavor, music, and creativity to take your cooking to the next level.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#purchase" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition duration-300">Buy the Book - $29.99</a>
              </div>
            </div>
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="w-full max-w-[520px] lg:ml-auto shadow-2xl rounded-xl">
                <div className="relative aspect-[3/4]">
                  <img src="/DansCookbook.png" alt="Sixth Sense Cooking book" className="absolute inset-0 w-full h-full object-contain rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sneak Peek / Inside the Book */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Sneak Peek / Inside the Book</h2>
              <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900">Take a Look Inside</h3>
              <p className="mt-4 text-gray-700">From quick dressings to hearty mains, from sauces to sweets—this book covers it all.</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start"><span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span><span>Foreword preview</span></li>
                <li className="flex items-start"><span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span><span>Full contents table</span></li>
                <li className="flex items-start"><span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span><span>Sample recipe spread</span></li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="/cookbook3.png" alt="Open spread mockup" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Book (Why It’s Unique) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-xl overflow-hidden">
            <div className="lg:grid lg:grid-cols-2">
              <div className="p-12">
                <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">About the Book (Why It’s Unique)</h2>
                <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900">Not Just Recipes. A Journey.</h3>
                <p className="mt-4 text-gray-700">Sixth Sense Cooking isn’t just a cookbook—it’s a window into Dan’s world of experimenting, exploring ingredients, and finding inspiration through music.</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span>
                    <span className="text-gray-800">120+ pages of recipes, tips, and stories</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span>
                    <span className="text-gray-800">Webby’s Hot Tips with every dish</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">✓</span>
                    <span className="text-gray-800">Inspired by songs that shaped each recipe</span>
                  </li>
                </ul>
              </div>
              <div className="hidden lg:block p-8">
                <div className="max-w-lg ml-auto">
                  <div className="polaroid rotate-[-2deg] shadow-xl">
                    <img className="h-full w-full object-cover" src="/cookbook3.png" alt="Open spread - polaroid style" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Recipe Preview Section */}
      <section id="recipes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center" data-aos="fade-up">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Featured Recipes</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">A Taste of What You'll Learn</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">These sample recipes showcase the intuitive approach taught in "Sixth Sense Cooking"</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden recipe-card transition duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="polaroid">
                <img className="h-48 w-full object-cover" src="/DansBookDedication.jpg" alt="Dedication page" />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">Pasta</div>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">Sensory Pasta Primavera</h3>
                <p className="mt-3 text-gray-500">Learn to adjust ingredients based on seasonal vegetables and your personal taste preferences.</p>
                <div className="mt-4 flex items-center">
                  <i data-feather="clock" className="h-4 w-4 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">30-45 mins</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden recipe-card transition duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="polaroid">
                <img className="h-48 w-full object-cover" src="http://static.photos/food/600x400/2" alt="Intuitive Soup" />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">Soup</div>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">Instinctive Seasonal Soup</h3>
                <p className="mt-3 text-gray-500">A master recipe that teaches you how to create delicious soups with whatever ingredients you have on hand.</p>
                <div className="mt-4 flex items-center">
                  <i data-feather="clock" className="h-4 w-4 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">45-60 mins</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden recipe-card transition duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="polaroid">
                <img className="h-48 w-full object-cover" src="http://static.photos/food/600x400/3" alt="Intuitive Roast" />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">Main Course</div>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">Perfectly Timed Roast</h3>
                <p className="mt-3 text-gray-500">Master the art of cooking proteins to perfection by learning to trust your senses rather than strict timings.</p>
                <div className="mt-4 flex items-center">
                  <i data-feather="clock" className="h-4 w-4 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">1.5-3 hours</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center" data-aos="fade-up">
            <a href="#purchase" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
              Get All 100+ Recipes
              <i data-feather="arrow-right" className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section id="author" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative" data-aos="fade-right">
              <div className="bg-white rounded-xl shadow-2xl p-4 max-w-[420px]">
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
              <div className="relative rounded-xl overflow-hidden shadow-2xl floating">
                <img className="w-full h-auto" src="http://static.photos/food/600x800/44" alt="Sixth Sense Cooking Book" />
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
                  <button className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition duration-300">
                    Add to Cart
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

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="lg:grid lg:grid-cols-2">
              <div className="p-12">
                <h3 className="text-2xl font-bold text-gray-900">Join Our Culinary Community</h3>
                <p className="mt-4 text-gray-600">Sign up for Daniel's newsletter to receive exclusive cooking tips, recipe variations, and updates about upcoming events and workshops.</p>
                <form className="mt-8 sm:flex">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input id="email-address" name="email" type="email" autoComplete="email" required className="w-full px-5 py-3 placeholder-gray-500 focus:ring-red-500 focus:border-red-500 sm:max-w-xs border-gray-300 rounded-md" placeholder="Enter your email" />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button type="submit" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Subscribe</button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
              </div>
              <div className="hidden lg:block">
                <img className="h-full w-full object-cover" src="http://static.photos/food/800x800/45" alt="Cooking ingredients" />
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
                    <li><a href="tel:+18005551234" className="text-base text-gray-300 hover:text-white">(800) 555-1234</a></li>
                    <li><p className="text-base text-gray-300">P.O. Box 1234<br />Culinary City, CA 90210</p></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Cooking Classes</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Wholesale Inquiries</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Press Kit</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-400 text-center">&copy; 2023 Sixth Sense Cooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}