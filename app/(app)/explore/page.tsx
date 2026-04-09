"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Flame, Heart, Plane, ChevronRight, Zap, Calendar, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { fetchVenues, fetchRestaurants, getUser, fetchUserPreferences } from "@/lib/supabase";
import CitySwitcher from "@/components/CitySwitcher";
import PricingSeasonBadge from "@/components/PricingSeasonBadge";
import { getUpcomingEvents, formatDateRange, CATEGORY_COLORS } from "@/lib/event-calendar";

const VERTS = ["Tables", "Dining", "Transport", "Hotels", "Villas"];
const TIMES = ["10PM", "10:30", "11PM", "11:30", "12AM"];

function getRecommended(venues: any[], prefs: any): any[] {
  if (!prefs || !venues.length) return [];
  const prefCities = (prefs.cities || []).map((c: string) => c.toLowerCase());
  const prefVibes = (prefs.vibes || []).map((v: string) => v.toLowerCase());

  const scored = venues.map((v) => {
    let score = 0;
    const city = (v.city || "").toLowerCase();
    const vibe = (v.vibe || v.category || "").toLowerCase();
    const tags = ((v.tags || []) as string[]).map((t: string) => t.toLowerCase());

    if (prefCities.some((c: string) => city.includes(c))) score += 3;
    if (prefVibes.some((pv: string) => vibe.includes(pv) || tags.some((t) => t.includes(pv)))) score += 2;
    if (v.hot) score += 1;
    if (v.rating && v.rating >= 4.5) score += 1;
    return { ...v, _score: score };
  });

  return scored
    .filter((v) => v._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);
}

