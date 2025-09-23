"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";

export default function HomePage() {
  const [query, setQuery] = useState("");

  const featured = [
    { id: 1, title: "Creamy Garlic Chicken", time: "35 min", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80&auto=format&fit=crop" },
    { id: 2, title: "Spaghetti Aglio e Olio", time: "20 min", image: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?w=1200&q=80&auto=format&fit=crop" },
    { id: 3, title: "Avocado Toast with Eggs", time: "10 min", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1200&q=80&auto=format&fit=crop" },
    { id: 4, title: "Teriyaki Salmon Bowl", time: "30 min", image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=1200&q=80&auto=format&fit=crop" },
  ];

  const categories = ["Breakfast", "Lunch", "Dinner", "Desserts", "Vegetarian", "Quick & Easy", "Healthy", "One-Pot"];

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />

      <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">Cookbook</Link>
            <div className="hidden md:flex gap-6 text-sm text-gray-600">
              <a href="#featured" className="hover:text-gray-900">Featured</a>
              <a href="#categories" className="hover:text-gray-900">Categories</a>
              <a href="#newsletter" className="hover:text-gray-900">Newsletter</a>
            </div>
            <Link href="#" className="text-sm font-medium px-3 py-2 rounded-md bg-gray-900 text-white">Sign in</Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Find, save, and cook delicious recipes</h1>
            <p className="mt-4 text-lg text-gray-600">Your personal digital cookbook—discover new favorites and organize your go‑to meals.</p>

            <div className="mt-8">
              <div className="flex rounded-lg shadow-sm bg-white ring-1 ring-gray-200 overflow-hidden">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 5,000+ recipes (e.g., chicken, vegan, 30 min)"
                  className="w-full px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button className="px-5 bg-gray-900 text-white text-sm font-medium">Search</button>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Popular: <button className="underline mr-2">pasta</button>
                <button className="underline mr-2">chicken</button>
                <button className="underline">vegetarian</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="featured" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured recipes</h2>
            <a href="#" className="text-sm font-medium text-gray-900">View all</a>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((r) => (
              <a key={r.id} href="#" className="group block overflow-hidden rounded-xl ring-1 ring-gray-200 bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={r.image} alt={r.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">⏱ {r.time}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">Popular</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-gray-900">{r.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Browse by category</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <a key={c} href="#" className="inline-flex items-center rounded-full bg-white ring-1 ring-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{c}</a>
            ))}
          </div>
        </div>
      </section>

      <section id="newsletter" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-900 p-8 sm:p-10 text-white">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Weekly recipe inspiration</h3>
                <p className="mt-1 text-gray-300">Get 3 hand‑picked recipes and a shopping list every Friday.</p>
              </div>
              <form className="mt-6 sm:mt-0 flex w-full sm:w-auto gap-3">
                <input type="email" placeholder="you@example.com" className="min-w-0 flex-1 rounded-lg px-4 py-2 text-gray-900" />
                <button className="rounded-lg bg-white px-4 py-2 text-gray-900 font-medium">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>&copy; {new Date().getFullYear()} Cookbook</div>
            <div className="flex gap-4">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}