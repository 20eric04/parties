// Major events calendar — hardcoded reference data for global luxury events
// Will eventually be managed via Supabase admin

export type EventCategory =
  | "Motorsport"
  | "Film/Culture"
  | "Sailing"
  | "Art"
  | "Holiday"
  | "Music"
  | "Sports"
  | "Fashion"
  | "Festival"
  | "Nightlife"
  | "Shopping";

export interface MajorEvent {
  id: string;
  name: string;
  city: string;
  category: EventCategory;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  description: string;
  pricingNote: string;
  multiplier: number;
  conciergeMessage: string;
}

export const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; dot: string }> = {
  Motorsport: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-500" },
  "Film/Culture": { bg: "bg-purple-500/15", text: "text-purple-400", dot: "bg-purple-500" },
  Sailing: { bg: "bg-sky-500/15", text: "text-sky-400", dot: "bg-sky-500" },
  Art: { bg: "bg-fuchsia-500/15", text: "text-fuchsia-400", dot: "bg-fuchsia-500" },
  Holiday: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-500" },
  Music: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-500" },
  Sports: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-500" },
  Fashion: { bg: "bg-pink-500/15", text: "text-pink-400", dot: "bg-pink-500" },
  Festival: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-500" },
  Nightlife: { bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-500" },
  Shopping: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500" },
};

export const MAJOR_EVENTS: MajorEvent[] = [
  {
    id: "super-bowl-lx",
    name: "Super Bowl LX",
    city: "San Francisco",
    category: "Sports",
    startDate: "2026-02-08",
    endDate: "2026-02-08",
    description: "The biggest night in American sports descends on the Bay Area. VIP suites, exclusive after-parties, and celebrity-studded events across the city.",
    pricingNote: "Expect 3-5x pricing on hotels and transport during Super Bowl weekend",
    multiplier: 4.0,
    conciergeMessage: "I'd like to arrange VIP access for Super Bowl LX in San Francisco (Feb 8, 2026)",
  },
  {
    id: "carnival-2026",
    name: "Carnival",
    city: "Rio / Miami",
    category: "Festival",
    startDate: "2026-02-13",
    endDate: "2026-02-17",
    description: "The world's most vibrant celebration. Parades, samba, masked balls, and exclusive private parties in Rio and Miami.",
    pricingNote: "Expect 2-3x pricing during Carnival week",
    multiplier: 2.5,
    conciergeMessage: "I'd like to experience Carnival 2026 — please arrange VIP access in Rio or Miami (Feb 13-17)",
  },
  {
    id: "coachella-2026",
    name: "Coachella",
    city: "Los Angeles",
    category: "Music",
    startDate: "2026-04-10",
    endDate: "2026-04-19",
    description: "The desert's premier music and arts festival. Two weekends of world-class performances, exclusive brand activations, and celebrity parties across Palm Springs.",
    pricingNote: "Expect 2-3x pricing on villas and transport in the Palm Springs area",
    multiplier: 2.5,
    conciergeMessage: "I'd like VIP access to Coachella 2026 with luxury accommodation (Apr 10-19)",
  },
  {
    id: "f1-miami-2026",
    name: "Formula 1 Miami GP",
    city: "Miami",
    category: "Motorsport",
    startDate: "2026-05-02",
    endDate: "2026-05-04",
    description: "Formula 1 takes over Miami. Paddock Club access, yacht viewing parties, and the hottest after-race celebrations in the city.",
    pricingNote: "Expect 3x pricing during F1 Miami weekend",
    multiplier: 3.0,
    conciergeMessage: "I'd like Paddock Club access for the Miami Grand Prix (May 2-4, 2026)",
  },
  {
    id: "met-gala-2026",
    name: "Met Gala",
    city: "New York",
    category: "Fashion",
    startDate: "2026-05-04",
    endDate: "2026-05-04",
    description: "Fashion's biggest night at the Metropolitan Museum of Art. Exclusive after-parties, designer pop-ups, and the ultimate people-watching experience in Manhattan.",
    pricingNote: "Premium pricing for NYC nightlife and dining during Met Gala week",
    multiplier: 2.0,
    conciergeMessage: "I'd like to attend Met Gala after-parties and events in NYC (May 4, 2026)",
  },
  {
    id: "cannes-2026",
    name: "Cannes Film Festival",
    city: "Cannes",
    category: "Film/Culture",
    startDate: "2026-05-12",
    endDate: "2026-05-23",
    description: "The world's most prestigious film festival. Red carpet premieres, exclusive yacht parties, and legendary Croisette nightlife. The Riviera at its most glamorous.",
    pricingNote: "Expect 3x pricing across the Côte d'Azur during the festival",
    multiplier: 3.0,
    conciergeMessage: "I'd like VIP access to the Cannes Film Festival with yacht parties (May 12-23, 2026)",
  },
  {
    id: "f1-monaco-2026",
    name: "Monaco F1 Grand Prix",
    city: "Monaco",
    category: "Motorsport",
    startDate: "2026-05-22",
    endDate: "2026-05-25",
    description: "The crown jewel of Formula 1. Watch cars race through the streets of Monte Carlo from a superyacht, penthouse terrace, or exclusive hospitality suite.",
    pricingNote: "Expect 3-5x pricing — Monaco's most in-demand weekend of the year",
    multiplier: 4.0,
    conciergeMessage: "I'd like yacht or terrace access for the Monaco Grand Prix (May 22-25, 2026)",
  },
  {
    id: "ibiza-opening-2026",
    name: "Ibiza Opening Parties",
    city: "Ibiza",
    category: "Nightlife",
    startDate: "2026-05-15",
    endDate: "2026-06-30",
    description: "The White Isle comes alive. Legendary clubs like Pacha, Amnesia, and Ushuaïa launch their seasons with world-class DJs and unforgettable opening night parties.",
    pricingNote: "Expect 2x pricing during opening weeks, especially for villa rentals",
    multiplier: 2.0,
    conciergeMessage: "I'd like VIP table reservations for Ibiza opening parties (May-Jun 2026)",
  },
  {
    id: "mykonos-opening-2026",
    name: "Mykonos Season Opening",
    city: "Mykonos",
    category: "Nightlife",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    description: "The Greek island paradise opens for the season. Beach clubs, sunset cocktails at Scorpios, and the legendary Mykonos nightlife scene kicks off.",
    pricingNote: "Expect 2x pricing as the island wakes up for summer",
    multiplier: 2.0,
    conciergeMessage: "I'd like to experience Mykonos opening season with villa and VIP access (Jun 2026)",
  },
  {
    id: "burning-man-2026",
    name: "Burning Man",
    city: "Nevada",
    category: "Festival",
    startDate: "2026-08-30",
    endDate: "2026-09-07",
    description: "Art, community, and radical self-expression in the Black Rock Desert. Luxury camps, art installations, and the legendary Temple Burn.",
    pricingNote: "Luxury camp packages start at premium rates; nearby Reno hotels surge 3x",
    multiplier: 3.0,
    conciergeMessage: "I'd like luxury camp access for Burning Man 2026 (Aug 30 - Sep 7)",
  },
  {
    id: "voiles-st-tropez-2026",
    name: "Les Voiles de St. Tropez",
    city: "St. Tropez",
    category: "Sailing",
    startDate: "2026-09-26",
    endDate: "2026-10-04",
    description: "The Mediterranean's most prestigious sailing regatta. Classic and modern yachts race in the bay while the harbor buzzes with nautical elegance and champagne.",
    pricingNote: "Expect 2x pricing on harbor-view dining and yacht charters",
    multiplier: 2.0,
    conciergeMessage: "I'd like yacht charter and VIP access for Les Voiles de St. Tropez (Sep 26 - Oct 4, 2026)",
  },
  {
    id: "art-basel-miami-2026",
    name: "Art Basel Miami",
    city: "Miami",
    category: "Art",
    startDate: "2026-12-04",
    endDate: "2026-12-08",
    description: "The Western Hemisphere's premier art fair. Gallery exhibitions, exclusive collector previews, Design Miami, and the best parties of the winter season.",
    pricingNote: "Expect 2-3x pricing across Miami Beach during Art Basel week",
    multiplier: 2.5,
    conciergeMessage: "I'd like VIP preview access to Art Basel Miami with table reservations (Dec 4-8, 2026)",
  },
  {
    id: "dubai-shopping-2026",
    name: "Dubai Shopping Festival",
    city: "Dubai",
    category: "Shopping",
    startDate: "2026-12-15",
    endDate: "2027-01-29",
    description: "The Middle East's biggest retail event. Luxury brand exclusives, gold raffles, fireworks, and world-class entertainment across the city's mega-malls.",
    pricingNote: "Hotel rates increase 1.5-2x during DSF; book early for peak dates",
    multiplier: 1.8,
    conciergeMessage: "I'd like a luxury shopping itinerary for the Dubai Shopping Festival (Dec 2026 - Jan 2027)",
  },
  {
    id: "st-barths-nye-2026",
    name: "St. Barths NYE",
    city: "St. Barths",
    category: "Holiday",
    startDate: "2026-12-28",
    endDate: "2027-01-02",
    description: "The most exclusive New Year's celebration in the Caribbean. Megayachts fill Gustavia harbor, A-list parties at Nikki Beach, and fireworks over the bay.",
    pricingNote: "Expect 4-5x pricing — St. Barths' most expensive week of the year",
    multiplier: 5.0,
    conciergeMessage: "I'd like to arrange NYE in St. Barths with villa and yacht access (Dec 28 - Jan 2)",
  },
  {
    id: "nyc-nye-2026",
    name: "NYC New Year's Eve",
    city: "New York",
    category: "Holiday",
    startDate: "2026-12-31",
    endDate: "2026-12-31",
    description: "Ring in the New Year in the city that never sleeps. Rooftop galas, Times Square views from private suites, and the hottest parties in Manhattan.",
    pricingNote: "Expect 2-3x pricing on premium nightlife and hotel suites",
    multiplier: 2.5,
    conciergeMessage: "I'd like VIP New Year's Eve arrangements in NYC (Dec 31, 2026)",
  },
];

// Sort events by start date
export const EVENTS_BY_DATE = [...MAJOR_EVENTS].sort(
  (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
);

// Get upcoming events from a given date
export function getUpcomingEvents(fromDate: Date = new Date(), limit?: number): MajorEvent[] {
  const now = fromDate.getTime();
  const upcoming = EVENTS_BY_DATE.filter((e) => new Date(e.endDate).getTime() >= now);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

// Get events for a specific month/year
export function getEventsForMonth(year: number, month: number): MajorEvent[] {
  return EVENTS_BY_DATE.filter((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });
}

// Get events that overlap a specific date
export function getEventsForDate(date: Date): MajorEvent[] {
  const d = date.toISOString().split("T")[0];
  return EVENTS_BY_DATE.filter((e) => d >= e.startDate && d <= e.endDate);
}

// Get all months that have events (for calendar scroller)
export function getEventMonths(): { year: number; month: number }[] {
  const months = new Set<string>();
  for (const e of EVENTS_BY_DATE) {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
      months.add(`${cur.getFullYear()}-${cur.getMonth()}`);
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return Array.from(months)
    .map((m) => {
      const [y, mo] = m.split("-").map(Number);
      return { year: y, month: mo };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

// Format date range nicely
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const sameDay = startDate === endDate;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();

  const monthFmt = (d: Date) => d.toLocaleString("en-US", { month: "short" });
  const dayFmt = (d: Date) => d.getDate();

  if (sameDay) return `${monthFmt(start)} ${dayFmt(start)}, ${start.getFullYear()}`;
  if (sameMonth) return `${monthFmt(start)} ${dayFmt(start)}-${dayFmt(end)}, ${start.getFullYear()}`;
  if (sameYear) return `${monthFmt(start)} ${dayFmt(start)} - ${monthFmt(end)} ${dayFmt(end)}, ${start.getFullYear()}`;
  return `${monthFmt(start)} ${dayFmt(start)}, ${start.getFullYear()} - ${monthFmt(end)} ${dayFmt(end)}, ${end.getFullYear()}`;
}
