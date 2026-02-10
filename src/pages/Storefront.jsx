import React, { useState } from "react";
import {
  ShoppingCart,
  ExternalLink,
  Star,
  Tag,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    name: "Precision Kitchen Scale",
    category: "Cooking",
    description:
      "The exact scale I use for measuring my macros. Stainless steel and incredibly accurate.",
    price: "$24.99",
    image:
      "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&q=80&w=400",
    amazonLink: "https://amazon.com/your-link",
    rating: 4.9,
    featured: true,
  },
  {
    id: 2,
    name: "Performance Whey Isolate",
    category: "Supplements",
    description:
      "My go-to post-workout protein. Unflavored, zero fillers, and mixes perfectly.",
    price: "$54.99",
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=400",
    amazonLink: "https://amazon.com/your-link",
    rating: 5.0,
    featured: false,
  },
  // Add more items here
];

export default function Storefront() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* GLOW DECORATION */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-brand/5 blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="relative pt-24 pb-12 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <ShieldCheck size={14} className="text-brand" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            Vetted & Verified Gear
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-[0.85]">
          Recommended <span className="text-brand">Fuel</span> Tools
        </h1>
        <p className="max-w-xl mx-auto text-muted text-lg font-medium leading-relaxed">
          The exact equipment, supplements, and tech I use to optimize my daily
          performance.
        </p>
      </header>

      {/* FILTER BAR */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center gap-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT MESH GRID */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(
            (p) => activeCategory === "All" || p.category === activeCategory,
          ).map((product) => (
            <div
              key={product.id}
              className="group relative bg-[#0D0D0D] border border-white/5 rounded-[2.5rem] p-4 hover:border-brand/40 transition-all duration-500 flex flex-col shadow-2xl"
            >
              {/* Product Image Wrapper */}
              <div className="relative aspect-square overflow-hidden rounded-[2rem] mb-6">
                <img
                  src={product.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={product.name}
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-brand px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Zap size={12} className="fill-white" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Top Choice
                    </span>
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="px-4 pb-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs font-black text-white">
                      {product.rating}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">
                  {product.name}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-8 flex-1">
                  {product.description}
                </p>

                {/* The "Money" Button */}
                <a
                  href={product.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group/btn w-full bg-white text-black p-1 rounded-2xl font-black uppercase text-xs transition-all hover:bg-brand hover:text-white"
                >
                  <span className="pl-6 py-3 tracking-widest">
                    Buy on Amazon
                  </span>
                  <div className="bg-black/10 group-hover/btn:bg-white/20 p-3 rounded-xl transition-colors">
                    <ExternalLink size={18} />
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* DISCLOSURE FOOTER */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[9px] font-bold text-muted/40 uppercase tracking-[0.3em] leading-loose">
            As an Amazon Associate I earn from qualifying purchases. This
            storefront uses affiliate links which means I may receive a small
            commission at no cost to you.
          </p>
        </div>
      </footer>
    </div>
  );
}
