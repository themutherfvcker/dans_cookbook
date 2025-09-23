"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function HomePage() {
  useEffect(() => {
    const AOS_HREF = "https://unpkg.com/aos@2.3.1/dist/aos.css";
    if (!document.querySelector(`link[href="${AOS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = AOS_HREF;
      document.head.appendChild(link);
    }

    const onReady = () => {
      try {
        if (window.AOS) window.AOS.init({ duration: 800, easing: "ease-in-out", once: true });
        if (window.feather) window.feather.replace();

        const button = document.getElementById("mobile-menu-button");
        const menu = document.getElementById("mobile-menu");
        if (button && menu) {
          button.addEventListener("click", () => menu.classList.toggle("hidden"));
        }

        document.querySelectorAll('[id^="faq"]').forEach((faq) => {
          const container = faq;
          const trigger = container.previousElementSibling;
          if (trigger) {
            trigger.addEventListener("click", function () {
              const icon = this.querySelector("i");
              container.classList.toggle("hidden");
              if (icon && window.feather) {
                const isHidden = container.classList.contains("hidden");
                icon.setAttribute("data-feather", isHidden ? "plus" : "minus");
                window.feather.replace();
              }
            });
          }
        });

        if (window.VANTA && document.getElementById("vanta-globe")) {
          try {
            window.VANTA.GLOBE({
              el: "#vanta-globe",
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              color: 0xff3333,
              backgroundColor: 0x0,
              size: 0.8,
            });
          } catch {}
        }
      } catch {}
    };

    const t = setInterval(() => {
      if (window.AOS && window.feather && window.VANTA) {
        clearInterval(t);
        onReady();
      }
    }, 200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js" strategy="afterInteractive" />

      <style>{`
        .hero-bg {
          background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('http://static.photos/food/1200x630/42');
          background-size: cover;
          background-position: center;
        }
        .recipe-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .floating { animation: floating 3s ease-in-out infinite; }
        @keyframes floating { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
      `}</style>

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
              <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500" aria-controls="mobile-menu" aria-expanded="false" id="mobile-menu-button">
                <i data-feather="menu" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="hidden md:hidden" id="mobile-menu">
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
      <div id="vanta-globe" className="hero-bg min-h-screen flex items-center justify-center text-white relative overflow-hidden" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('http://static.photos/food/1200x630/42')"}}>
        <div className="absolute inset-0" style={{background: "radial-gradient(ellipse at center, rgba(20,83,45,0.35), transparent 60%)"}} />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Sixth Sense Cooking</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Unlock your culinary intuition with Daniel Webb's revolutionary approach to cooking</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#purchase" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition duration-300">Buy the Book - $29.99</a>
            <a href="#recipes" className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-md text-lg font-semibold transition duration-300">Explore Recipes</a>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center" data-aos="fade-up">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">About the Book</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Transform Your Cooking Instincts</p>
          </div>

          <div className="mt-16">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="relative" data-aos="fade-right">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <i data-feather="eye" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Intuitive Cooking</h3>
                <p className="mt-2 text-base text-gray-500">Learn to trust your senses and cook without rigid recipes. Daniel Webb teaches you how to develop your culinary sixth sense.</p>
              </div>

              <div className="mt-10 lg:mt-0 relative" data-aos="fade-up">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <i data-feather="heart" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Heart-Centered Approach</h3>
                <p className="mt-2 text-base text-gray-500">Cooking isn't just about technique—it's about passion, love, and connection. Discover how to infuse your meals with emotion.</p>
              </div>

              <div className="mt-10 lg:mt-0 relative" data-aos="fade-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <i data-feather="zap" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Quick Adaptability</h3>
                <p className="mt-2 text-base text-gray-500">Master the art of improvisation in the kitchen. Learn how to adapt recipes based on what's fresh and available.</p>
              </div>
            </div>
          </div>

          <div className="mt-20" data-aos="fade-up">
            <div className="bg-gray-50 rounded-lg shadow-xl overflow-hidden">
              <div className="lg:grid lg:grid-cols-2">
                <div className="p-12">
                  <h3 className="text-2xl font-bold text-gray-900">What's Inside the Book</h3>
                  <p className="mt-4 text-gray-600">"Sixth Sense Cooking" is more than just a cookbook—it's a culinary philosophy. Daniel Webb shares his decades of experience in professional kitchens and home cooking to help you develop an intuitive understanding of flavors, textures, and techniques.</p>
                  <div className="mt-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <i data-feather="check-circle" className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700">Over 100 flexible recipes designed to build your intuition</p>
                      </div>
                    </div>
                    <div className="flex items-start mt-4">
                      <div className="flex-shrink-0">
                        <i data-feather="check-circle" className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700">Sensory exercises to sharpen your taste, smell, and touch</p>
                      </div>
                    </div>
                    <div className="flex items-start mt-4">
                      <div className="flex-shrink-0">
                        <i data-feather="check-circle" className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700">Techniques for adapting recipes based on seasonal ingredients</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block p-8">
                  <div className="polaroid">
                    <img className="h-full w-full object-cover" src="http://static.photos/food/800x800/23" alt="Cookbook preview" />
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
                <img className="h-48 w-full object-cover" src="http://static.photos/food/600x400/1" alt="Intuitive Pasta" />
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
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <img className="w-full h-auto" src="http://static.photos/people/600x800/10" alt="Daniel Webb" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white">Daniel Webb</h3>
                  <p className="text-red-300">Chef & Culinary Philosopher</p>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0" data-aos="fade-left">
              <h2 className="text-3xl font-extrabold text-gray-900">About the Author</h2>
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