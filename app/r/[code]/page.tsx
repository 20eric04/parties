"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Gift, ArrowRight, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { lookupReferrer } from "@/lib/supabase";

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [referrer, setReferrer] = useState<{
    referrer_name: string;
    referrer_avatar: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await lookupReferrer(code);
        if (data) {
          setReferrer(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  function handleApply() {
    router.push(`/membership?ref=${encodeURIComponent(code)}`);
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-parties-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-parties-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parties-bg flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-parties-accent to-orange-500 flex items-center justify-center mx-auto mb-8">
          <Gift size={32} className="text-white" />
        </div>

        {notFound ? (
          <>
            <h1 className="font-display text-3xl italic text-white mb-3">
              Invalid Referral
            </h1>
            <p className="text-base text-white/50 leading-relaxed mb-10">
              This referral link is not valid or has expired. You can still apply for membership below.
            </p>
            <button
              onClick={() => router.push("/membership")}
              className="w-full py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Apply for Membership
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            {/* Referrer info */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <Users size={14} className="text-parties-accent" />
                <span className="text-sm text-white/60">Invited by</span>
                <span className="text-sm font-semibold text-white">
                  {referrer?.referrer_name}
                </span>
              </div>
            </motion.div>

            <h1 className="font-display text-4xl italic text-white mb-3 leading-tight">
              You&apos;re Invited to<br />
              <span className="text-parties-accent">PARTIES</span>
            </h1>
            <div className="w-10 h-[2px] bg-parties-accent mx-auto rounded-full mb-6" />
            <p className="text-base text-white/50 leading-relaxed mb-4">
              Join the most exclusive nightlife, dining, and travel club in the world.
            </p>

            {/* Perks */}
            <div className="space-y-3 mb-10 text-left">
              {[
                "VIP table access at top venues worldwide",
                "Personal concierge available 24/7",
                "Private events & curated experiences",
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-parties-accent/15 flex items-center justify-center shrink-0">
                    <Sparkles size={12} className="text-parties-accent" />
                  </div>
                  <p className="text-sm text-white/60">{perk}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="w-full py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Apply for Membership
              <ArrowRight size={18} />
            </button>

            <p className="mt-4 text-[11px] text-white/25">
              Your referral code <span className="text-white/40 font-mono">{code}</span> will be applied automatically.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
