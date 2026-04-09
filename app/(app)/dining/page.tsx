"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import { fetchRestaurants } from "@/lib/supabase";

const CUISINES = ["All", "Italian", "Japanese", "Steakhouse", "Seafood", "Mexican", "Mediterranean"];
const TIMES = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"];

export default function DiningPage() {
  const router = useRouter();
  const [cuisine, setCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const d = await fetchRestaurants(); setRestaurants(Array.isArray(d) ? d : []); }
    catch { setRestaurants([]); } finally { setLoading(false); }
  }

  const filtered = cuisine === "All" ? restaurants : restaurants.filter((r) => r.cuisine?.toLowerCase().includes(cuisine.toLowerCase()));

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Dining</h1>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        {CUISINES.map((c) => (
          <button key={c} onClick={() => setCuisine(c)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${cuisine === c ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>{c}</button>
        ))}
      </div>
      {loading ? <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[180px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="text-center py-20"><p className="text-parties-muted">No restaurants found</p></div>
        : <div className="space-y-4 pb-8">{filtered.map((r) => (
          <div key={r.id} className="rounded-2xl overflow-hidden border border-black/[0.06]">
            <div className="relative h-[160px] bg-parties-soft">
              {r.img_url && <img src={r.img_url} alt={r.name} className="w-full h-full object-cover" />}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-parties-text">{r.cuisine || "Fine Dining"}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div><h3 className="text-base font-semibold text-parties-text">{r.name}</h3>
                  <p className="text-sm text-parties-secondary mt-0.5 flex items-center gap-1"><MapPin size={12} />{r.city || r.metro}</p></div>
                <div className="text-right">
                  {r.rating && <div className="flex items-center gap-1 text-sm font-semibold text-parties-text"><Star size={14} className="text-parties-accent fill-parties-accent" />{r.rating}</div>}
                  <p className="text-xs text-parties-muted mt-0.5">{r.price_range || "$$$$"}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {TIMES.map((t) => (<button key={t} onClick={() => setSelected({ ...r, time: t })} className="shrink-0 text-xs font-medium text-parties-accent bg-parties-accent/10 px-2.5 py-1.5 rounded-full">{t}</button>))}
              </div>
            </div>
          </div>))}</div>}

      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-6" />
            <h3 className="font-display text-2xl text-parties-text mb-1">{selected.name}</h3>
            <p className="text-sm text-parties-secondary mb-4 flex items-center gap-2"><Clock size={14} />{selected.time}</p>
            <button onClick={() => { setSelected(null); router.push("/bookings"); }} className="w-full py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform">Reserve Table</button>
          </div>
        </div>)}
    </div>
  );
}
