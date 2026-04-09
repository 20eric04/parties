"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plane, Users, Clock } from "lucide-react";
import { fetchJetListings } from "@/lib/supabase";

const ORIGINS = ["All", "Miami", "NYC", "Las Vegas", "Los Angeles", "London"];

export default function JetsPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState("All");
  const [jets, setJets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [origin]);
  async function load() {
    setLoading(true);
    try {
      const o = origin === "All" ? undefined : origin;
      const d = await fetchJetListings(o);
      setJets(Array.isArray(d) ? d : []);
    } catch { setJets([]); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Private Jets</h1>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        {ORIGINS.map((o) => (
          <button key={o} onClick={() => setOrigin(o)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${origin === o ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>{o}</button>
        ))}
      </div>
      {loading ? <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[160px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
        : jets.length === 0 ? <div className="text-center py-20"><p className="text-parties-muted">No jets available</p></div>
        : <div className="space-y-4 pb-8">{jets.map((j) => (
          <div key={j.id} className="rounded-2xl border border-black/[0.06] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-parties-soft flex items-center justify-center"><Plane size={22} className="text-parties-accent" /></div>
              <div><h3 className="text-base font-semibold text-parties-text">{j.aircraft_type || "Private Jet"}</h3>
                <p className="text-xs text-parties-muted">{j.operator || "Charter"}</p></div>
            </div>
            <div className="flex items-center justify-between bg-parties-soft rounded-xl p-4 mb-4">
              <div className="text-center"><p className="text-sm font-semibold text-parties-text">{j.origin_city || "Miami"}</p><p className="text-[10px] text-parties-muted">FROM</p></div>
              <div className="flex-1 flex items-center justify-center gap-2 px-4"><div className="flex-1 h-px bg-parties-muted/30" /><Plane size={14} className="text-parties-accent" /><div className="flex-1 h-px bg-parties-muted/30" /></div>
              <div className="text-center"><p className="text-sm font-semibold text-parties-text">{j.destination_city || "Ibiza"}</p><p className="text-[10px] text-parties-muted">TO</p></div>
            </div>
            <div className="flex items-center gap-4 text-xs text-parties-secondary mb-4">
              {j.capacity && <span className="flex items-center gap-1"><Users size={12} />{j.capacity} passengers</span>}
              {j.flight_time && <span className="flex items-center gap-1"><Clock size={12} />{j.flight_time}</span>}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-parties-text">${j.price_per_hour?.toLocaleString()}<span className="text-sm font-normal text-parties-muted">/hr</span></p>
              <button className="px-5 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Request Quote</button>
            </div>
          </div>))}</div>}
    </div>
  );
}
