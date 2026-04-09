"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Wine,
  UtensilsCrossed,
  Building2,
  Moon,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

/* ─── City Data ──────────────────────────────────────────────────── */

interface CityGuide {
  slug: string;
  name: string;
  tagline: string;
  recommendations: number;
  gradient: string;
  categories: string[];
  available: boolean;
}

const CITIES: CityGuide[] = [
  {
    slug: "miami",
    name: "Miami",
    tagline: "Where the night never ends",
    recommendations: 18,
    gradient: "from-orange-600 via-pink-600 to-purple-700",
    categories: ["nightlife", "dining", "hotels"],
    available: true,
  },
  {
    slug: "st-tropez",
    name: "St. Tropez",
    tagline: "The jewel of the Riviera",
    recommendations: 16,
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    categories: ["nightlife", "dining", "hotels"],
    available: true,
  },
  {
    slug: "new-york",
    name: "New York",
    tagline: "The city that sets the standard",
    recommendations: 20,
    gradient: "from-zinc-600 via-zinc-500 to-amber-500",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    tagline: "Sun-drenched glamour",
    recommendations: 15,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "monaco",
    name: "Monaco",
    tagline: "Where opulence is the baseline",
    recommendations: 14,
    gradient: "from-red-700 via-red-600 to-yellow-500",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "cannes",
    name: "Cannes",
    tagline: "Cinema glamour meets the sea",
    recommendations: 13,
    gradient: "from-indigo-600 via-purple-500 to-pink-500",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "london",
    name: "London",
    tagline: "Timeless sophistication",
    recommendations: 17,
    gradient: "from-slate-700 via-slate-600 to-blue-500",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "dubai",
    name: "Dubai",
    tagline: "Excess without apology",
    recommendations: 16,
    gradient: "from-yellow-600 via-amber-500 to-orange-600",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "ibiza",
    name: "Ibiza",
    tagline: "The island that invented the party",
    recommendations: 14,
    gradient: "from-violet-600 via-fuchsia-500 to-pink-400",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
  {
    slug: "mykonos",
    name: "Mykonos",
    tagline: "Aegean hedonism at its finest",
    recommendations: 13,
    gradient: "from-sky-500 via-blue-400 to-white/60",
    categories: ["nightlife", "dining", "hotels"],
    available: false,
  },
];

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "nightlife": return <Moon size={12} />;
    case "dining": return <UtensilsCrossed size={12} />;
    case "hotels": return <Building2 size={12} />;
    default: return <Sparkles size={12} />;
  }
};

/* ─── Page ───────────────────────────────────────────────────────── */

export default function HitListsPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-parties-bg">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-8 bg-gradient-to-b from-parties-surface to-parties-bg">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-parties-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Explore
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-parties-accent font-semibold mb-2">
            Curated Guides
          </p>
          <h1 className="font-display text-[36px] md:text-[48px] leading-[1.05] font-semibold text-white">
            Hit Lists
          </h1>
          <p className="text-parties-secondary text-sm mt-2 max-w-sm">
            The definitive guide to every city worth visiting &mdash; our
            concierge team&rsquo;s handpicked favorites for nightlife, dining,
            hotels, and insider tips.
          </p>
        </motion.div>
      </div>

      {/* City Grid */}
      <div className="px-5 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CITIES.map((city, i) => (
            <motion.button
              key={city.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() =>
                city.available
                  ? router.push(`/guides/${city.slug}`)
                  : router.push(`/guides/${city.slug}`)
              }
              className="group relative w-full text-left rounded-2xl overflow-hidden border border-white/[0.06] active:scale-[0.98] transition-transform"
            >
              {/* Gradient cover */}
              <div
                className={`relative h-[180px] sm:h-[200px] bg-gradient-to-br ${city.gradient}`}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Available badge */}
                {city.available && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-parties-accent text-white px-2.5 py-1 rounded-full">
                    Live
                  </span>
                )}

                {/* City name on image */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-[26px] font-semibold text-white leading-tight">
                    {city.name}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {city.tagline}
                  </p>
                </div>
              </div>

              {/* Card footer */}
              <div className="bg-parties-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-parties-muted">
                    {city.recommendations} picks
                  </span>
                  <div className="flex items-center gap-1.5">
                    {city.categories.map((cat) => (
                      <span
                        key={cat}
                        className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-parties-muted"
                      >
                        {categoryIcon(cat)}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-parties-muted group-hover:text-white transition-colors"
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
