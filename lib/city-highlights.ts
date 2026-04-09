// Hardcoded venue highlights for city landing pages
// These are curated picks shown on the explore page when a city is selected

export type VenueCategory = "Club" | "Restaurant" | "Hotel" | "Beach Club";
export type PriceRange = "$$$" | "$$$$" | "$$$$$";

export interface CityVenueHighlight {
  name: string;
  category: VenueCategory;
  priceRange: PriceRange;
  description: string;
}

export interface CityHighlightConfig {
  city: string;
  tagline: string;
  venues: CityVenueHighlight[];
}

export const CITY_HIGHLIGHTS: CityHighlightConfig[] = [
  {
    city: "London",
    tagline: "Where tradition meets late-night indulgence",
    venues: [
      {
        name: "Annabel's",
        category: "Club",
        priceRange: "$$$$$",
        description: "Legendary Mayfair members' club with opulent interiors and world-class entertainment.",
      },
      {
        name: "Chiltern Firehouse",
        category: "Restaurant",
        priceRange: "$$$$",
        description: "A-list hotspot in a converted fire station with inventive seasonal cuisine.",
      },
      {
        name: "LPM",
        category: "Restaurant",
        priceRange: "$$$$",
        description: "French-Mediterranean dining with a Riviera-inspired terrace in Mayfair.",
      },
      {
        name: "Novikov",
        category: "Restaurant",
        priceRange: "$$$$$",
        description: "Dual-concept Russian-owned destination serving Asian and Italian under one roof.",
      },
      {
        name: "Sketch",
        category: "Restaurant",
        priceRange: "$$$$",
        description: "Art-meets-gastronomy landmark with immersive themed rooms and afternoon tea.",
      },
      {
        name: "The Arts Club",
        category: "Club",
        priceRange: "$$$$$",
        description: "Prestigious private club on Dover Street with fine dining and late-night bar.",
      },
      {
        name: "Sexy Fish",
        category: "Restaurant",
        priceRange: "$$$$",
        description: "Asian-inspired seafood and cocktails in a Damien Hirst-adorned Berkeley Square space.",
      },
      {
        name: "Hakkasan",
        category: "Restaurant",
        priceRange: "$$$$$",
        description: "Michelin-starred modern Cantonese dining with moody interiors and DJ sets.",
      },
    ],
  },
  {
    city: "Dubai",
    tagline: "Desert glamour and skyline spectacle",
    venues: [
      {
        name: "WHITE Beach",
        category: "Beach Club",
        priceRange: "$$$$",
        description: "Chic beachfront club at Atlantis with poolside cabanas and sunset DJ sessions.",
      },
      {
        name: "Nammos",
        category: "Beach Club",
        priceRange: "$$$$$",
        description: "Mykonos-born beach club bringing Mediterranean energy to the Four Seasons shoreline.",
      },
      {
        name: "Zuma",
        category: "Restaurant",
        priceRange: "$$$$$",
        description: "Izakaya-style Japanese dining in DIFC — a power-lunch and late-night staple.",
      },
      {
        name: "Nobu",
        category: "Restaurant",
        priceRange: "$$$$$",
        description: "Iconic Japanese-Peruvian cuisine with panoramic views at Atlantis The Royal.",
      },
      {
        name: "Atlantis Royal",
        category: "Hotel",
        priceRange: "$$$$$",
        description: "Ultra-luxury resort redefining Dubai's skyline with celebrity chef restaurants and rooftop pools.",
      },
      {
        name: "FIVE Palm",
        category: "Hotel",
        priceRange: "$$$$",
        description: "Party-forward resort on Palm Jumeirah with beach clubs, rooftop bars, and resident DJs.",
      },
      {
        name: "Soho Garden",
        category: "Club",
        priceRange: "$$$$",
        description: "Multi-venue entertainment complex with top-tier international DJ bookings.",
      },
      {
        name: "Blue Marlin",
        category: "Beach Club",
        priceRange: "$$$$",
        description: "Ibiza-rooted beach club in Ghantoot with day-to-night parties and global headliners.",
      },
    ],
  },
  {
    city: "Ibiza",
    tagline: "The undisputed capital of electronic music",
    venues: [
      {
        name: "Pacha",
        category: "Club",
        priceRange: "$$$$",
        description: "The island's iconic cherry-branded superclub with legendary residencies since 1973.",
      },
      {
        name: "Amnesia",
        category: "Club",
        priceRange: "$$$$",
        description: "Dual-room mega-club famous for sunrise sets and underground techno nights.",
      },
      {
        name: "Ushua\u00EFa",
        category: "Club",
        priceRange: "$$$$$",
        description: "Open-air hotel and club hosting daytime pool parties with world-class production.",
      },
      {
        name: "DC-10",
        category: "Club",
        priceRange: "$$$",
        description: "Raw, no-frills airport-adjacent club beloved for Circoloco and authentic underground energy.",
      },
      {
        name: "Blue Marlin",
        category: "Beach Club",
        priceRange: "$$$$$",
        description: "Premier Cala Jondal beach club with bottle-service daybed culture and Balearic beats.",
      },
      {
        name: "Lio",
        category: "Restaurant",
        priceRange: "$$$$$",
        description: "Cabaret-dining concept by Pacha Group blending fine cuisine with live performance art.",
      },
      {
        name: "Heart Ibiza",
        category: "Club",
        priceRange: "$$$$$",
        description: "Cirque du Soleil and Adri\u00E0 brothers collaboration fusing gastronomy, art, and music.",
      },
      {
        name: "Cala Bonita",
        category: "Restaurant",
        priceRange: "$$$$",
        description: "Hidden cove restaurant on the north coast with fresh seafood and turquoise water views.",
      },
    ],
  },
];

export function getCityHighlights(city: string): CityHighlightConfig | null {
  return CITY_HIGHLIGHTS.find((c) => c.city === city) || null;
}

export function hasCityHighlights(city: string): boolean {
  return CITY_HIGHLIGHTS.some((c) => c.city === city);
}
