"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Fuel, Users } from "lucide-react";
import { fetchFleetVehicles } from "@/lib/supabase";

const TYPES = ["All", "Sedan", "SUV", "Sports", "Convertible", "Van"];

export default function CarsPage() {
  const router = useRouter();
  const [type, setType] = useState("All");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const d = await fetchFleetVehicles(); setVehicles(Array.isArray(d) ? d : []); }
    catch { setVehicles([]); } finally { setLoading(false); }
  }

  const filtered = type === "All" ? vehicles : vehicles.filter((v) => v.vehicle_type?.toLowerCase() === type.toLowerCase());

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Cars</h1>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${type === t ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>{t}</button>
        ))}
      </div>
      {loading ? <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[200px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="text-center py-20"><p className="text-parties-muted">No vehicles available</p></div>
        : <div className="space-y-4 pb-8">{filtered.map((v) => (
          <div key={v.id} className="rounded-2xl overflow-hidden border border-black/[0.06]">
            <div className="relative h-[180px] bg-parties-soft">
              {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-parties-text">{v.vehicle_type || "Luxury"}</span>
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-parties-text">{v.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-parties-secondary">
                {v.seats && <span className="flex items-center gap-1"><Users size={12} />{v.seats} seats</span>}
                {v.fuel_type && <span className="flex items-center gap-1"><Fuel size={12} />{v.fuel_type}</span>}
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-xl font-bold text-parties-text">${v.price_per_day}<span className="text-sm font-normal text-parties-muted">/day</span></p>
                <button onClick={() => router.push("/bookings")} className="px-5 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Book</button>
              </div>
            </div>
          </div>))}</div>}
    </div>
  );
}
