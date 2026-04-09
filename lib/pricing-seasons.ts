// Seasonal pricing data for all destinations
// Multipliers are reference data — will eventually come from Supabase

export type SeasonTier = "peak" | "high" | "shoulder" | "low";

export interface SeasonalEvent {
  name: string;
  city: string;
  monthStart: number; // 1-indexed
  dayStart: number;
  monthEnd: number;
  dayEnd: number;
  multiplier: number;
  description: string;
}

export interface SeasonRange {
  tier: SeasonTier;
  label: string;
  monthStart: number; // 1-indexed
  monthEnd: number; // inclusive
  multiplier: number;
}

export interface CityPricingConfig {
  city: string;
  region: string;
  seasons: SeasonRange[];
  events: SeasonalEvent[];
}

export const FRENCH_RIVIERA_CITIES: CityPricingConfig[] = [
  {
    city: "St. Tropez",
    region: "Côte d'Azur",
    seasons: [
      { tier: "peak", label: "Peak Season", monthStart: 6, monthEnd: 8, multiplier: 2.5 },
      { tier: "high", label: "High Season", monthStart: 5, monthEnd: 5, multiplier: 1.5 },
      { tier: "high", label: "High Season", monthStart: 9, monthEnd: 9, multiplier: 1.5 },
      { tier: "low", label: "Off Season", monthStart: 10, monthEnd: 4, multiplier: 1.0 },
    ],
    events: [
      {
        name: "Les Voiles de Saint-Tropez",
        city: "St. Tropez",
        monthStart: 9, dayStart: 28,
        monthEnd: 10, dayEnd: 6,
        multiplier: 2.0,
        description: "The prestigious sailing regatta draws yachting elite to the harbor.",
      },
    ],
  },
  {
    city: "Monaco",
    region: "Côte d'Azur",
    seasons: [
      { tier: "peak", label: "Peak Season", monthStart: 5, monthEnd: 5, multiplier: 3.0 },
      { tier: "high", label: "High Season", monthStart: 6, monthEnd: 9, multiplier: 2.0 },
      { tier: "shoulder", label: "Shoulder Season", monthStart: 4, monthEnd: 4, multiplier: 1.3 },
      { tier: "shoulder", label: "Shoulder Season", monthStart: 10, monthEnd: 10, multiplier: 1.3 },
      { tier: "low", label: "Off Season", monthStart: 11, monthEnd: 3, multiplier: 1.0 },
    ],
    events: [
      {
        name: "Monaco Grand Prix",
        city: "Monaco",
        monthStart: 5, dayStart: 22,
        monthEnd: 5, dayEnd: 28,
        multiplier: 3.0,
        description: "Formula 1 transforms the principality. Expect peak demand across all services.",
      },
    ],
  },
  {
    city: "Cannes",
    region: "Côte d'Azur",
    seasons: [
      { tier: "peak", label: "Peak Season", monthStart: 5, monthEnd: 5, multiplier: 3.0 },
      { tier: "high", label: "High Season", monthStart: 6, monthEnd: 8, multiplier: 2.0 },
      { tier: "shoulder", label: "Shoulder Season", monthStart: 4, monthEnd: 4, multiplier: 1.3 },
      { tier: "shoulder", label: "Shoulder Season", monthStart: 9, monthEnd: 9, multiplier: 1.3 },
      { tier: "low", label: "Off Season", monthStart: 10, monthEnd: 3, multiplier: 1.0 },
    ],
    events: [
      {
        name: "Cannes Film Festival",
        city: "Cannes",
        monthStart: 5, dayStart: 13,
        monthEnd: 5, dayEnd: 24,
        multiplier: 3.0,
        description: "The world's most prestigious film festival. Demand for premium tables and services surges.",
      },
    ],
  },
];

export const LONDON_PRICING: CityPricingConfig = {
  city: "London",
  region: "Europe",
  seasons: [
    { tier: "peak", label: "Peak Season", monthStart: 6, monthEnd: 8, multiplier: 1.5 },
    { tier: "high", label: "High Season", monthStart: 12, monthEnd: 12, multiplier: 1.8 },
    { tier: "shoulder", label: "Shoulder Season", monthStart: 3, monthEnd: 5, multiplier: 1.2 },
    { tier: "shoulder", label: "Shoulder Season", monthStart: 9, monthEnd: 11, multiplier: 1.2 },
    { tier: "low", label: "Off Season", monthStart: 1, monthEnd: 2, multiplier: 1.0 },
  ],
  events: [
    {
      name: "London NYE",
      city: "London",
      monthStart: 12, dayStart: 31,
      monthEnd: 12, dayEnd: 31,
      multiplier: 3.0,
      description: "New Year's Eve in London. Premium demand for tables and nightlife across the city.",
    },
  ],
};

