"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, Users, Copy } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setBooking({
      venue_name: "Your Venue",
      date: new Date().toISOString(),
      guests: 2,
      booking_code: sessionId.slice(-8).toUpperCase(),
    });
  }, [sessionId]);

  const code = booking?.booking_code || sessionId?.slice(-8).toUpperCase() || "PARTY001";

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh bg-parties-bg flex flex-col items-center justify-center px-5 py-12">
      <div className="mb-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>
      </div>

      <div className="text-center mb-8 animate-slide-up">
        <h1 className="font-display text-2xl font-semibold text-white mb-2">Booking Confirmed</h1>
        <p className="text-sm text-white/50">Your reservation is all set</p>
      </div>

      <div className="w-full max-w-sm bg-parties-card rounded-2xl p-5 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-base font-semibold text-white mb-4">{booking?.venue_name || "Your Venue"}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-parties-surface flex items-center justify-center"><Calendar size={18} className="text-parties-accent" /></div>
            <div><p className="text-xs text-white/40">Date</p><p className="text-sm text-white">{booking?.date ? new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Pending"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-parties-surface flex items-center justify-center"><Clock size={18} className="text-parties-accent" /></div>
            <div><p className="text-xs text-white/40">Time</p><p className="text-sm text-white">{booking?.date ? new Date(booking.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Pending"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-parties-surface flex items-center justify-center"><Users size={18} className="text-parties-accent" /></div>
            <div><p className="text-xs text-white/40">Guests</p><p className="text-sm text-white">{booking?.guests || 2} guests</p></div>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Booking Code</p>
          <div className="flex items-center justify-between bg-parties-surface rounded-xl px-4 py-3">
            <span className="font-mono text-lg font-bold text-parties-accent tracking-wider">{code}</span>
            <button onClick={copyCode} className="p-1.5 text-white/40"><Copy size={18} /></button>
          </div>
          {copied && <p className="text-xs text-emerald-400 mt-1.5 text-center">Copied to clipboard</p>}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <button onClick={() => router.push("/bookings")} className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl">View Bookings</button>
        <button onClick={() => router.push("/explore")} className="w-full py-3.5 bg-parties-surface text-white/70 text-sm font-semibold rounded-xl">Back to Explore</button>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-parties-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-parties-accent/30 border-t-parties-accent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
