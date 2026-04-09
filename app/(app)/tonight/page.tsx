"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Flame,
  Zap,
  Users,
  UtensilsCrossed,
  Music,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { fetchTonightDeals, fetchTonightEvents, fetchRestaurants, sendConciergeMessage, getSession } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

function getCity(): string {
  if (typeof window === "undefined") return "Miami";
  return localStorage.getItem("parties_city") || "Miami";
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function TonightPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [city, setCity] = useState("Miami");
  const [deals, setDeals] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [sendingList, setSendingList] = useState<string | null>(null);

  useEffect(() => {
    setCity(getCity());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    Promise.all([
      fetchTonightDeals(city).catch(() => []),
      fetchTonightEvents(city).catch(() => []),
      fetchRestaurants(city).catch(() => []),
    ])
      .then(([d, e, r]) => {
        setDeals(Array.isArray(d) ? d : []);
        setEvents(Array.isArray(e) ? e : []);
        setRestaurants(Array.isArray(r) ? r.slice(0, 6) : []);
      })
      .finally(() => setLoading(false));
  }, [city]);

  const handleGetOnList = useCallback(
    async (eventName: string, venueName: string) => {
      const key = `${eventName}-${venueName}`;
      setSendingList(key);
      try {
        const s = getSession();
        if (s?.access_token) {
          await sendConciergeMessage(
            s.access_token,
            `I'd like to get on the guest list for "${eventName}" at ${venueName} tonight.`,
            "tonight_guestlist"
          );
        }
        router.push("/concierge");
      } catch {
        router.push("/concierge");
      } finally {
        setSendingList(null);
      }
    },
    [router]
  );

  const handleReserve = useCallback(
    (restaurantName: string) => {
      const s = getSession();
      if (s?.access_token) {
        sendConciergeMessage(
          s.access_token,
          `I'd like a reservation at ${restaurantName} tonight.`,
          "tonight_reservation"
        ).catch(() => {});
      }
      router.push("/concierge");
    },
    [router]
  );

  const hasContent = deals.length > 0 || events.length > 0 || restaurants.length > 0;

  return (
    <div className="min-h-dvh bg-parties-bg pt-14 px-5 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-parties-accent animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-parties-accent">
            Live Now
          </span>
        </div>
        <h1 className="font-display text-[32px] font-semibold text-white leading-tight">
          Tonight in {city}
        </h1>
        <p className="text-sm text-white/50 mt-1">{formatToday()}</p>
      </motion.div>

      {/* Countdown Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gradient-to-r from-parties-accent/20 to-parties-accent/5 border border-parties-accent/30 rounded-2xl p-4 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-parties-accent" />
            <span className="text-sm font-semibold text-white">Deals expire in</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span className="bg-parties-accent/20 text-parties-accent text-lg font-bold px-2.5 py-1 rounded-lg min-w-[44px] text-center">
              {String(countdown.hours).padStart(2, "0")}
            </span>
            <span className="text-parties-accent font-bold">:</span>
            <span className="bg-parties-accent/20 text-parties-accent text-lg font-bold px-2.5 py-1 rounded-lg min-w-[44px] text-center">
              {String(countdown.minutes).padStart(2, "0")}
            </span>
            <span className="text-parties-accent font-bold">:</span>
            <span className="bg-parties-accent/20 text-parties-accent text-lg font-bold px-2.5 py-1 rounded-lg min-w-[44px] text-center">
              {String(countdown.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] bg-parties-surface rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : !hasContent ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-full bg-parties-surface flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No deals tonight in {city}
          </h3>
          <p className="text-sm text-white/50 mb-6">
            Check back tomorrow or ask your concierge
          </p>
          <button
            onClick={() => router.push("/concierge")}
            className="inline-flex items-center gap-2 bg-parties-accent text-white text-sm font-semibold px-6 py-3 rounded-xl active:scale-[0.97] transition-transform"
          >
            Ask Concierge
            <ChevronRight size={16} />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Section 1 — Last Minute Tables */}
          {deals.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-parties-accent" />
                <h2 className="text-lg font-semibold text-white">Last Minute Tables</h2>
              </div>
              <div className="space-y-4">
                {deals.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                    className="bg-parties-surface border border-white/[0.06] rounded-2xl overflow-hidden"
                  >
                    {deal.img_url && (
                      <div className="relative h-[140px]">
                        <img
                          src={deal.img_url}
                          alt={deal.venue_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-parties-surface to-transparent" />
                        <span className="absolute top-3 left-3 flex items-center gap-1 bg-parties-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <Flame size={10} /> LIMITED
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-white">{deal.venue_name}</h3>
                      {deal.description && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">{deal.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        {deal.original_price != null && (
                          <span className="text-sm text-white/40 line-through">
                            ${Number(deal.original_price).toLocaleString()}
                          </span>
                        )}
                        {deal.deal_price != null && (
                          <span className="text-lg font-bold text-parties-accent">
                            ${Number(deal.deal_price).toLocaleString()}
                          </span>
                        )}
                        {deal.max_guests && (
                          <span className="flex items-center gap-1 text-xs text-white/40">
                            <Users size={12} />
                            Up to {deal.max_guests}
                          </span>
                        )}
                      </div>
                      {deal.available_times?.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                          {deal.available_times.map((t: string) => (
                            <span
                              key={t}
                              className="shrink-0 text-xs font-medium text-parties-accent bg-parties-accent/10 px-2.5 py-1 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (deal.venue_id) router.push(`/venue/${deal.venue_id}`);
                          else router.push("/concierge");
                        }}
                        className="w-full mt-4 bg-parties-accent text-white text-sm font-semibold py-3 rounded-xl active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
                      >
                        <Zap size={14} />
                        Book Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Section 2 — What's Happening */}
          {events.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Music size={18} className="text-parties-accent" />
                <h2 className="text-lg font-semibold text-white">What&apos;s Happening</h2>
              </div>
              <div className="space-y-4">
                {events.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    className="bg-parties-surface border border-white/[0.06] rounded-2xl overflow-hidden flex"
                  >
                    <div className="relative w-[110px] shrink-0">
                      {ev.img_url ? (
                        <img
                          src={ev.img_url}
                          alt={ev.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-parties-card flex items-center justify-center">
                          <Music size={24} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3.5 flex flex-col justify-between min-h-[120px]">
                      <div>
                        <h3 className="text-sm font-semibold text-white line-clamp-1">
                          {ev.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                          <MapPin size={12} />
                          <span className="truncate">{ev.venue_name}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          {ev.event_date && (
                            <span className="flex items-center gap-1 text-xs text-white/40">
                              <Clock size={12} />
                              {new Date(ev.event_date).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {ev.performer && (
                            <span className="text-xs text-parties-accent font-medium">
                              {ev.performer}
                            </span>
                          )}
                          {ev.dress_code && (
                            <span className="text-[10px] text-white/30 uppercase tracking-wide">
                              {ev.dress_code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() =>
                            handleGetOnList(ev.name, ev.venue_name || "the venue")
                          }
                          disabled={sendingList === `${ev.name}-${ev.venue_name}`}
                          className="px-3 py-1.5 bg-parties-accent text-white text-xs font-semibold rounded-lg flex items-center gap-1 active:scale-[0.95] transition-transform disabled:opacity-50"
                        >
                          <Sparkles size={12} />
                          Get on the List
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Section 3 — Open Reservations */}
          {restaurants.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed size={18} className="text-parties-accent" />
                <h2 className="text-lg font-semibold text-white">Open Reservations</h2>
              </div>
              <div className="space-y-3">
                {restaurants.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
                    className="bg-parties-surface border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-parties-card">
                      {r.img_url ? (
                        <img
                          src={r.img_url}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed size={20} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{r.name}</h3>
                      {r.cuisine && (
                        <p className="text-xs text-white/40 mt-0.5">{r.cuisine}</p>
                      )}
                      {r.rating && (
                        <p className="text-xs text-parties-accent mt-0.5">
                          {"★".repeat(Math.round(r.rating))} {r.rating}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleReserve(r.name)}
                      className="shrink-0 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg active:scale-[0.95] transition-transform"
                    >
                      Reserve
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
}
