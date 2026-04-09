"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MapPin, Wifi, Waves, Utensils, Dumbbell } from "lucide-react";
import { fetchHotels } from "@/lib/supabase";

const STARS = [0, 3, 4, 5];
const AMENITY_ICONS: Record<string, any> = { "Pool": Waves, "Spa": Waves, "WiFi": Wifi, "Restaurant": Utensils, "Gym": Dumbbell, "Beach": Waves };

export default function HotelsPage() {
  const router = useRouter();
  const [starFilter, setStarFilter] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [starFilter]);
  async function load() {
    setLoading(true);
    try {
      const s = starFilter || undefined;
      const d = await fetchHotels(undefined, s);
      setHotels(Array.isArray(d) ? d : []);
    } catch { setHotels([]); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Hotels</h1>
      </div>
      <div className="flex gap-2 mb-6">
        {STARS.map((s) => (
          <button key={s} onClick={() => setStarFilter(s)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${starFilter === s ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>
            {s === 0 ? "All" : <span className="flex items-center gap-1">{s}<Star size={12} /></span>}
          </button>
        ))}
      </div>
      {loading ? <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[220px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
        : hotels.length === 0 ? <div className="text-center py-20"><p className="text-parties-muted">No hotels found</p></div>
        : <div className="space-y-4 pb-8">{hotels.map((h) => (
          <div key={h.id} className="rounded-2xl overflow-hidden border border-black/[0.06]">
            <div className="relative h-[180px] bg-parties-soft">
              {h.img_url && <img src={h.img_url} alt={h.name} className="w-full h-full object-cover" />}
              {h.stars && <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-0.5">
                {Array.from({ length: h.stars }).map((_, i) => <Star key={i} size={10} className="text-parties-accent fill-parties-accent" />)}
              </div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div><h3 className="text-base font-semibold text-parties-text">{h.name}</h3>
                  <p className="text-sm text-parties-secondary mt-0.5 flex items-center gap-1"><MapPin size={12} />{h.city || h.metro}</p></div>
                {h.rating && <div className="flex items-center gap-1 text-sm font-semibold"><Star size={14} className="text-parties-accent fill-parties-accent" />{h.rating}</div>}
              </div>
              {h.amenities && <div className="flex gap-2 mt-3 flex-wrap">
                {(typeof h.amenities === "string" ? h.amenities.split(",") : Array.isArray(h.amenities) ? h.amenities : []).map((a: string) => {
                  const name = a.trim();
                  return <span key={name} className="text-[10px] font-medium text-parties-secondary bg-parties-soft px-2 py-1 rounded-full">{name}</span>;
                })}
              </div>}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xl font-bold text-parties-text">${h.price_per_night || h.price}<span className="text-sm font-normal text-parties-muted">/night</span></p>
                <button onClick={() => router.push("/bookings")} className="px-5 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Book</button>
              </div>
            </div>
          </div>))}</div>}
    </div>
  );
}
