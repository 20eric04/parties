"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { submitMembershipApplication, sendNotificationEmail } from "@/lib/supabase";

const DESTINATIONS = ["Miami","NYC","Las Vegas","Scottsdale","St. Martin","St. Barths","Tulum","Cabo","Ibiza","Mykonos","London","Paris","Amsterdam","Barcelona","Milan","Dubai","Monaco","Aspen"];
const BUDGET_RANGES = ["$25k — $50k","$50k — $100k","$100k — $250k","$250k — $500k","$500k+"];
const REFERRAL_OPTIONS = ["Friend or colleague","Social media","Press or media","Event","Other"];

type Step = "intro" | "personal" | "preferences" | "about";

export default function MembershipPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-parties-bg" />}>
      <MembershipContent />
    </Suspense>
  );
}

function MembershipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [step, setStep] = useState<Step>("intro");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [referral, setReferral] = useState("");
  const [instagram, setInstagram] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill referral source when coming from a referral link
  useEffect(() => {
    if (refCode) {
      setReferral("Friend or colleague");
    }
  }, [refCode]);

  const steps: Step[] = ["intro", "personal", "preferences", "about"];
  const stepIndex = steps.indexOf(step);

  const toggleDest = (d: string) => setDestinations(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const canProceed = () => {
    if (step === "intro") return true;
    if (step === "personal") return fullName.length > 0 && email.includes("@") && city.length > 0;
    if (step === "preferences") return destinations.length > 0 && budget.length > 0;
    if (step === "about") return referral.length > 0 && note.length > 0;
    return false;
  };

  const back = () => {
    if (stepIndex > 0) setStep(steps[stepIndex - 1]);
    else router.push("/");
  };

  const next = async () => {
    setError("");
    if (step !== "about") {
      setStep(steps[stepIndex + 1]);
      return;
    }
    setLoading(true);
    try {
      await submitMembershipApplication({
        full_name: fullName,
        email,
        phone: phone || "",
        city_of_residence: city,
        preferred_destinations: destinations,
        budget_range: budget,
        referral_source: referral,
        instagram_handle: instagram || undefined,
        personal_note: note,
        ...(refCode ? { referral_code: refCode } : {}),
      });
      setSubmitted(true);
      // Send confirmation email (fire-and-forget, don't block UI)
      sendNotificationEmail("application_received", email, fullName);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-dvh bg-parties-bg text-white flex flex-col items-center justify-center px-6">
        <div className="animate-scale-in text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-parties-accent/15 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-parties-accent" />
          </div>
          <h1 className="font-display text-4xl italic text-white mb-3">Application Received</h1>
          <div className="w-10 h-[2px] bg-parties-accent mx-auto rounded-full mb-6" />
          <p className="text-base text-white/60 leading-relaxed mb-2">Thank you, {fullName.split(" ")[0]}.</p>
          <p className="text-base text-white/60 leading-relaxed mb-10">Our membership team will review your application and be in touch within <span className="text-white/80 font-medium">48 hours</span>.</p>
          <button onClick={() => router.push("/")} className="w-full py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parties-bg text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-14 pb-4">
        <button onClick={back} className="p-2 -ml-2 text-white/60"><ArrowLeft size={22} /></button>
      </div>

      {/* Progress bar — skip intro */}
      {step !== "intro" && (
        <div className="flex gap-1.5 px-5 mb-10">
          {["personal", "preferences", "about"].map((s, i) => (
            <div key={s} className={`h-[3px] flex-1 rounded-full transition-colors ${["personal", "preferences", "about"].indexOf(step) >= i ? "bg-parties-accent" : "bg-white/10"}`} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-5 overflow-y-auto pb-4">
        {step === "intro" && (
          <div className="animate-slide-up">
            {refCode && (
              <div className="flex items-center gap-2 bg-parties-accent/10 border border-parties-accent/20 rounded-xl px-4 py-3 mb-6">
                <Sparkles size={14} className="text-parties-accent shrink-0" />
                <p className="text-sm text-white/70">
                  You were referred by a PARTIES member. Your referral code{" "}
                  <span className="font-mono text-white/90">{refCode}</span> will be applied.
                </p>
              </div>
            )}
            <div className="mb-10">
              <h1 className="font-display text-[40px] leading-[1.1] italic text-white mb-4">Become a<br />Member</h1>
              <div className="w-10 h-[2px] bg-parties-accent rounded-full mb-6" />
              <p className="text-base text-white/60 leading-relaxed max-w-[320px]">
                PARTIES membership is by invitation and application only. Join an exclusive circle with access to the world&apos;s finest nightlife, dining, and travel.
              </p>
            </div>
            <div className="space-y-5">
              {[
                { title: "VIP Table Access", desc: "Priority reservations at the most sought-after venues worldwide" },
                { title: "Personal Concierge", desc: "A dedicated lifestyle manager available around the clock" },
                { title: "Private Events", desc: "Invitations to members-only gatherings and exclusive experiences" },
                { title: "Luxury Travel", desc: "Curated jets, hotels, and fleet vehicles at preferential rates" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-parties-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-parties-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-0.5">{item.title}</h3>
                    <p className="text-sm text-white/45 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "personal" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Tell us about you</h2>
            <p className="text-sm text-white/50 mb-8">We&apos;ll use this to personalize your experience.</p>
            <div className="space-y-6">
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" autoFocus
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"
              />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"
              />
              <div className="flex items-center gap-3">
                <span className="text-lg text-white/50 border-b-2 border-white/20 py-3 px-1">+1</span>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Phone (optional)"
                  className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"
                />
              </div>
              <input
                type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City of residence"
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"
                onKeyDown={e => e.key === "Enter" && canProceed() && next()}
              />
            </div>
          </div>
        )}

        {step === "preferences" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Your preferences</h2>
            <p className="text-sm text-white/50 mb-8">Select your preferred destinations and budget.</p>

            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Preferred Destinations</p>
            <div className="grid grid-cols-2 gap-2.5 mb-10">
              {DESTINATIONS.map(d => (
                <button key={d} onClick={() => toggleDest(d)} className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all ${destinations.includes(d) ? "bg-parties-accent text-white border border-parties-accent" : "bg-white/5 text-white/70 border border-white/10"}`}>
                  {d}{destinations.includes(d) && <span className="float-right">&#10003;</span>}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Annual Entertainment Budget</p>
            <div className="space-y-2.5">
              {BUDGET_RANGES.map(b => (
                <button key={b} onClick={() => setBudget(b)} className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${budget === b ? "bg-parties-accent text-white border border-parties-accent" : "bg-white/5 text-white/70 border border-white/10"}`}>
                  {b}{budget === b && <span className="float-right">&#10003;</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "about" && (
          <div className="animate-slide-up">
            <h2 className="font-display text-3xl text-white mb-2">Almost there</h2>
            <p className="text-sm text-white/50 mb-8">A few more details to complete your application.</p>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">How did you hear about PARTIES?</p>
                <div className="flex flex-wrap gap-2">
                  {REFERRAL_OPTIONS.map(r => (
                    <button key={r} onClick={() => setReferral(r)} className={`py-2.5 px-4 rounded-full text-sm font-medium transition-all ${referral === r ? "bg-parties-accent text-white border border-parties-accent" : "bg-white/5 text-white/70 border border-white/10"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <input
                  type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@instagram handle (optional)"
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">What are you looking for?</p>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)} placeholder="Tell us about the experiences you're seeking..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-base py-3 px-4 outline-none text-white placeholder:text-white/25 transition-colors focus:border-parties-accent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {/* Bottom CTA */}
      <div className="p-5 pb-10">
        <button onClick={next} disabled={!canProceed() || loading} className={`w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${canProceed() && !loading ? "bg-parties-accent text-white" : "bg-white/10 text-white/30"}`}>
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{step === "intro" ? "Apply Now" : step === "about" ? "Submit Application" : "Next"}<ChevronRight size={18} /></>
          )}
        </button>
        {step === "about" && (
          <p className="mt-4 text-center text-[11px] text-white/30 leading-relaxed">
            By submitting, you agree to our{" "}
            <Link href="/terms" className="text-white/40 underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-white/40 underline">Privacy Policy</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
