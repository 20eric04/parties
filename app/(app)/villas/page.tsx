"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MapPin, BedDouble, Bath, Users, X, ChevronDown } from "lucide-react";
import { fetchVillas } from "@/lib/supabase";

const LOCATIONS = ["All", "Miami", "Ibiza", "Mykonos", "St. Tropez", "Tulum", "Bali", "Aspen", "Dubai"];
const GUEST_OPTIONS = [0, 4, 8, 12, 20];
const PRICE_RANGES = [
  { label: "All", min: 0, max: Infinity },
  { label: "$1k–$3k", min: 1000, max: 3000 },
  { label: "$3k–$7k", min: 3000, max: 7000 },
  { label: "$7k–$15k", min: 7000, max: 15000 },
  { label: "$15k+", min: 15000, max: Infinity },
];
const FEATURE_PILLS = ["Pool", "Ocean View", "Chef", "Helipad", "Private Beach", "Gym", "Cinema", "Wine Cellar"];

export default function VillasPage() {
  const router = useRouter();
  const [location, setLocation] = useState("All");
  const [guestMin, setGuestMin] = useState(0);
  const [priceIdx, setPriceIdx] = useState(0);
  const [villas, setVillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [locOpen, setLocOpen] = useState(false);

  useEffect(() => { load(); }, [location]);

  async function load() {
    setLoading(true);
    try {
      const city = location === "All" ? undefined : location;
      const d = await fetchVillas(city);
      setVillas(Array.isArray(d) ? d : []);
    } catch { setVillas([]); } finally { setLoading(false); }
  }

  const priceRange = PRICE_RANGES[priceIdx];
  const filtered = villas.filter((v) => {
    if (guestMin > 0 && (v.max_guests || 0) < guestMin) return false;
    const price = v.price_per_night || 0;
    if (price < priceRange.min || price > priceRange.max) return false;
    return true;
  });

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Villas</h1>
      </div>

      {/* Location dropdown */}
      <div className="relative mb-4">
        <button onClick={() => setLocOpen(!locOpen)} className="flex items-center justify-between w-full bg-parties-soft rounded-xl px-4 py-3 text-sm text-parties-text">
          <span className="flex items-center gap-2"><MapPin size={14} className="text-parties-muted" />{location === "All" ? "All Locations" : location}</span>
          <ChevronDown size={16} className={`text-parties-muted transition-transform ${locOpen ? "rotate-180" : ""}`} />
        </button>
        {locOpen && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-black/[0.06] rounded-xl shadow-lg overflow-hidden">
            {LOCATIONS.map((l) => (
              <button key={l} onClick={() => { setLocation(l); setLocOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${location === l ? "bg-parties-accent text-white" : "text-parties-text hover:bg-parties-soft"}`}>{l === "All" ? "All Locations" : l}</button>
            ))}
          </div>
        )}
      </div>

      {/* Guest capacity filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {GUEST_OPTIONS.map((g) => (
          <button key={g} onClick={() => setGuestMin(g)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${guestMin === g ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>
            {g === 0 ? "Any guests" : <span className="flex items-center gap-1"><Users size={12} />{g}+</span>}
          </button>
        ))}
      </div>

      {/* Price range filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {PRICE_RANGES.map((p, i) => (
          <button key={p.label} onClick={() => setPriceIdx(i)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${priceIdx === i ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Villa cards */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[280px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏝️</p>
          <p className="text-parties-muted text-base">No villas match your filters</p>
          <button onClick={() => { setLocation("All"); setGuestMin(0); setPriceIdx(0); }} className="mt-4 text-sm text-parties-accent font-semibold">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {filtered.map((v) => (
            <div key={v.id}>
              <button onClick={() => setExpanded(expanded === v.id ? null : v.id)} className="w-full text-left rounded-2xl overflow-hidden border border-black/[0.06] active:scale-[0.99] transition-transform">
                <div className="relative h-[200px] bg-parties-soft">
                  {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
                  {v.rating && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} className="text-parties-accent fill-parties-accent" />
                      <span className="text-xs font-semibold">{v.rating}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-parties-text">{v.name}</h3>
                      <p className="text-sm text-parties-secondary mt-0.5 flex items-center gap-1"><MapPin size={12} />{v.location || v.city}</p>
                    </div>
                    <p className="text-xl font-bold text-parties-text">${v.price_per_night?.toLocaleString()}<span className="text-sm font-normal text-parties-muted">/night</span></p>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-parties-secondary">
                    <span className="flex items-center gap-1"><BedDouble size={14} />{v.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath size={14} />{v.bathrooms} bath</span>
                    <span className="flex items-center gap-1"><Users size={14} />{v.max_guests} guests</span>
                  </div>
                  {v.features && v.features.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(Array.isArray(v.features) ? v.features : []).map((f: string) => (
                        <span key={f} className="text-[10px] font-medium text-parties-secondary bg-parties-soft px-2 py-1 rounded-full">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded detail modal */}
              {expanded === v.id && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setExpanded(null)}>
                  <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="relative h-[240px] bg-parties-soft">
                      {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
                      <button onClick={() => setExpanded(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><X size={16} className="text-white" /></button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="font-display text-2xl font-semibold text-parties-text">{v.name}</h2>
                        {v.rating && <div className="flex items-center gap-1 text-sm font-semibold"><Star size={14} className="text-parties-accent fill-parties-accent" />{v.rating}</div>}
                      </div>
                      <p className="text-sm text-parties-secondary flex items-center gap-1 mb-4"><MapPin size={12} />{v.location || v.city}</p>
                      <div className="flex gap-6 mb-4 text-sm text-parties-text">
                        <span className="flex items-center gap-1.5"><BedDouble size={16} />{v.bedrooms} Bedrooms</span>
                        <span className="flex items-center gap-1.5"><Bath size={16} />{v.bathrooms} Bathrooms</span>
                        <span className="flex items-center gap-1.5"><Users size={16} />{v.max_guests} Guests</span>
                      </div>
                      {v.description && <p className="text-sm text-parties-secondary leading-relaxed mb-4">{v.description}</p>}
                      {v.features && v.features.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs text-parties-muted uppercase tracking-wider mb-2">Features</p>
                          <div className="flex gap-2 flex-wrap">
                            {(Array.isArray(v.features) ? v.features : []).map((f: string) => (
                              <span key={f} className="text-xs font-medium text-parties-accent bg-parties-accent/10 px-3 py-1.5 rounded-full">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {v.gallery_images && v.gallery_images.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs text-parties-muted uppercase tracking-wider mb-2">Gallery</p>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {v.gallery_images.map((img: string, i: number) => (
                              <img key={i} src={img} alt={`${v.name} ${i + 1}`} className="shrink-0 w-32 h-24 rounded-xl object-cover" />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
                        <p className="text-2xl font-bold text-parties-text">${v.price_per_night?.toLocaleString()}<span className="text-sm font-normal text-parties-muted">/night</span></p>
                        <button onClick={() => router.push("/bookings")} className="px-6 py-3 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Book Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Custom Villa CTA */}
      <div className="pb-10">
        <button onClick={() => router.push("/concierge")} className="w-full bg-gradient-to-r from-parties-bg to-parties-surface rounded-2xl p-5 text-left active:scale-[0.99] transition-transform">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Can't find what you need?</p>
          <h3 className="font-display text-xl text-white mb-1">Request Custom Villa</h3>
          <p className="text-sm text-white/60">Our concierge will find the perfect private villa for your group</p>
        </button>
      </div>
    </div>
  );
}
