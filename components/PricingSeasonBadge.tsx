"use client";
import { getCurrentSeason, getSeasonDisplay, isSeasonalCity } from "@/lib/pricing-seasons";
import type { SeasonTier } from "@/lib/pricing-seasons";

interface Props {
  city: string;
  /** "compact" for venue cards, "detail" for venue detail pages */
  variant?: "compact" | "detail";
  className?: string;
}

const TIER_ICONS: Record<SeasonTier, string> = {
  peak: "\u{1F525}",
  high: "\u2197\uFE0F",
  shoulder: "\u{1F324}\uFE0F",
  low: "\u2728",
};

export default function PricingSeasonBadge({ city, variant = "compact", className = "" }: Props) {
  if (!isSeasonalCity(city)) return null;

  const season = getCurrentSeason(city);
  if (!season) return null;

  const display = getSeasonDisplay(season.tier);

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border backdrop-blur-sm ${display.bgColor} ${display.color} ${display.borderColor} ${className}`}
      >
        <span>{TIER_ICONS[season.tier]}</span>
        {season.tier === "low" ? "Best Value" : display.badge}
      </span>
    );
  }

  // Detail variant — richer display for venue detail pages
  return (
    <div className={`rounded-xl border ${display.borderColor} ${display.bgColor} p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{TIER_ICONS[season.tier]}</span>
        <span className={`text-sm font-semibold ${display.color}`}>
          {display.badge}
          {season.multiplier > 1 && (
            <span className="ml-1.5 opacity-70">{season.multiplier}x pricing</span>
          )}
        </span>
      </div>
      <p className="text-xs text-parties-secondary leading-relaxed">
        {season.activeEvent ? season.activeEvent.description : display.description}
      </p>
      {season.activeEvent && season.tier === "peak" && (
        <p className="text-[10px] text-parties-muted mt-2 uppercase tracking-wider font-medium">
          {season.activeEvent.name} &mdash; Limited availability
        </p>
      )}
    </div>
  );
}