export default function ExplorePage() {
  const router = useRouter();
  const [metro, setMetro] = useState("All");
  const [tab, setTab] = useState("Tables");
  const [venues, setVenues] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cityOpen, setCityOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [prefs, setPrefs] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    const user = getUser();
    if (user) {
      fetchUserPreferences(user.id).then((p) => setPrefs(p)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (venues.length && prefs) {
      setRecommended(getRecommended(venues, prefs));
    }
  }, [venues, prefs]);

  useEffect(() => {
    if (tab === "Dining") { router.push("/dining"); return; }
    if (tab === "Transport") { router.push("/transport"); return; }
    if (tab === "Hotels") { router.push("/hotels"); return; }
    if (tab === "Villas") { router.push("/villas"); return; }
    load();
  }, [metro, tab]);

  async function load() {
    setLoading(true);
    try {
      const m = metro === "All" ? undefined : metro;
      const d = await fetchVenues(m);
      setVenues(Array.isArray(d) ? d : []);
    } catch { setVenues([]); } finally { setLoading(false); }
  }

  const filtered = search ? venues.filter((v) => v.name?.toLowerCase().includes(search.toLowerCase())) : venues;
  const toggleSave = (id: number) => setSavedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Explore</h1>
        <button onClick={() => setCityOpen(true)} className="flex items-center gap-1.5 text-sm text-parties-secondary"><MapPin size={14} />{metro === "All" ? "All cities" : metro}</button>
      </div>
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parties-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search venues, restaurants..." className="w-full bg-parties-soft rounded-xl py-3 pl-10 pr-4 text-sm text-parties-text placeholder:text-parties-muted outline-none" />
      </div>
      <div className="flex gap-1 mb-6">
        {VERTS.map((v) => (<button key={v} onClick={() => setTab(v)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === v ? "bg-parties-accent text-white" : "text-parties-muted"}`}>{v}</button>))}
      </div>
      <div className="bg-gradient-to-r from-parties-bg to-parties-surface rounded-2xl p-5 mb-6">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">This weekend</p>
        <h3 className="font-display text-xl text-white mb-1">Miami Music Week</h3>
        <p className="text-sm text-white/60">Exclusive tables at top venues</p>
      </div>
      {/* Tonight Banner */}
      <button onClick={() => router.push("/tonight")} className="w-full relative overflow-hidden bg-gradient-to-r from-parties-accent to-[#C53D1B] rounded-2xl p-5 mb-6 text-left flex items-center gap-4 active:scale-[0.98] transition-transform">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Zap size={22} className="text-white" />
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg text-white font-semibold">Tonight</h3>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <p className="text-xs text-white/70 mt-0.5">Last-minute tables, deals &amp; events</p>
        </div>
        <ChevronRight size={18} className="text-white/60 shrink-0 relative" />
      </button>
      <button onClick={() => router.push("/trips")} className="w-full bg-gradient-to-r from-parties-accent/20 to-parties-accent/5 border border-parties-accent/30 rounded-2xl p-5 mb-6 text-left flex items-center gap-4 active:scale-[0.99] transition-transform">
        <div className="w-11 h-11 rounded-full bg-parties-accent/15 flex items-center justify-center shrink-0">
          <Plane size={20} className="text-parties-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-white">Plan a Trip</h3>
          <p className="text-xs text-white/50 mt-0.5">Get a curated itinerary from your concierge</p>
        </div>
        <ChevronRight size={18} className="text-white/30 shrink-0" />
      </button>
      <button onClick={() => router.push("/guides")} className="w-full bg-gradient-to-r from-purple-500/15 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5 mb-6 text-left flex items-center gap-4 active:scale-[0.99] transition-transform">
        <div className="w-11 h-11 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-white">Hit Lists</h3>
          <p className="text-xs text-white/50 mt-0.5">Curated city guides for every destination</p>
        </div>
        <ChevronRight size={18} className="text-white/30 shrink-0" />
      </button>
      {/* What's Coming Up */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-parties-text">What's Coming Up</h2>
          <button onClick={() => router.push("/events")} className="flex items-center gap-1 text-xs font-semibold text-parties-accent">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {getUpcomingEvents(new Date(), 3).map((ev) => {
            const colors = CATEGORY_COLORS[ev.category];
            const start = new Date(ev.startDate + "T00:00:00");
            const monthStr = start.toLocaleString("en-US", { month: "short" }).toUpperCase();
            const dayStr = start.getDate();
            return (
              <button
                key={ev.id}
                onClick={() => router.push("/events")}
                className="shrink-0 w-[220px] bg-gradient-to-br from-parties-bg to-parties-surface rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/10 rounded-lg px-2.5 py-1.5 text-center">
                    <p className="text-[9px] font-bold text-parties-accent leading-none">{monthStr}</p>
                    <p className="text-base font-bold text-white leading-none">{dayStr}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {ev.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-1">{ev.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-white/40" />
                  <span className="text-[11px] text-white/50">{ev.city}</span>
                </div>
                <p className="text-[10px] text-white/30 mt-2">{formatDateRange(ev.startDate, ev.endDate)}</p>
              </button>
            );
          })}
        </div>
      </div>
      {/* Recommended for You */}
      {recommended.length > 0 && !search && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-parties-accent" />
            <h2 className="text-lg font-semibold text-parties-text">Recommended for You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
            {recommended.map((v) => (
              <button
                key={`rec-${v.id}`}
                onClick={() => router.push(`/venue/${v.id}`)}
                className="shrink-0 w-[180px] rounded-2xl overflow-hidden bg-gradient-to-br from-parties-bg to-parties-surface text-left active:scale-[0.98] transition-transform"
              >
                <div className="relative h-[120px] bg-parties-surface">
                  {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-parties-bg/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-sm font-semibold text-white truncate">{v.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={9} className="text-white/40" />
                      <span className="text-[10px] text-white/50">{v.city}</span>
                      {v.rating && (
                        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-parties-accent font-semibold">
                          <Star size={9} className="fill-parties-accent" />{v.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {loading ? <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-[200px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
      : filtered.length === 0 ? <div className="text-center py-20"><p className="text-parties-muted">No venues found</p></div>
      : <div className="space-y-4 pb-8">{filtered.map((v) => (
          <button key={v.id} onClick={() => router.push(`/venue/${v.id}`)} className="w-full text-left rounded-2xl overflow-hidden border border-black/[0.06] active:scale-[0.99] transition-transform">
            <div className="relative h-[180px] bg-parties-soft">
              {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
              {v.hot && <span className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full"><Flame size={10} /> HOT</span>}
              {v.city && <PricingSeasonBadge city={v.city} variant="compact" className={`absolute ${v.hot ? "top-10" : "top-3"} left-3`} />}
              <button onClick={(e) => { e.stopPropagation(); toggleSave(v.id); }} className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center">
                <Heart size={16} className={savedIds.has(v.id) ? "text-red-500 fill-red-500" : "text-white"} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div><h3 className="text-base font-semibold text-parties-text">{v.name}</h3><p className="text-sm text-parties-secondary mt-0.5">{v.city}</p></div>
                {v.rating && <div className="flex items-center gap-1 text-sm font-semibold text-parties-text"><Star size={14} className="text-parties-accent fill-parties-accent" />{v.rating}</div>}
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {TIMES.map((t) => (<span key={t} className="shrink-0 text-xs font-medium text-parties-accent bg-parties-accent/10 px-2.5 py-1 rounded-full">{t}</span>))}
              </div>
            </div>
          </button>))}</div>}
      <CitySwitcher open={cityOpen} onClose={() => setCityOpen(false)} activeCity={metro} onSelect={setMetro} />
    </div>
  );
}
