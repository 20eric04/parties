"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Moon,
  UtensilsCrossed,
  Building2,
  Lightbulb,
  Crown,
  ChevronRight,
  DollarSign,
  Clock,
  Flame,
  Wine,
  Music,
  Sparkles,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */

interface TopPick {
  name: string;
  description: string;
  category: "nightlife" | "dining" | "hotel" | "experience" | "beach";
}

interface NightlifePick {
  name: string;
  vibe: string[];
  priceRange: string;
  bestNights: string;
  description: string;
}

interface DiningPick {
  name: string;
  cuisine: string;
  priceRange: string;
  reservationDifficulty: "Easy" | "Moderate" | "Hard" | "Very Hard";
  description: string;
}

interface HotelPick {
  name: string;
  stars: number;
  priceRange: string;
  neighborhood: string;
  description: string;
}

interface InsiderTip {
  title: string;
  body: string;
}

interface CityGuideData {
  name: string;
  tagline: string;
  vibeDescription: string;
  gradient: string;
  topPicks: TopPick[];
  nightlife: NightlifePick[];
  dining: DiningPick[];
  hotels: HotelPick[];
  tips: InsiderTip[];
}

/* ─── Curated Data ───────────────────────────────────────────────── */

const CITY_GUIDES: Record<string, CityGuideData> = {
  miami: {
    name: "Miami",
    tagline: "Where the night never ends",
    vibeDescription:
      "Miami is a city built for indulgence. From the Art Deco grandeur of South Beach to the raw energy of Wynwood, every neighborhood pulses with its own rhythm. The nightlife is world-class, the dining scene rivals any global capital, and the hotels are designed to make you never want to leave.",
    gradient: "from-orange-600 via-pink-600 to-purple-700",
    topPicks: [
      {
        name: "LIV",
        description:
          "The most iconic nightclub in Miami. If you only go to one club, this is it.",
        category: "nightlife",
      },
      {
        name: "Carbone",
        description:
          "Italian-American perfection in a retro-glam setting. The spicy rigatoni is non-negotiable.",
        category: "dining",
      },
      {
        name: "Faena Hotel",
        description:
          "Baz Luhrmann-designed maximalism meets beachfront luxury. A destination in itself.",
        category: "hotel",
      },
      {
        name: "Nikki Beach",
        description:
          "The original daylife concept. Sunday brunch here is a Miami rite of passage.",
        category: "beach",
      },
      {
        name: "E11EVEN",
        description:
          "The 24/7 ultraclub that defies categorization. Part club, part show, all spectacle.",
        category: "nightlife",
      },
    ],
    nightlife: [
      {
        name: "LIV",
        vibe: ["High Energy", "Mainstream", "Bottle Service"],
        priceRange: "$$$$$",
        bestNights: "Friday, Saturday",
        description:
          "Fontainebleau's crown jewel. Expect A-list DJs, celebrity sightings, and tables that start at $5K on peak nights.",
      },
      {
        name: "E11EVEN",
        vibe: ["24/7", "Immersive", "Spectacle"],
        priceRange: "$$$$",
        bestNights: "Thursday, Friday, Saturday",
        description:
          "The only 24-hour ultraclub in the country. Cirque-level performances meet mega-club energy.",
      },
      {
        name: "Do Not Sit on the Furniture",
        vibe: ["Underground", "House", "Intimate"],
        priceRange: "$$",
        bestNights: "Friday, Saturday",
        description:
          "For the real house music heads. No bottle service, no VIP \u2014 just impeccable sound and a sweaty dance floor.",
      },
      {
        name: "Basement",
        vibe: ["Late Night", "Hip-Hop", "Exclusive"],
        priceRange: "$$$$",
        bestNights: "Friday, Saturday",
        description:
          "Hidden beneath the Edition hotel. Bowling alley, ice rink, and a club that doesn\u2019t get going until 2AM.",
      },
    ],
    dining: [
      {
        name: "Carbone",
        cuisine: "Italian-American",
        priceRange: "$$$$",
        reservationDifficulty: "Very Hard",
        description:
          "Major Food Group\u2019s masterpiece. Every dish is a showstopper, every detail is considered.",
      },
      {
        name: "Gekko",
        cuisine: "Japanese Steakhouse",
        priceRange: "$$$$",
        reservationDifficulty: "Hard",
        description:
          "Bad Bunny\u2019s sultry Japanese-meets-steakhouse concept. The wagyu and the vibes are equally rich.",
      },
      {
        name: "Mandolin Aegean Bistro",
        cuisine: "Greek-Turkish",
        priceRange: "$$$",
        reservationDifficulty: "Moderate",
        description:
          "A Design District gem with a garden setting that transports you to the Mediterranean.",
      },
      {
        name: "Joe\u2019s Stone Crab",
        cuisine: "Seafood",
        priceRange: "$$$",
        reservationDifficulty: "Hard",
        description:
          "A Miami institution since 1913. Stone crabs, creamed spinach, key lime pie \u2014 the holy trinity.",
      },
    ],
    hotels: [
      {
        name: "Faena Hotel",
        stars: 5,
        priceRange: "$800 \u2013 $3,500/night",
        neighborhood: "Mid-Beach",
        description:
          "Baz Luhrmann\u2019s theatrical vision brought to life. The Mammoth Room, the gold-leafed theater, the beach \u2014 pure theater.",
      },
      {
        name: "The Setai",
        stars: 5,
        priceRange: "$700 \u2013 $3,000/night",
        neighborhood: "South Beach",
        description:
          "Asian-inspired serenity with three infinity pools. The most sophisticated address on South Beach.",
      },
      {
        name: "Four Seasons Surf Club",
        stars: 5,
        priceRange: "$900 \u2013 $4,000/night",
        neighborhood: "Surfside",
        description:
          "Where old-world glamour meets modern luxury. The Surf Club Restaurant by Thomas Keller is reason enough.",
      },
      {
        name: "1 Hotel South Beach",
        stars: 5,
        priceRange: "$500 \u2013 $2,000/night",
        neighborhood: "South Beach",
        description:
          "Eco-luxury done right. Rooftop pool, farm-to-table dining, and oceanfront rooms with balconies.",
      },
    ],
    tips: [
      {
        title: "Skip the line, always",
        body: "In Miami, the line is for people without a plan. Book tables in advance, arrive by midnight, and always have your concierge make the call.",
      },
      {
        title: "Wynwood for daytime",
        body: "Before the clubs open, explore Wynwood\u2019s galleries, murals, and restaurants. Lunch at KYU or Salty Donut is the perfect start.",
      },
      {
        title: "Music Week is everything",
        body: "Miami Music Week (late March) transforms the city into the global capital of electronic music. Book months ahead \u2014 everything triples in demand.",
      },
      {
        title: "The real brunch scene",
        body: "Sunday brunch is a competitive sport. Swan, Cecconi\u2019s at Soho Beach House, and Nikki Beach are the three to know.",
      },
      {
        title: "Brickell after dark",
        body: "Brickell is the locals\u2019 playground. Komodo, Gekko, and the rooftop at Sugar are less tourist-heavy and equally impressive.",
      },
    ],
  },
  "st-tropez": {
    name: "St. Tropez",
    tagline: "The jewel of the Riviera",
    vibeDescription:
      "St. Tropez is the original playground of the European jet set. From June to September, the tiny fishing village transforms into a who\u2019s-who of wealth, celebrity, and effortless Mediterranean style. The port fills with superyachts, Pampelonne Beach becomes the world\u2019s most glamorous shoreline, and every evening is a performance.",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    topPicks: [
      {
        name: "Les Caves du Roy",
        description:
          "The most legendary nightclub on the Riviera. Inside the Byblos hotel since 1967.",
        category: "nightlife",
      },
      {
        name: "Club 55",
        description:
          "The original Pampelonne Beach restaurant. Ros\u00e9, grilled fish, and bare feet since 1955.",
        category: "dining",
      },
      {
        name: "Cheval Blanc",
        description:
          "LVMH\u2019s crown jewel. Three Michelin stars and absolute perfection.",
        category: "hotel",
      },
      {
        name: "Nikki Beach St. Tropez",
        description:
          "The ultimate day-to-night beach club. Champagne spray season runs all summer.",
        category: "beach",
      },
      {
        name: "La Vague d\u2019Or",
        description:
          "Three Michelin stars at Cheval Blanc. The finest table on the entire coast.",
        category: "dining",
      },
    ],
    nightlife: [
      {
        name: "Les Caves du Roy",
        vibe: ["Legendary", "Champagne", "A-List"],
        priceRange: "$$$$$",
        bestNights: "Tuesday, Saturday",
        description:
          "The only club that matters in St. Tropez. Tables start at \u20AC5,000 in peak season. The champagne shower at 2AM is non-negotiable.",
      },
      {
        name: "VIP Room",
        vibe: ["Celebrity", "Electronic", "Exclusive"],
        priceRange: "$$$$",
        bestNights: "Wednesday, Saturday",
        description:
          "Jean-Roch\u2019s iconic club brings international DJs and the strictest door on the coast.",
      },
      {
        name: "Nikki Beach",
        vibe: ["Day-to-Night", "Beach", "International"],
        priceRange: "$$$$",
        bestNights: "Sunday (brunch), Wednesday",
        description:
          "Starts with ros\u00e9 by the pool, ends with dancing on the tables. The Amazing Sundays party is legendary.",
      },
      {
        name: "L\u2019Op\u00e9ra",
        vibe: ["Restaurant-Club", "Late Night", "Glamorous"],
        priceRange: "$$$$",
        bestNights: "Friday, Saturday",
        description:
          "Dinner becomes a party as the tables clear and the DJ takes over. Classic Tropezian nightlife.",
      },
    ],
    dining: [
      {
        name: "Club 55",
        cuisine: "Mediterranean Seafood",
        priceRange: "$$$",
        reservationDifficulty: "Very Hard",
        description:
          "The most iconic beach restaurant in the world. Book weeks ahead. The grilled whole fish and the atmosphere are unmatched.",
      },
      {
        name: "La Vague d\u2019Or",
        cuisine: "French Haute Cuisine",
        priceRange: "$$$$$",
        reservationDifficulty: "Very Hard",
        description:
          "Arnaud Donckele\u2019s three-starred temple at Cheval Blanc. This is the pinnacle of Riviera gastronomy.",
      },
      {
        name: "Loulou Ramatuelle",
        cuisine: "Coastal Italian",
        priceRange: "$$$",
        reservationDifficulty: "Moderate",
        description:
          "Paris\u2019s beloved Loulou, transplanted to a pine forest above Pampelonne. Truffle pizza and sea views.",
      },
      {
        name: "Le Girelier",
        cuisine: "Proven\u00e7al Seafood",
        priceRange: "$$$",
        reservationDifficulty: "Moderate",
        description:
          "Portside dining with the freshest catch. Less scene, more substance \u2014 the locals\u2019 choice.",
      },
    ],
    hotels: [
      {
        name: "Cheval Blanc St-Tropez",
        stars: 5,
        priceRange: "\u20AC1,500 \u2013 \u20AC5,000/night",
        neighborhood: "Pampelonne",
        description:
          "The undisputed best. Three Michelin-star dining, Guerlain spa, private beach. LVMH at its finest.",
      },
      {
        name: "H\u00f4tel Byblos",
        stars: 5,
        priceRange: "\u20AC800 \u2013 \u20AC3,000/night",
        neighborhood: "Town Center",
        description:
          "The most storied address in town. Home to Les Caves du Roy. If you want to be in the center of it all.",
      },
      {
        name: "La R\u00e9serve Ramatuelle",
        stars: 5,
        priceRange: "\u20AC1,000 \u2013 \u20AC4,000/night",
        neighborhood: "Ramatuelle Heights",
        description:
          "Perched above the coast with panoramic views. For those who want seclusion over scene.",
      },
      {
        name: "Pan De\u00ef",
        stars: 4,
        priceRange: "\u20AC400 \u2013 \u20AC1,200/night",
        neighborhood: "Pampelonne",
        description:
          "Boutique charm steps from the beach. A more intimate, design-forward alternative.",
      },
    ],
    tips: [
      {
        title: "Season is June to September",
        body: "St. Tropez effectively closes from October to May. The town empties, most restaurants shutter, and the energy vanishes. Plan accordingly.",
      },
      {
        title: "Arrive by boat",
        body: "The road from Nice or the airport is notoriously slow in summer. If budget allows, take a helicopter from Nice (20 min) or a water taxi from Sainte-Maxime.",
      },
      {
        title: "Ros\u00e9 is the currency",
        body: "This is the birthplace of Proven\u00e7al ros\u00e9 culture. Ch\u00e2teau Minuty, Miraval, and Whispering Angel flow freely. Don\u2019t fight it.",
      },
      {
        title: "Tuesday is the big night",
        body: "Unlike most cities, Tuesday is the prime night out in St. Tropez during summer. Les Caves du Roy on Tuesday is the hottest ticket on the Riviera.",
      },
      {
        title: "Place des Lices on Saturday",
        body: "The Saturday morning market in Place des Lices is a St. Tropez institution. Arrive early, buy lavender and olives, and people-watch with a caf\u00e9 cr\u00e8me.",
      },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function categoryIcon(cat: string) {
  switch (cat) {
    case "nightlife": return <Moon size={14} className="text-purple-400" />;
    case "dining": return <UtensilsCrossed size={14} className="text-amber-400" />;
    case "hotel": return <Building2 size={14} className="text-blue-400" />;
    case "beach": return <Sparkles size={14} className="text-cyan-400" />;
    case "experience": return <Star size={14} className="text-yellow-400" />;
    default: return <Star size={14} className="text-parties-accent" />;
  }
}

function priceColor(range: string) {
  const count = (range.match(/\$/g) || []).length;
  if (count >= 5) return "text-parties-accent";
  if (count >= 4) return "text-amber-400";
  return "text-green-400";
}

function difficultyColor(d: string) {
  switch (d) {
    case "Very Hard": return "text-red-400 bg-red-400/10";
    case "Hard": return "text-orange-400 bg-orange-400/10";
    case "Moderate": return "text-yellow-400 bg-yellow-400/10";
    default: return "text-green-400 bg-green-400/10";
  }
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ─── Coming Soon Component ──────────────────────────────────────── */

function ComingSoon({ cityName }: { cityName: string }) {
  const router = useRouter();
  return (
    <div className="min-h-dvh bg-parties-bg">
      <div className="relative px-5 pt-14 pb-8 bg-gradient-to-b from-parties-surface to-parties-bg">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs text-parties-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> All Hit Lists
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-parties-accent font-semibold mb-2">
            Hit List
          </p>
          <h1 className="font-display text-[36px] leading-[1.05] font-semibold text-white capitalize">
            {cityName.replace("-", " ")}
          </h1>
        </motion.div>
      </div>
      <div className="px-5 pt-8 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-parties-card p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-parties-accent/10 flex items-center justify-center mx-auto mb-5">
            <MapPin size={28} className="text-parties-accent" />
          </div>
          <h2 className="font-display text-2xl text-white font-semibold mb-2">
            Guide Coming Soon
          </h2>
          <p className="text-sm text-parties-secondary max-w-xs mx-auto mb-6">
            Our concierge team is curating the best of{" "}
            <span className="text-white capitalize">
              {cityName.replace("-", " ")}
            </span>
            . In the meantime, tell your concierge what you&rsquo;re looking for
            and we&rsquo;ll handle the rest.
          </p>
          <Link
            href="/concierge"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-parties-accent to-parties-accent-hover text-white text-sm font-semibold px-6 py-3 rounded-xl active:scale-[0.97] transition-transform"
          >
            Talk to Concierge
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main Page Component ────────────────────────────────────────── */

export default function CityGuidePage() {
  const params = useParams();
  const citySlug = params.city as string;
  const guide = CITY_GUIDES[citySlug];

  if (!guide) {
    return <ComingSoon cityName={citySlug} />;
  }

  return (
    <div className="min-h-dvh bg-parties-bg">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${guide.gradient} opacity-30`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-parties-bg/60 to-parties-bg" />

        <div className="relative px-5 pt-14 pb-10">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} /> All Hit Lists
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-parties-accent font-semibold mb-2">
              Hit List
            </p>
            <h1 className="font-display text-[42px] md:text-[56px] leading-[1.0] font-semibold text-white">
              {guide.name}
            </h1>
            <p className="text-lg text-white/50 font-display italic mt-1">
              {guide.tagline}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Vibe Description ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-5 pb-8"
      >
        <p className="text-sm text-parties-secondary leading-relaxed max-w-lg">
          {guide.vibeDescription}
        </p>
      </motion.div>

      <div className="px-5 pb-32 space-y-10">
        {/* ── THE LIST — Top 5 ─────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Crown size={16} />}
            title="The List"
            subtitle="Top 5 Must-Visit"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-3"
          >
            {guide.topPicks.map((pick, i) => (
              <motion.div
                key={pick.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-parties-card p-4 flex items-start gap-4"
              >
                <span className="shrink-0 w-9 h-9 rounded-full bg-parties-accent/10 flex items-center justify-center font-display text-lg font-bold text-parties-accent">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {categoryIcon(pick.category)}
                    <h4 className="text-sm font-semibold text-white truncate">
                      {pick.name}
                    </h4>
                  </div>
                  <p className="text-xs text-parties-secondary leading-relaxed">
                    {pick.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── AFTER DARK — Nightlife ──────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Moon size={16} />}
            title="After Dark"
            subtitle="Best Nightlife"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-4"
          >
            {guide.nightlife.map((club) => (
              <motion.div
                key={club.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-parties-card overflow-hidden"
              >
                {/* Gradient bar */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-parties-accent" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-white">
                      {club.name}
                    </h4>
                    <span
                      className={`text-xs font-bold ${priceColor(
                        club.priceRange
                      )}`}
                    >
                      {club.priceRange}
                    </span>
                  </div>
                  <p className="text-xs text-parties-secondary leading-relaxed mb-3">
                    {club.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {club.vibe.map((v) => (
                        <span
                          key={v}
                          className="text-[10px] font-semibold text-purple-300 bg-purple-400/10 px-2 py-0.5 rounded-full"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-parties-muted flex items-center gap-1">
                      <Clock size={10} />
                      {club.bestNights}
                    </span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <Link
                    href="/concierge"
                    className="flex items-center justify-center gap-2 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-white py-2.5 rounded-xl transition-colors"
                  >
                    Book via Concierge <ChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── THE TABLE — Dining ──────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<UtensilsCrossed size={16} />}
            title="The Table"
            subtitle="Where to Eat"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-4"
          >
            {guide.dining.map((rest) => (
              <motion.div
                key={rest.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-parties-card p-4"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-base font-semibold text-white">
                    {rest.name}
                  </h4>
                  <span
                    className={`text-xs font-bold ${priceColor(
                      rest.priceRange
                    )}`}
                  >
                    {rest.priceRange}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {rest.cuisine}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColor(
                      rest.reservationDifficulty
                    )}`}
                  >
                    {rest.reservationDifficulty} to book
                  </span>
                </div>
                <p className="text-xs text-parties-secondary leading-relaxed mb-3">
                  {rest.description}
                </p>
                <Link
                  href="/concierge"
                  className="flex items-center justify-center gap-2 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-white py-2.5 rounded-xl transition-colors"
                >
                  Book via Concierge <ChevronRight size={12} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── STAY — Hotels ───────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Building2 size={16} />}
            title="Stay"
            subtitle="Where to Sleep"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-4"
          >
            {guide.hotels.map((hotel) => (
              <motion.div
                key={hotel.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-parties-card overflow-hidden"
              >
                {/* Gradient placeholder image */}
                <div
                  className={`h-[120px] bg-gradient-to-br ${guide.gradient} relative`}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-3 left-4">
                    <StarRating count={hotel.stars} />
                  </div>
                  <div className="absolute bottom-3 right-4">
                    <span className="text-[10px] font-semibold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <MapPin size={10} />
                      {hotel.neighborhood}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-white">
                      {hotel.name}
                    </h4>
                    <span className="text-xs font-bold text-parties-accent whitespace-nowrap">
                      {hotel.priceRange}
                    </span>
                  </div>
                  <p className="text-xs text-parties-secondary leading-relaxed mb-3">
                    {hotel.description}
                  </p>
                  <Link
                    href="/concierge"
                    className="flex items-center justify-center gap-2 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-white py-2.5 rounded-xl transition-colors"
                  >
                    Book via Concierge <ChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── INSIDER TIPS ────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Lightbulb size={16} />}
            title="Insider Tips"
            subtitle="What the Locals Know"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-3"
          >
            {guide.tips.map((tip, i) => (
              <motion.div
                key={tip.title}
                variants={fadeUp}
                className="rounded-2xl border border-parties-accent/10 bg-parties-accent/[0.03] p-4"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-parties-accent text-xs font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {tip.title}
                  </h4>
                </div>
                <p className="text-xs text-parties-secondary leading-relaxed pl-6">
                  {tip.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/concierge"
            className="flex items-center justify-between w-full rounded-2xl bg-gradient-to-r from-parties-accent to-parties-accent-hover px-5 py-4 group active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Plan Your {guide.name} Trip
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                Our concierge handles every detail &mdash; tables, hotels,
                transport
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-white/80 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-parties-accent">{icon}</span>
        <h2 className="font-display text-xl font-semibold text-white">
          {title}
        </h2>
      </div>
      <p className="text-xs text-parties-muted uppercase tracking-wider pl-6">
        {subtitle}
      </p>
    </div>
  );
}
