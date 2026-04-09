"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchBookings, getUser } from "@/lib/supabase";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function BookingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) { setLoading(false); return; }
    fetchBookings(user.id)
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.booking_date) >= now);
  const past = bookings.filter((b) => new Date(b.booking_date) < now);
  const displayed = tab === "upcoming" ? upcoming : past;

  const statusColor: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-parties-soft text-parties-secondary",
  };

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      <h1 className="text-[26px] font-bold text-parties-text mb-2">Bookings</h1>
      <p className="text-sm text-parties-secondary mb-5">Your upcoming and past reservations.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-parties-soft rounded-xl p-1 mb-6">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors capitalize ${
              tab === t ? "bg-white text-parties-text shadow-sm" : "text-parties-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[120px] bg-parties-soft rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Calendar size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">
            {tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
          </h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px]">
            {tab === "upcoming"
              ? "When you book a table, car, or experience, it will show up here."
              : "Your completed bookings will appear here."}
          </p>
          {tab === "upcoming" && (
            <button
              onClick={() => router.push("/explore")}
              className="mt-6 px-6 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl"
            >
              Browse venues
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((b) => {
            const venue = b.venues;
            const status = b.status || "confirmed";
            return (
              <motion.div
                key={b.id}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl border border-black/[0.06] overflow-hidden"
              >
                <div className="flex">
                  <div className="w-[100px] shrink-0 bg-parties-soft">
                    {venue?.img_url && (
                      <img src={venue.img_url} alt={venue.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 p-3.5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-parties-text line-clamp-1">
                        {venue?.name || "Venue"}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          statusColor[status] || statusColor.confirmed
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-parties-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(b.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(b.booking_date)}
                      </span>
                    </div>
                    {b.guests && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-parties-muted">
                        <Users size={12} />
                        {b.guests} guests
                      </div>
                    )}
                    {b.booking_code && (
                      <p className="mt-1.5 text-[10px] text-parties-muted font-mono">
                        Code: {b.booking_code}
                      </p>
                    )}
                  </div>
                </div>
                {tab === "past" && (
                  <div className="border-t border-black/[0.06] px-3.5 py-2.5">
                    <button className="flex items-center gap-1 text-xs font-semibold text-parties-accent">
                      <Star size={12} />
                      Leave Review
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
