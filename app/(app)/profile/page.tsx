"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, ChevronRight, CreditCard, Bell, Shield, HelpCircle,
  LogOut, User, Pencil, Gift, Users, Sparkles,
} from "lucide-react";
import { signOut, getUser, fetchBookings, fetchFavorites, fetchUserPreferences } from "@/lib/supabase";

const MENU = [
  { icon: CreditCard, label: "Payment Methods", route: "" },
  { icon: Bell, label: "Notifications", route: "/notifications" },
  { icon: Shield, label: "Privacy & Security", route: "" },
  { icon: HelpCircle, label: "Help & Support", route: "" },
  { icon: Pencil, label: "Edit Profile", route: "/profile/edit" },
  { icon: Gift, label: "Referrals", route: "/referrals" },
];

const ALL_PREF_FIELDS = ["cities", "vibes", "music", "dining", "travel", "budget", "occasions"] as const;

function calcCompleteness(prefs: any): number {
  if (!prefs) return 0;
  let filled = 0;
  if (prefs.cities?.length) filled++;
  if (prefs.vibes?.length) filled++;
  if (prefs.music?.length) filled++;
  if (prefs.dining?.length) filled++;
  if (prefs.travel?.length) filled++;
  if (prefs.budget) filled++;
  if (prefs.occasions?.birthday_month || prefs.occasions?.anniversary_month) filled++;
  return Math.round((filled / ALL_PREF_FIELDS.length) * 100);
}

function CompletenessRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg width={72} height={72} className="-rotate-90">
        <circle cx={36} cy={36} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-white/10" />
        <circle
          cx={36} cy={36} r={r} fill="none"
          stroke="url(#accentGrad)" strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <defs>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E54D2E" />
            <stop offset="100%" stopColor="#F06A4D" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-white">{percent}%</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;
  const [stats, setStats] = useState({ bookings: 0, saved: 0 });
  const [prefs, setPrefs] = useState<any>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchBookings(user.id).then((d: any[]) => d?.length || 0).catch(() => 0),
      fetchFavorites(user.id).then((d: any[]) => d?.length || 0).catch(() => 0),
    ]).then(([b, s]) => setStats({ bookings: b, saved: s }));

    fetchUserPreferences(user.id)
      .then((p) => { setPrefs(p); setPrefsLoaded(true); })
      .catch(() => setPrefsLoaded(true));
  }, []);

  const completeness = calcCompleteness(prefs);
  const hasPrefs = prefs && completeness > 0;

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-bold text-parties-text">Profile</h1>
        <button className="p-2 text-parties-muted">
          <Settings size={22} />
        </button>
      </div>

      {/* User card */}
      <div className="bg-parties-bg rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-parties-accent/20 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-parties-accent to-orange-400 flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Guest"}
            </h3>
            <p className="text-sm text-white/50">{user?.email || "Not signed in"}</p>
          </div>
        </div>
        <div className="relative flex gap-6 mt-5 pt-4 border-t border-white/10">
          <div>
            <p className="text-xl font-bold text-white">{stats.bookings}</p>
            <p className="text-[10px] text-white/40 uppercase">Bookings</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats.saved}</p>
            <p className="text-[10px] text-white/40 uppercase">Saved</p>
          </div>
          <div>
            <p className="text-xl font-bold text-parties-accent">Member</p>
            <p className="text-[10px] text-white/40 uppercase">Status</p>
          </div>
        </div>
      </div>

      {/* My Preferences / Taste Profile */}
      {prefsLoaded && (
        <div className="bg-parties-bg rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-parties-accent/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-parties-accent" />
                <h3 className="text-base font-semibold text-white">My Taste Profile</h3>
              </div>
              <CompletenessRing percent={completeness} />
            </div>

            {hasPrefs ? (
              <div className="space-y-3">
                {prefs.cities?.length > 0 && (
                  <PrefRow label="Cities" items={prefs.cities} />
                )}
                {prefs.vibes?.length > 0 && (
                  <PrefRow label="Vibes" items={prefs.vibes} />
                )}
                {prefs.music?.length > 0 && (
                  <PrefRow label="Music" items={prefs.music} />
                )}
                {prefs.dining?.length > 0 && (
                  <PrefRow label="Dining" items={prefs.dining} />
                )}
                {prefs.travel?.length > 0 && (
                  <PrefRow label="Travel" items={prefs.travel} />
                )}
                {prefs.budget && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Budget</p>
                    <span className="inline-block text-xs font-medium text-parties-accent bg-parties-accent/15 px-2.5 py-1 rounded-full">
                      {prefs.budget}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-white/50 mb-1">Tell us what you love</p>
                <p className="text-xs text-white/30">Build your taste profile so we can personalize your experience with venues, dining, and travel that match your style.</p>
              </div>
            )}

            <button
              onClick={() => router.push("/profile/preferences")}
              className="mt-4 w-full py-3 bg-parties-accent/15 text-parties-accent text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Sparkles size={14} />
              {hasPrefs ? "Edit Preferences" : "Build Your Taste Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="space-y-1">
        {MENU.map((m) => (
          <button
            key={m.label}
            onClick={() => m.route && router.push(m.route)}
            className="w-full flex items-center gap-3.5 py-3.5 text-left"
          >
            <m.icon size={20} className="text-parties-muted" />
            <span className="flex-1 text-sm font-medium text-parties-text">{m.label}</span>
            <ChevronRight size={16} className="text-parties-muted" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="w-full flex items-center gap-3.5 py-3.5 mt-4 text-left"
      >
        <LogOut size={20} className="text-red-500" />
        <span className="text-sm font-medium text-red-500">Sign Out</span>
      </button>

      <p className="mt-8 text-center text-xs text-parties-muted pb-8">Parties v1.0.0</p>
    </div>
  );
}

function PrefRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs font-medium text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
