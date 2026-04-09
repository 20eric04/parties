"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, MapPin, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { globalSearch } from "@/lib/supabase";

const RECENT_KEY = "parties_recent_searches";

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function saveRecent(term: string) {
  const prev = getRecent().filter((t) => t !== term);
  const next = [term, ...prev].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
}

interface SearchResults {
  venues: any[];
  restaurants: any[];
  events: any[];
  hotels: any[];
}

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setRecent(getRecent());
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const r = await globalSearch(q);
      setResults(r);
      saveRecent(q);
      setRecent(getRecent());
    } catch {
      setResults({ venues: [], restaurants: [], events: [], hotels: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(val: string) {
    setTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  function handleRecent(t: string) {
    setTerm(t);
    doSearch(t);
  }

  function handleClearRecent() {
    clearRecent();
    setRecent([]);
  }

  const categories = results
    ? [
        { label: "Venues", items: results.venues, route: (v: any) => `/venue/${v.id}` },
        { label: "Restaurants", items: results.restaurants, route: (v: any) => `/restaurant/${v.id}` },
        { label: "Events", items: results.events, route: (v: any) => `/events/${v.id}` },
        { label: "Hotels", items: results.hotels, route: (v: any) => `/hotel/${v.id}` },
      ].filter((c) => c.items.length > 0)
    : [];

  const hasResults = categories.length > 0;
  const searched = results !== null;

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Search input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parties-muted" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search venues, restaurants, events..."
          className="w-full bg-parties-soft rounded-xl py-3.5 pl-10 pr-10 text-sm text-parties-text placeholder:text-parties-muted outline-none"
        />
        {term && (
          <button
            onClick={() => { setTerm(""); setResults(null); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-parties-muted"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Recent searches */}
      {!searched && recent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-parties-text">Recent Searches</h2>
            <button onClick={handleClearRecent} className="text-xs text-parties-accent font-medium">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => handleRecent(r)}
                className="flex items-center gap-1.5 px-3 py-2 bg-parties-soft rounded-full text-xs text-parties-secondary"
              >
                <Clock size={12} />
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searched && recent.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Search size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">Search across all categories</h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px]">
            Find venues, restaurants, events, and hotels in one place.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-[100px] bg-parties-soft rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* No results */}
      {searched && !loading && !hasResults && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-parties-muted">No results for &ldquo;{term}&rdquo;</p>
        </div>
      )}

      {/* Results grouped by category */}
      {!loading && hasResults && (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h2 className="text-sm font-semibold text-parties-text mb-3">{cat.label}</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
                {cat.items.map((item: any) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(cat.route(item))}
                    className="shrink-0 w-[200px] rounded-2xl overflow-hidden border border-black/[0.06] text-left"
                  >
                    <div className="h-[120px] bg-parties-soft">
                      {item.img_url && (
                        <img src={item.img_url} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-parties-text line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-parties-secondary">
                        <MapPin size={11} />
                        <span className="truncate">{item.city || item.venue_name || ""}</span>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-parties-text">
                          <Star size={11} className="text-parties-accent fill-parties-accent" />
                          {item.rating}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
                <button
                  onClick={() => {}}
                  className="shrink-0 w-10 flex items-center justify-center text-parties-muted"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
