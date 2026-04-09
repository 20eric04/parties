"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";
import { getUser, fetchUserPreferences, updateUserPreferences } from "@/lib/supabase";

const VIBE_OPTIONS = ["Exclusive", "High-Energy", "Intimate", "Lounge", "Rooftop", "Beach Club", "Underground"];
const MUSIC_OPTIONS = ["House", "Hip-Hop", "Techno", "Latin", "Pop", "R&B", "Live DJ", "Live Band"];
const DINING_OPTIONS = ["Fine Dining", "Casual Luxury", "Street Food", "Michelin Star", "Omakase", "Steakhouse", "Seafood"];
const TRAVEL_OPTIONS = ["Boutique Hotel", "Grand Palace", "Private Villa", "Yacht", "Glamping"];
const CITY_OPTIONS = ["Miami", "New York", "Los Angeles", "Las Vegas", "Ibiza", "London", "Dubai", "Tulum", "Mykonos", "Paris", "Tokyo", "Barcelona"];
const BUDGET_OPTIONS = ["$$ Moderate", "$$$ Upscale", "$$$$ Premium", "$$$$$ No Limit"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface Preferences {
  cities: string[];
  vibes: string[];
  music: string[];
  dining: string[];
  travel: string[];
  budget: string;
  occasions: { birthday_month: string; anniversary_month: string };
}

const EMPTY_PREFS: Preferences = {
  cities: [],
  vibes: [],
  music: [],
  dining: [],
  travel: [],
  budget: "",
  occasions: { birthday_month: "", anniversary_month: "" },
};

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(EMPTY_PREFS);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { key: "cities", title: "Your Cities", subtitle: "Where do you like to go out?", emoji: "\u{1F30D}" },
    { key: "vibes", title: "Your Vibes", subtitle: "What energy are you drawn to?", emoji: "\u{2728}" },
    { key: "music", title: "Your Sound", subtitle: "What gets you moving?", emoji: "\u{1F3B5}" },
    { key: "dining", title: "Your Palate", subtitle: "How do you like to eat?", emoji: "\u{1F37D}\u{FE0F}" },
    { key: "travel", title: "Your Style", subtitle: "Where do you like to stay?", emoji: "\u{1F3E8}" },
    { key: "budget", title: "Your Range", subtitle: "What feels comfortable?", emoji: "\u{1F4B3}" },
    { key: "occasions", title: "Special Dates", subtitle: "So we can celebrate with you", emoji: "\u{1F389}" },
  ];

  useEffect(() => {
    const user = getUser();
    if (!user) { setLoading(false); return; }
    fetchUserPreferences(user.id)
      .then((p) => {
        if (p) setPrefs({ ...EMPTY_PREFS, ...p, occasions: { ...EMPTY_PREFS.occasions, ...p.occasions } });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleChip(field: "cities" | "vibes" | "music" | "dining" | "travel", value: string) {
    setPrefs((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }

  async function handleSave() {
    const user = getUser();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserPreferences(user.id, prefs);
      setSaved(true);
      setTimeout(() => { setSaved(false); router.push("/profile"); }, 1200);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  const completedSections = [
    prefs.cities.length > 0,
    prefs.vibes.length > 0,
    prefs.music.length > 0,
    prefs.dining.length > 0,
    prefs.travel.length > 0,
    !!prefs.budget,
    !!(prefs.occasions.birthday_month || prefs.occasions.anniversary_month),
  ].filter(Boolean).length;

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} className="p-1 text-parties-text">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-parties-text">Taste Profile</h1>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="flex-1 h-1.5 bg-parties-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-parties-accent to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedSections / sections.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-parties-accent">{completedSections}/{sections.length}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-parties-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section navigation pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
            {sections.map((s, i) => {
              const completed = [
                prefs.cities.length > 0,
                prefs.vibes.length > 0,
                prefs.music.length > 0,
                prefs.dining.length > 0,
                prefs.travel.length > 0,
                !!prefs.budget,
                !!(prefs.occasions.birthday_month || prefs.occasions.anniversary_month),
              ][i];
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                    activeSection === i
                      ? "bg-parties-accent text-white"
                      : completed
                      ? "bg-parties-accent/10 text-parties-accent"
                      : "bg-parties-soft text-parties-muted"
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="hidden sm:inline">{s.title.replace("Your ", "")}</span>
                  {completed && activeSection !== i && <Check size={10} />}
                </button>
              );
            })}
          </div>

          {/* Active section */}
          <div className="bg-parties-bg rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-parties-accent/10 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-2xl mb-1">{sections[activeSection].emoji}</p>
              <h2 className="text-lg font-semibold text-white mb-0.5">{sections[activeSection].title}</h2>
              <p className="text-sm text-white/40 mb-5">{sections[activeSection].subtitle}</p>

              {activeSection === 0 && (
                <ChipGrid
                  options={CITY_OPTIONS}
                  selected={prefs.cities}
                  onToggle={(v) => toggleChip("cities", v)}
                />
              )}
              {activeSection === 1 && (
                <ChipGrid
                  options={VIBE_OPTIONS}
                  selected={prefs.vibes}
                  onToggle={(v) => toggleChip("vibes", v)}
                />
              )}
              {activeSection === 2 && (
                <ChipGrid
                  options={MUSIC_OPTIONS}
                  selected={prefs.music}
                  onToggle={(v) => toggleChip("music", v)}
                />
              )}
              {activeSection === 3 && (
                <ChipGrid
                  options={DINING_OPTIONS}
                  selected={prefs.dining}
                  onToggle={(v) => toggleChip("dining", v)}
                />
              )}
              {activeSection === 4 && (
                <ChipGrid
                  options={TRAVEL_OPTIONS}
                  selected={prefs.travel}
                  onToggle={(v) => toggleChip("travel", v)}
                />
              )}
              {activeSection === 5 && (
                <div className="space-y-2">
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setPrefs((prev) => ({ ...prev, budget: prev.budget === b ? "" : b }))}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                        prefs.budget === b
                          ? "bg-parties-accent text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
              {activeSection === 6 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Birthday Month
                    </label>
                    <select
                      value={prefs.occasions.birthday_month}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          occasions: { ...prev.occasions, birthday_month: e.target.value },
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-parties-accent/30 appearance-none"
                    >
                      <option value="" className="bg-parties-bg text-white/50">Select month...</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m} className="bg-parties-bg">{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Anniversary Month
                    </label>
                    <select
                      value={prefs.occasions.anniversary_month}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          occasions: { ...prev.occasions, anniversary_month: e.target.value },
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-parties-accent/30 appearance-none"
                    >
                      <option value="" className="bg-parties-bg text-white/50">Select month...</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m} className="bg-parties-bg">{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Next / Previous navigation */}
              <div className="flex gap-3 mt-6">
                {activeSection > 0 && (
                  <button
                    onClick={() => setActiveSection((p) => p - 1)}
                    className="flex-1 py-3 bg-white/5 text-white/60 text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Back
                  </button>
                )}
                {activeSection < sections.length - 1 ? (
                  <button
                    onClick={() => setActiveSection((p) => p + 1)}
                    className="flex-1 py-3 bg-parties-accent/15 text-parties-accent text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={16} />
                Saved!
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Save Taste Profile
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              active
                ? "bg-parties-accent text-white shadow-lg shadow-parties-accent/20"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {active && <span className="mr-1">&#10003;</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
