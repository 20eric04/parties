"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Plane, Clock, Users, MapPin, ChevronRight } from "lucide-react";
import { fetchFleetVehicles, fetchJetListings, fetchHelicopterRoutes } from "@/lib/supabase";

type Category = "All" | "Cars" | "Jets" | "Helicopters";

const CATEGORIES: { key: Category; label: string; icon: typeof Car; desc: string }[] = [
  { key: "Cars", label: "Luxury Cars", icon: Car, desc: "Chauffeur & self-drive" },
  { key: "Jets", label: "Private Jets", icon: Plane, desc: "Charter flights worldwide" },
  { key: "Helicopters", label: "Helicopters", icon: Plane, desc: "Riviera transfers" },
];

const POPULAR_ROUTES = [
  { origin: "Nice", dest: "Monaco", time: 7, price: 2800 },
  { origin: "Nice", dest: "St. Tropez", time: 20, price: 5400 },
  { origin: "Nice", dest: "Cannes", time: 10, price: 3200 },
  { origin: "Monaco", dest: "St. Tropez", time: 15, price: 4600 },
];

export default function TransportPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("All");
  const [cars, setCars] = useState<any[]>([]);
  const [jets, setJets] = useState<any[]>([]);
  const [heliRoutes, setHeliRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [c, j, h] = await Promise.all([
        fetchFleetVehicles().catch(() => []),
        fetchJetListings().catch(() => []),
        fetchHelicopterRoutes().catch(() => []),
      ]);
      setCars(Array.isArray(c) ? c : []);
      setJets(Array.isArray(j) ? j : []);
      setHeliRoutes(Array.isArray(h) ? h : []);
    } catch {
      setCars([]); setJets([]); setHeliRoutes([]);
    } finally { setLoading(false); }
  }

  const displayCars = cars.slice(0, category === "Cars" ? undefined : 3);
  const displayJets = jets.slice(0, category === "Jets" ? undefined : 3);
  const displayHeli = heliRoutes.length > 0 ? heliRoutes : POPULAR_ROUTES.map((r, i) => ({
    id: `fallback-${i}`,
    origin_city: r.origin,
    destination_city: r.dest,
    flight_time_minutes: r.time,
    price: r.price,
    aircraft_type: "Airbus H135",
    capacity: 4,
    operator: "Monacair",
  }));

  const showCars = category === "All" || category === "Cars";
  const showJets = category === "All" || category === "Jets";
  const showHeli = category === "All" || category === "Helicopters";

  return (
    <div className="min-h-dvh bg-white pt-14 px-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/explore")} className="p-1 text-parties-muted"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Transport</h1>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-parties-bg via-parties-surface to-parties-bg rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-parties-accent/10 rounded-full blur-3xl" />
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Luxury Mobility</p>
        <h2 className="font-display text-2xl text-white mb-1">Your Journey, Elevated</h2>
        <p className="text-sm text-white/50">Cars, jets & helicopter transfers on demand</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        {(["All", ...CATEGORIES.map((c) => c.key)] as Category[]).map((key) => (
          <button key={key} onClick={() => setCategory(key)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === key ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>
            {key}
          </button>
        ))}
      </div>

      {/* Category Cards — shown when "All" */}
      {category === "All" && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.key} onClick={() => setCategory(c.key)} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-black/[0.06] active:scale-[0.97] transition-transform">
                <div className="w-11 h-11 rounded-xl bg-parties-accent/10 flex items-center justify-center">
                  <Icon size={20} className="text-parties-accent" />
                </div>
                <p className="text-xs font-semibold text-parties-text text-center">{c.label}</p>
                <p className="text-[10px] text-parties-muted text-center leading-tight">{c.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-[160px] bg-parties-soft rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8 pb-8">
          {/* CARS SECTION */}
          {showCars && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-parties-text">Luxury Cars</h2>
                {category === "All" && (
                  <button onClick={() => router.push("/cars")} className="flex items-center gap-1 text-xs font-medium text-parties-accent">
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {displayCars.length === 0 ? (
                <div className="text-center py-10 bg-parties-soft rounded-2xl"><p className="text-parties-muted text-sm">No vehicles available</p></div>
              ) : (
                <div className="space-y-3">
                  {displayCars.map((v) => (
                    <div key={v.id} className="rounded-2xl overflow-hidden border border-black/[0.06]">
                      <div className="relative h-[160px] bg-parties-soft">
                        {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-parties-text">{v.vehicle_type || "Luxury"}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-parties-text">{v.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-parties-secondary">
                          {v.seats && <span className="flex items-center gap-1"><Users size={12} />{v.seats} seats</span>}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-bold text-parties-text">${v.price_per_day}<span className="text-sm font-normal text-parties-muted">/day</span></p>
                          <button onClick={() => router.push("/bookings")} className="px-4 py-2 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Book</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* JETS SECTION */}
          {showJets && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-parties-text">Private Jets</h2>
                {category === "All" && (
                  <button onClick={() => router.push("/jets")} className="flex items-center gap-1 text-xs font-medium text-parties-accent">
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {displayJets.length === 0 ? (
                <div className="text-center py-10 bg-parties-soft rounded-2xl"><p className="text-parties-muted text-sm">No jets available</p></div>
              ) : (
                <div className="space-y-3">
                  {displayJets.map((j) => (
                    <div key={j.id} className="rounded-2xl border border-black/[0.06] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-parties-soft flex items-center justify-center"><Plane size={22} className="text-parties-accent" /></div>
                        <div>
                          <h3 className="text-base font-semibold text-parties-text">{j.aircraft_type || "Private Jet"}</h3>
                          <p className="text-xs text-parties-muted">{j.operator || "Charter"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-parties-soft rounded-xl p-4 mb-4">
                        <div className="text-center"><p className="text-sm font-semibold text-parties-text">{j.origin_city || "TBD"}</p><p className="text-[10px] text-parties-muted">FROM</p></div>
                        <div className="flex-1 flex items-center justify-center gap-2 px-4"><div className="flex-1 h-px bg-parties-muted/30" /><Plane size={14} className="text-parties-accent" /><div className="flex-1 h-px bg-parties-muted/30" /></div>
                        <div className="text-center"><p className="text-sm font-semibold text-parties-text">{j.destination_city || "TBD"}</p><p className="text-[10px] text-parties-muted">TO</p></div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-parties-secondary mb-4">
                        {j.capacity && <span className="flex items-center gap-1"><Users size={12} />{j.capacity} pax</span>}
                        {j.flight_time && <span className="flex items-center gap-1"><Clock size={12} />{j.flight_time}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-parties-text">${j.price_per_hour?.toLocaleString()}<span className="text-sm font-normal text-parties-muted">/hr</span></p>
                        <button className="px-4 py-2 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Request Quote</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* HELICOPTERS SECTION */}
          {showHeli && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-parties-text">Helicopter Transfers</h2>
              </div>

              {/* Aspirational banner */}
              <div className="bg-gradient-to-br from-parties-bg to-parties-surface rounded-2xl p-5 mb-4 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-parties-accent/15 rounded-full blur-2xl" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1.5">Riviera Collection</p>
                <h3 className="font-display text-lg text-white mb-1">Skip the traffic. Arrive in minutes.</h3>
                <p className="text-xs text-white/40 leading-relaxed">Private helicopter transfers between the French Riviera&apos;s most iconic destinations</p>
              </div>

              <div className="space-y-3">
                {(category === "Helicopters" ? displayHeli : displayHeli.slice(0, 4)).map((h, idx) => (
                  <div key={h.id || idx} className="rounded-2xl border border-black/[0.06] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-parties-accent/10 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-parties-accent">
                          <path d="M12 3v3m0 0l6-2m-6 2l-6-2" />
                          <path d="M4 14h16" />
                          <ellipse cx="12" cy="14" rx="3" ry="2" />
                          <path d="M9 14l-3 4h2" />
                          <path d="M15 14l3 4h-2" />
                          <path d="M12 6v6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-parties-text">{h.aircraft_type || "Airbus H135"}</h3>
                        <p className="text-xs text-parties-muted">{h.operator || "Monacair"}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-parties-secondary">
                        <Users size={12} />
                        <span>{h.capacity || 4} pax</span>
                      </div>
                    </div>

                    {/* Route display */}
                    <div className="flex items-center justify-between bg-parties-soft rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-parties-text">{h.origin_city}</p>
                        <p className="text-[10px] text-parties-muted">FROM</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1 px-4">
                        <div className="flex items-center w-full gap-2">
                          <div className="flex-1 h-px bg-parties-muted/30" />
                          <div className="w-6 h-6 rounded-full bg-parties-accent/10 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-parties-accent">
                              <path d="M12 3v3m0 0l6-2m-6 2l-6-2" />
                              <path d="M12 6v6" />
                              <ellipse cx="12" cy="14" rx="3" ry="2" />
                            </svg>
                          </div>
                          <div className="flex-1 h-px bg-parties-muted/30" />
                        </div>
                        <span className="text-[10px] font-medium text-parties-accent">{h.flight_time_minutes} min</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-parties-text">{h.destination_city}</p>
                        <p className="text-[10px] text-parties-muted">TO</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-parties-text">
                          {"\u20AC"}{typeof h.price === "number" ? h.price.toLocaleString() : h.price}
                          <span className="text-sm font-normal text-parties-muted">/transfer</span>
                        </p>
                      </div>
                      <button onClick={() => router.push("/bookings")} className="px-4 py-2 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform">Reserve</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Request Custom Route CTA */}
              <button onClick={() => router.push("/concierge")} className="w-full mt-4 py-4 rounded-2xl border border-dashed border-parties-accent/30 flex flex-col items-center gap-1.5 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-parties-accent" />
                  <span className="text-sm font-semibold text-parties-accent">Request Custom Route</span>
                </div>
                <span className="text-[11px] text-parties-muted">Any destination on the Riviera</span>
              </button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
