"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Star, Wine, UtensilsCrossed, Building2, Home, Trophy, Film, ChevronRight } from "lucide-react";
import PricingSeasonBadge from "@/components/PricingSeasonBadge";
import { getCurrentSeason, getSeasonDisplay } from "@/lib/pricing-seasons";

/* ─── Types ──────────────────────────────────────────────────────── */

type CityKey = "St. Tropez" | "Monaco" | "Cannes";

interface Venue {
  name: string;
  range: string;
  note?: string;
}

interface PricingCategory {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  venues: Venue[];
}

interface CityData {
  tagline: string;
  image: string;
  categories: PricingCategory[];
  specialNote?: { icon: React.ReactNode; title: string; body: string };
}

/* ─── Data ───────────────────────────────────────────────────────── */

const CITIES: CityKey[] = ["St. Tropez", "Monaco", "Cannes"];

const CITY_DATA: Record<CityKey, CityData> = {
  "St. Tropez": {
    tagline: "The jewel of the French Riviera summer season",
    image: "/images/guides/st-tropez.jpg",
    categories: [
      {
        icon: <Wine size={18} />,
        title: "Clubs & Bottle Service",
        subtitle: "Table minimums per night",
        venues: [
          { name: "Les Caves du Roy", range: "€5,000 – €20,000", note: "The legendary Byblos club. Peak summer books months ahead." },
          { name: "Nikki Beach", range: "€2,000 – €8,000", note: "Day-to-night beach club experience." },
          { name: "VIP Room", range: "€3,000 – €15,000", note: "Celebrity hotspot. Door policy is strict." },
        ],
      },
      {
        icon: <UtensilsCrossed size={18} />,
        title: "Fine Dining",
        subtitle: "Prix fixe or average per person",
        venues: [
          { name: "Club 55", range: "€150 – €300 pp", note: "The original Pampelonne beach restaurant since 1955." },
          { name: "La Vague d'Or", range: "€250 – €450 pp", note: "Three Michelin stars at Cheval Blanc." },
          { name: "Loulou Ramatuelle", range: "€100 – €200 pp", note: "Coastal Italian with St. Tropez flair." },
        ],
      },
      {
        icon: <Building2 size={18} />,
        title: "Hotels",
        subtitle: "Per night, double occupancy",
        venues: [
          { name: "Byblos", range: "€800 – €3,000", note: "Iconic address on Place des Lices." },
          { name: "Cheval Blanc", range: "€1,500 – €5,000", note: "LVMH's crown jewel. Absolute top tier." },
          { name: "La Réserve Ramatuelle", range: "€1,000 – €4,000", note: "Secluded luxury above Pampelonne." },
        ],
      },
      {
        icon: <Home size={18} />,
        title: "Villa Rentals",
        subtitle: "Weekly rates by season and size",
        venues: [
          { name: "2-3 Bedroom Villa", range: "€10,000 – €30,000 / wk" },
          { name: "4-5 Bedroom Estate", range: "€25,000 – €80,000 / wk" },
          { name: "Waterfront Compound", range: "€60,000 – €150,000 / wk", note: "Direct Pampelonne or harbor access." },
        ],
      },
    ],
  },
  Monaco: {
    tagline: "The principality where opulence is the baseline",
    image: "/images/guides/monaco.jpg",
    categories: [
      {
        icon: <Wine size={18} />,
        title: "Clubs & Bottle Service",
        subtitle: "Table minimums per night",
        venues: [
          { name: "Jimmy'z", range: "€3,000 – €15,000", note: "Monte-Carlo's legendary open-air club." },
          { name: "Twiga", range: "€2,000 – €10,000", note: "Flavio Briatore's Formula 1 circuit staple." },
          { name: "Buddha-Bar", range: "€1,000 – €5,000", note: "Asian-fusion lounge with bottle service." },
        ],
      },
      {
        icon: <UtensilsCrossed size={18} />,
        title: "Fine Dining",
        subtitle: "Prix fixe or average per person",
        venues: [
          { name: "Le Louis XV – Alain Ducasse", range: "€300 – €500 pp", note: "Three Michelin stars at Hotel de Paris." },
          { name: "Blue Bay", range: "€150 – €250 pp", note: "Two stars. Marcel Ravin's Caribbean-French fusion." },
          { name: "Cipriani", range: "€100 – €200 pp", note: "Classic Italian in the Monte-Carlo Bay." },
        ],
      },
      {
        icon: <Building2 size={18} />,
        title: "Hotels",
        subtitle: "Per night, double occupancy",
        venues: [
          { name: "Hotel de Paris", range: "€1,000 – €5,000", note: "The address. Casino Square frontage." },
          { name: "Hermitage", range: "€600 – €2,500", note: "Belle Époque elegance. Stunning winter garden." },
          { name: "Monte-Carlo Bay", range: "€400 – €1,500", note: "Resort-style with private lagoon." },
        ],
      },
    ],
    specialNote: {
      icon: <Trophy size={18} />,
      title: "Formula 1 Grand Prix Weekend",
      body: "During the Monaco Grand Prix (late May), expect 3-5x standard pricing across all categories. Hotel rooms regularly sell out a year in advance. Table minimums at Jimmy'z and Twiga can exceed €50,000. We recommend booking 6-12 months ahead.",
    },
  },
  Cannes: {
    tagline: "Where cinema glamour meets Mediterranean nightlife",
    image: "/images/guides/cannes.jpg",
    categories: [
      {
        icon: <Wine size={18} />,
        title: "Clubs & Bottle Service",
        subtitle: "Table minimums per night",
        venues: [
          { name: "Gotha", range: "€2,000 – €10,000", note: "Multi-level mega club on La Croisette." },
          { name: "Baôli", range: "€2,000 – €8,000", note: "Restaurant-club hybrid. Iconic Cannes nightlife." },
          { name: "VIP Room", range: "€2,000 – €10,000", note: "Festival season pop-up with A-list door." },
        ],
      },
      {
        icon: <UtensilsCrossed size={18} />,
        title: "Fine Dining",
        subtitle: "Prix fixe or average per person",
        venues: [
          { name: "La Palme d'Or", range: "€200 – €400 pp", note: "Two Michelin stars at the Martinez." },
          { name: "Le Park 45", range: "€150 – €300 pp", note: "Grand Hyatt's refined Mediterranean cuisine." },
        ],
      },
      {
        icon: <Building2 size={18} />,
        title: "Hotels",
        subtitle: "Per night, double occupancy",
        venues: [
          { name: "Hotel du Cap-Eden-Roc", range: "€1,500 – €6,000", note: "The most storied hotel on the Riviera." },
          { name: "Martinez", range: "€500 – €2,500", note: "Art Deco landmark on La Croisette." },
          { name: "Majestic Barrière", range: "€400 – €2,000", note: "Festival epicenter. Red carpet views." },
        ],
      },
    ],
    specialNote: {
      icon: <Film size={18} />,
      title: "Cannes Film Festival",
      body: "During the Festival de Cannes (mid-May), expect 3-5x standard pricing across all categories. La Croisette hotels sell out 6+ months in advance. Club tables and restaurant reservations become extremely competitive. Early booking is essential.",
    },
  },
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function SeasonIndicator({ city }: { city: string }) {
  const season = getCurrentSeason(city);
  if (!season) return null;
  const display = getSeasonDisplay(season.tier);
  return (
    <div className={`rounded-xl border ${display.borderColor} ${display.bgColor} px-4 py-3 flex items-center justify-between`}>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${display.color}`}>
          {season.activeEvent ? season.activeEvent.name : display.badge}
          {season.multiplier > 1 && <span className="ml-1.5 opacity-70">{season.multiplier}x</span>}
        </p>
        <p className="text-[11px] text-parties-muted mt-0.5">
          {season.activeEvent ? season.activeEvent.description : display.description}
        </p>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${display.bgColor} ${display.color} border ${display.borderColor}`}>
        Now
      </span>
    </div>
  );
}

