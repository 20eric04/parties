"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Check, Plane, MapPin, Calendar, Users, Plus, X } from "lucide-react";
import { submitTripRequest } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const POPULAR_DESTINATIONS = [
  "Miami", "Ibiza", "Mykonos", "St. Barths", "Tulum", "Cabo", "Dubai",
  "Monaco", "Amalfi Coast", "Maldives", "Bali", "Aspen", "St. Tropez",
  "Turks & Caicos", "Tokyo", "Marrakech",
];

const TRIP_TYPES = ["Nightlife", "Beach & Pool", "Fine Dining", "Cultural", "Adventure", "Wellness", "Mixed"];
const BUDGET_RANGES = ["$5K \u2014 $10K", "$10K \u2014 $25K", "$25K \u2014 $50K", "$50K \u2014 $100K", "$100K+"];
const ACCOMMODATIONS = ["Hotel", "Villa", "Yacht", "No Preference"];
const VIBES = ["Intimate", "Party", "Exclusive", "Relaxed", "High-Energy", "Romantic", "Group Fun"];
const OCCASIONS = ["Birthday", "Bachelor/Bachelorette", "Anniversary", "Corporate", "Just Because"];

type Step = "destination" | "details" | "preferences" | "review";

export default function TripsPage() {
  const router = useRouter();
  const { user, session } = useAuth();

  const [step, setStep] = useState<Step>("destination");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Destination
  const [destinations, setDestinations] = useState<string[]>([]);
  const [customDest, setCustomDest] = useState("");
  const [tripTypes, setTripTypes] = useState<string[]>([]);

  // Step 2 — Details
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [budget, setBudget] = useState("");
  const [accommodation, setAccommodation] = useState("");

  // Step 3 — Preferences
  const [vibes, setVibes] = useState<string[]>([]);
  const [specificRequests, setSpecificRequests] = useState("");
  const [occasion, setOccasion] = useState("");

  const steps: Step[] = ["destination", "details", "preferences", "review"];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ["Destination", "Details", "Preferences", "Review"];

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const addCustomDest = () => {
    const d = customDest.trim();
    if (d && !destinations.includes(d)) {
      setDestinations((p) => [...p, d]);
      setCustomDest("");
    }
  };

  const canProceed = () => {
    if (step === "destination") return destinations.length > 0 && tripTypes.length > 0;
    if (step === "details") return arrivalDate && departureDate && budget && accommodation;
    if (step === "preferences") return vibes.length > 0 && occasion;
    if (step === "review") return true;
    return false;
  };

  const back = () => {
    if (stepIndex > 0) setStep(steps[stepIndex - 1]);
    else router.back();
  };

  const next = async () => {
    setError("");
    if (step !== "review") {
      setStep(steps[stepIndex + 1]);
      return;
    }
    // Submit
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error("Please sign in to submit a trip request.");
      await submitTripRequest(token, {
        destinations,
        trip_types: tripTypes,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        group_size: groupSize,
        budget_range: budget,
        accommodation,
        vibes,
        specific_requests: specificRequests,
        occasion,
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Success state ----------
  if (submitted) {
    return (
      <div className="min-h-dvh bg-parties-bg text-white flex flex-col items-center justify-center px-6">
        <div className="animate-scale-in text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-parties-accent/15 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-parties-accent" />
          </div>
          <h1 className="font-display text-4xl italic text-white mb-3">Your Trip Request Has Been Submitted</h1>
          <div className="w-10 h-[2px] bg-parties-accent mx-auto rounded-full mb-6" />
          <p className="text-base text-white/60 leading-relaxed mb-10">
            Your concierge will reach out within <span className="text-white/80 font-medium">24 hours</span> with a curated itinerary.
          </p>
          <button onClick={() => router.push("/explore")} className="w-full py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform">
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="min-h-dvh bg-parties-bg text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-14 pb-4">
        <button onClick={back} className="p-2 -ml-2 text-white/60"><ArrowLeft size={22} /></button>
        <span className="ml-2 text-sm text-white/40">{stepLabels[stepIndex]}</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 px-5 mb-10">
        {steps.map((s, i) => (
          <div key={s} className={`h-[3px] flex-1 rounded-full transition-colors ${stepIndex >= i ? "bg-parties-accent" : "bg-white/10"}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 overflow-y-auto pb-4">
        {/* ========== STEP 1: Destination ========== */}
        {step === "destination" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Where do you want to go?</h2>
            <p className="text-sm text-white/50 mb-8">Select one or more destinations for your trip.</p>

            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Popular Destinations</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {POPULAR_DESTINATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleArr(destinations, d, setDestinations)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                    destinations.includes(d)
                      ? "bg-parties-accent text-white border border-parties-accent"
                      : "bg-white/5 text-white/70 border border-white/10"
                  }`}
                >
                  {d}
                  {destinations.includes(d) && <span className="float-right">&#10003;</span>}
                </button>
              ))}
            </div>

            {/* Custom destination */}
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                value={customDest}
                onChange={(e) => setCustomDest(e.target.value)}
                placeholder="Add another destination..."
                className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-base py-3 outline-none text-white placeholder:text-white/25 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && addCustomDest()}
              />
              <button onClick={addCustomDest} className="p-2 text-parties-accent"><Plus size={20} /></button>
            </div>

            {/* Custom chips */}
            {destinations.filter((d) => !POPULAR_DESTINATIONS.includes(d)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {destinations.filter((d) => !POPULAR_DESTINATIONS.includes(d)).map((d) => (
                  <span key={d} className="flex items-center gap-1.5 bg-parties-accent/15 text-parties-accent text-sm font-medium px-3 py-1.5 rounded-full">
                    {d}
                    <button onClick={() => setDestinations((p) => p.filter((x) => x !== d))}><X size={14} /></button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Trip Type</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleArr(tripTypes, t, setTripTypes)}
                  className={`py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                    tripTypes.includes(t)
                      ? "bg-parties-accent text-white border border-parties-accent"
                      : "bg-white/5 text-white/70 border border-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== STEP 2: Details ========== */}
        {step === "details" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Trip details</h2>
            <p className="text-sm text-white/50 mb-8">When, how many, and what level of luxury.</p>

            <div className="space-y-8">
              {/* Dates */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Travel Dates</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Arrival</label>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white py-3 px-4 outline-none focus:border-parties-accent transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Departure</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white py-3 px-4 outline-none focus:border-parties-accent transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Group size */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Group Size</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGroupSize((g) => Math.max(1, g - 1))}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-lg font-medium active:scale-95 transition-transform"
                  >
                    &minus;
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-display text-white">{groupSize}</span>
                    <span className="text-sm text-white/40 ml-2">{groupSize === 1 ? "person" : "people"}</span>
                  </div>
                  <button
                    onClick={() => setGroupSize((g) => Math.min(20, g + 1))}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-lg font-medium active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="w-full mt-3 accent-[#E54D2E]"
                />
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Budget Per Person</p>
                <div className="space-y-2.5">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                        budget === b
                          ? "bg-parties-accent text-white border border-parties-accent"
                          : "bg-white/5 text-white/70 border border-white/10"
                      }`}
                    >
                      {b}
                      {budget === b && <span className="float-right">&#10003;</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Accommodation</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACCOMMODATIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAccommodation(a)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium text-center transition-all ${
                        accommodation === a
                          ? "bg-parties-accent text-white border border-parties-accent"
                          : "bg-white/5 text-white/70 border border-white/10"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== STEP 3: Preferences ========== */}
        {step === "preferences" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Set the vibe</h2>
            <p className="text-sm text-white/50 mb-8">Tell us exactly what kind of experience you want.</p>

            <div className="space-y-8">
              {/* Vibes */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Vibe</p>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v}
                      onClick={() => toggleArr(vibes, v, setVibes)}
                      className={`py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                        vibes.includes(v)
                          ? "bg-parties-accent text-white border border-parties-accent"
                          : "bg-white/5 text-white/70 border border-white/10"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Occasion</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={`py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                        occasion === o
                          ? "bg-parties-accent text-white border border-parties-accent"
                          : "bg-white/5 text-white/70 border border-white/10"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific requests */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Specific Requests</p>
                <textarea
                  value={specificRequests}
                  onChange={(e) => setSpecificRequests(e.target.value)}
                  placeholder="Any restaurants, clubs, experiences, or special arrangements you have in mind..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-base py-3 px-4 outline-none text-white placeholder:text-white/25 transition-colors focus:border-parties-accent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========== STEP 4: Review ========== */}
        {step === "review" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Review your trip</h2>
            <p className="text-sm text-white/50 mb-8">Make sure everything looks right before submitting.</p>

            <div className="space-y-6">
              {/* Destinations */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-parties-accent" />
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Destinations</p>
                </div>
                <p className="text-base text-white">{destinations.join(", ")}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tripTypes.map((t) => (
                    <span key={t} className="text-xs bg-parties-accent/15 text-parties-accent px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-parties-accent" />
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Details</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-white/50">Dates</span>
                  <span className="text-white text-right">{arrivalDate} &mdash; {departureDate}</span>
                  <span className="text-white/50">Group size</span>
                  <span className="text-white text-right">{groupSize} {groupSize === 1 ? "person" : "people"}</span>
                  <span className="text-white/50">Budget</span>
                  <span className="text-white text-right">{budget} / person</span>
                  <span className="text-white/50">Accommodation</span>
                  <span className="text-white text-right">{accommodation}</span>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-parties-accent" />
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Preferences</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-white/40">Vibe</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {vibes.map((v) => (
                        <span key={v} className="text-xs bg-parties-accent/15 text-parties-accent px-2.5 py-1 rounded-full font-medium">{v}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-white/40">Occasion</span>
                    <p className="text-sm text-white mt-0.5">{occasion}</p>
                  </div>
                  {specificRequests && (
                    <div>
                      <span className="text-xs text-white/40">Special requests</span>
                      <p className="text-sm text-white/80 mt-0.5 leading-relaxed">{specificRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {/* Bottom CTA */}
      <div className="p-5 pb-10">
        <button
          onClick={next}
          disabled={!canProceed() || loading}
          className={`w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            canProceed() && !loading ? "bg-parties-accent text-white" : "bg-white/10 text-white/30"
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === "review" ? "Submit Trip Request" : "Next"}
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