export const DUBAI_PRICING: CityPricingConfig = {
  city: "Dubai",
  region: "Middle East",
  seasons: [
    { tier: "peak", label: "Peak Season", monthStart: 11, monthEnd: 3, multiplier: 2.0 },
    { tier: "high", label: "High Season", monthStart: 10, monthEnd: 10, multiplier: 1.5 },
    { tier: "high", label: "High Season", monthStart: 4, monthEnd: 4, multiplier: 1.5 },
    { tier: "low", label: "Off Season", monthStart: 5, monthEnd: 9, multiplier: 0.8 },
  ],
  events: [
    {
      name: "Dubai F1 Grand Prix",
      city: "Dubai",
      monthStart: 11, dayStart: 20,
      monthEnd: 11, dayEnd: 24,
      multiplier: 2.5,
      description: "The Abu Dhabi/Dubai F1 weekend draws global crowds. Peak demand for nightlife and hospitality.",
    },
  ],
};

export const IBIZA_PRICING: CityPricingConfig = {
  city: "Ibiza",
  region: "Europe",
  seasons: [
    { tier: "peak", label: "Peak Season", monthStart: 7, monthEnd: 8, multiplier: 2.5 },
    { tier: "high", label: "High Season", monthStart: 6, monthEnd: 6, multiplier: 1.8 },
    { tier: "high", label: "High Season", monthStart: 9, monthEnd: 9, multiplier: 1.8 },
    { tier: "shoulder", label: "Shoulder Season", monthStart: 5, monthEnd: 5, multiplier: 1.2 },
    { tier: "shoulder", label: "Shoulder Season", monthStart: 10, monthEnd: 10, multiplier: 1.2 },
    { tier: "low", label: "Off Season", monthStart: 11, monthEnd: 4, multiplier: 0.7 },
  ],
  events: [
    {
      name: "Ibiza Opening Parties",
      city: "Ibiza",
      monthStart: 5, dayStart: 1,
      monthEnd: 6, dayEnd: 15,
      multiplier: 2.0,
      description: "The legendary opening parties kick off the season. Major clubs unveil lineups and residencies.",
    },
    {
      name: "Ibiza Closing Parties",
      city: "Ibiza",
      monthStart: 9, dayStart: 15,
      monthEnd: 10, dayEnd: 15,
      multiplier: 2.0,
      description: "Closing parties mark the end of the season with marathon sets and special guests.",
    },
  ],
};

// All cities that have seasonal pricing
export const ALL_PRICING_CITIES: CityPricingConfig[] = [
  ...FRENCH_RIVIERA_CITIES,
  LONDON_PRICING,
  DUBAI_PRICING,
  IBIZA_PRICING,
];

export const SEASONAL_CITIES = ALL_PRICING_CITIES.map((c) => c.city);

function isMonthInRange(month: number, start: number, end: number): boolean {
  if (start <= end) return month >= start && month <= end;
  // Wraps around year boundary (e.g., Oct-Apr = 10-4)
  return month >= start || month <= end;
}

function isDateInEventRange(date: Date, event: SeasonalEvent): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const startVal = event.monthStart * 100 + event.dayStart;
  const endVal = event.monthEnd * 100 + event.dayEnd;
  const currentVal = m * 100 + d;
  return currentVal >= startVal && currentVal <= endVal;
}

export function getCityPricing(city: string): CityPricingConfig | null {
  return ALL_PRICING_CITIES.find((c) => c.city === city) || null;
}

export function getCurrentSeason(city: string, date: Date = new Date()): {
  tier: SeasonTier;
  label: string;
  multiplier: number;
  activeEvent: SeasonalEvent | null;
} | null {
  const config = getCityPricing(city);
  if (!config) return null;

  const month = date.getMonth() + 1; // 1-indexed

  // Check for active events first — they override base season pricing
  const activeEvent = config.events.find((e) => isDateInEventRange(date, e)) || null;

  // Find the base season
  const season = config.seasons.find((s) => isMonthInRange(month, s.monthStart, s.monthEnd));
  if (!season) return null;

  // Event multiplier takes precedence if higher
  const effectiveMultiplier = activeEvent
    ? Math.max(season.multiplier, activeEvent.multiplier)
    : season.multiplier;

  // If an event is active during peak, label it as peak
  const effectiveTier = activeEvent && activeEvent.multiplier >= season.multiplier
    ? "peak" as SeasonTier
    : season.tier;

  const effectiveLabel = activeEvent
    ? activeEvent.name
    : season.label;

  return {
    tier: effectiveTier,
    label: effectiveLabel,
    multiplier: effectiveMultiplier,
    activeEvent,
  };
}

export function getSeasonDisplay(tier: SeasonTier): {
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
} {
  switch (tier) {
    case "peak":
      return {
        badge: "Peak Season",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        description: "Premium demand period. Reserve early.",
      };
    case "high":
      return {
        badge: "High Season",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        description: "Elevated demand. Popular dates book fast.",
      };
    case "shoulder":
      return {
        badge: "Shoulder Season",
        color: "text-sky-400",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/20",
        description: "Favorable conditions with moderate demand.",
      };
    case "low":
      return {
        badge: "Off Season",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        description: "Best value. Exclusive access with fewer crowds.",
      };
  }
}

export function isSeasonalCity(city: string): boolean {
  return SEASONAL_CITIES.includes(city);
}