/* ─── Page Component ─────────────────────────────────────────────── */

export default function RivieraPricingGuidePage() {
  const [activeCity, setActiveCity] = useState<CityKey>("St. Tropez");
  const data = CITY_DATA[activeCity];

  return (
    <div className="min-h-dvh bg-parties-bg">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="relative px-5 pt-14 pb-10 bg-gradient-to-b from-parties-surface to-parties-bg">
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
            Insider Guide
          </p>
          <h1 className="font-display text-[32px] md:text-[44px] leading-[1.1] font-semibold text-white">
            C&ocirc;te d&rsquo;Azur
          </h1>
          <p className="text-parties-secondary text-sm mt-2 max-w-md">
            Real market rates for the French Riviera&rsquo;s most coveted venues,
            restaurants, and hotels &mdash; updated seasonally.
          </p>
        </motion.div>

        {/* Season badge row */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {CITIES.map((c) => (
            <PricingSeasonBadge key={c} city={c} variant="compact" />
          ))}
        </div>
      </div>

      {/* ── City Tabs ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-parties-bg/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex px-5">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCity(c)}
              className={`relative flex-1 py-3.5 text-sm font-semibold text-center transition-colors ${
                activeCity === c ? "text-white" : "text-parties-muted"
              }`}
            >
              {c}
              {activeCity === c && (
                <motion.div
                  layoutId="city-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-parties-accent rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── City Content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCity}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pt-6 pb-32"
        >
          {/* City intro */}
          <div className="flex items-start gap-3 mb-5">
            <MapPin size={16} className="text-parties-accent mt-0.5 shrink-0" />
            <div>
              <h2 className="font-display text-xl text-white font-semibold">{activeCity}</h2>
              <p className="text-xs text-parties-secondary mt-0.5">{data.tagline}</p>
            </div>
          </div>

          {/* Current season for this city */}
          <div className="mb-6">
            <SeasonIndicator city={activeCity} />
          </div>

          {/* Special event note */}
          {data.specialNote && (
            <div className="mb-6 rounded-xl border border-parties-accent/20 bg-parties-accent/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-parties-accent">{data.specialNote.icon}</span>
                <h3 className="text-sm font-semibold text-parties-accent">{data.specialNote.title}</h3>
              </div>
              <p className="text-xs text-parties-secondary leading-relaxed">{data.specialNote.body}</p>
            </div>
          )}

          {/* Pricing categories */}
          <div className="space-y-6">
            {data.categories.map((cat, ci) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: ci * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-white/[0.06] bg-parties-card overflow-hidden"
              >
                {/* Category header */}
                <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="text-parties-accent">{cat.icon}</span>
                    <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                  </div>
                  <p className="text-[11px] text-parties-muted mt-1">{cat.subtitle}</p>
                </div>

                {/* Venue rows */}
                <div className="divide-y divide-white/[0.04]">
                  {cat.venues.map((v) => (
                    <div key={v.name} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{v.name}</p>
                          {v.note && (
                            <p className="text-[11px] text-parties-muted mt-0.5 leading-relaxed">{v.note}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-parties-accent whitespace-nowrap">
                          {v.range}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/concierge"
              className="flex items-center justify-between w-full rounded-2xl bg-gradient-to-r from-parties-accent to-parties-accent-hover px-5 py-4 group active:scale-[0.98] transition-transform"
            >
              <div>
                <p className="text-sm font-semibold text-white">Book Through PARTIES</p>
                <p className="text-xs text-white/70 mt-0.5">
                  Preferred rates &amp; priority access in {activeCity}
                </p>
              </div>
              <ChevronRight size={18} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-parties-muted text-center mt-6 leading-relaxed px-4">
            Prices are approximate and vary by date, availability, and group size.
            All figures reflect market rates as of 2025&ndash;2026 and are subject to change.
            Contact our concierge for a personalized quote.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
