"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Copy, Gift, Users, Check, Crown,
  Clock, UserPlus, Share2, Star, Wine, Ticket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchReferralStats,
  fetchReferralHistory,
  createReferral,
  getSession,
} from "@/lib/supabase";

const REWARD_TIERS = [
  { count: 3, label: "3 Referrals", reward: "Free Table Upgrade", icon: Star, unlocked: false },
  { count: 5, label: "5 Referrals", reward: "Complimentary Bottle", icon: Wine, unlocked: false },
  { count: 10, label: "10 Referrals", reward: "VIP Event Invite", icon: Ticket, unlocked: false },
];

interface ReferralEntry {
  id: string;
  referred_email: string;
  referred_name: string | null;
  status: "pending" | "joined" | "rewarded";
  created_at: string;
  joined_at: string | null;
}

interface Stats {
  total: number;
  joined: number;
  pending: number;
  rewarded: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, joined: 0, pending: 0, rewarded: 0 });
  const [history, setHistory] = useState<ReferralEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [error, setError] = useState("");

  const referralCode = user
    ? `PARTY${(user.id as string).replace(/-/g, "").slice(0, 6).toUpperCase()}`
    : "";
  const referralLink = `https://parties.com/r/${referralCode}`;

  const loadData = useCallback(async () => {
    if (!user) return;
    const token = getSession()?.access_token;
    if (!token) return;
    try {
      const [s, h] = await Promise.all([
        fetchReferralStats(token),
        fetchReferralHistory(token),
      ]);
      setStats(s);
      setHistory(h);
    } catch {
      // Silently handle — stats will show 0
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function copyToClipboard(text: string, type: "code" | "link") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join PARTIES",
          text: `Use my referral code ${referralCode} to join PARTIES — the world's most exclusive nightlife & travel club.`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard(referralLink, "link");
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.includes("@")) return;
    setSending(true);
    setError("");
    setSendSuccess(false);
    try {
      const token = getSession()?.access_token;
      if (!token) throw new Error("Please sign in first.");
      await createReferral(token, inviteEmail);
      setSendSuccess(true);
      setInviteEmail("");
      loadData();
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to send invite.");
    } finally {
      setSending(false);
    }
  }

  const tiers = REWARD_TIERS.map((t) => ({
    ...t,
    unlocked: stats.joined >= t.count,
  }));

  function statusBadge(status: string) {
    switch (status) {
      case "joined":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1">
            <Check size={10} /> Joined
          </span>
        );
      case "rewarded":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-parties-accent bg-parties-accent/10 rounded-full px-2.5 py-1">
            <Crown size={10} /> Rewarded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 bg-white/5 rounded-full px-2.5 py-1">
            <Clock size={10} /> Pending
          </span>
        );
    }
  }

  return (
    <div className="min-h-dvh bg-parties-bg pt-14 px-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1 text-white/60">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-white">Referrals</h1>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-parties-accent to-orange-500 rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Gift size={28} className="text-white" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-1">
            Invite Friends, Earn Rewards
          </h2>
          <p className="text-sm text-white/80">
            Share your code and unlock exclusive perks together
          </p>
        </div>
      </motion.div>

      {/* Referral code */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-parties-surface rounded-2xl p-5 mb-4"
      >
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Your Referral Code
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-parties-card rounded-xl px-4 py-3 text-center border border-white/5">
            <span className="font-mono text-xl font-bold text-white tracking-widest">
              {referralCode || "------"}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(referralCode, "code")}
            className="w-12 h-12 rounded-xl bg-parties-accent flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            {copied === "code" ? (
              <Check size={20} className="text-white" />
            ) : (
              <Copy size={20} className="text-white" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {copied === "code" && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-emerald-400 text-center mt-2"
            >
              Code copied!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Share buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => copyToClipboard(referralLink, "link")}
          className="flex-1 py-3.5 bg-parties-surface text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-white/5 active:scale-[0.98] transition-transform"
        >
          <Copy size={16} />
          {copied === "link" ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-3.5 bg-white text-parties-bg text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 size={16} />
          Share Invite
        </button>
      </div>

      {/* Send invite by email */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-parties-surface rounded-2xl p-5 mb-6 border border-white/5"
      >
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Invite by Email
        </p>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="friend@email.com"
            className="flex-1 bg-parties-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-parties-accent transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
          />
          <button
            onClick={handleSendInvite}
            disabled={sending || !inviteEmail.includes("@")}
            className="px-5 py-3 bg-parties-accent text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-all flex items-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Send
          </button>
        </div>
        {sendSuccess && (
          <p className="text-xs text-emerald-400 mt-2">Invite sent successfully!</p>
        )}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-semibold text-white mb-4">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-parties-surface rounded-xl p-4 text-center border border-white/5">
            <Users size={20} className="text-white/30 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {loading ? "-" : stats.total}
            </p>
            <p className="text-[10px] text-white/40 uppercase">Total</p>
          </div>
          <div className="bg-parties-surface rounded-xl p-4 text-center border border-white/5">
            <Check size={20} className="text-emerald-400/60 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {loading ? "-" : stats.joined}
            </p>
            <p className="text-[10px] text-white/40 uppercase">Joined</p>
          </div>
          <div className="bg-parties-surface rounded-xl p-4 text-center border border-white/5">
            <Clock size={20} className="text-white/30 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {loading ? "-" : stats.pending}
            </p>
            <p className="text-[10px] text-white/40 uppercase">Pending</p>
          </div>
        </div>
      </motion.div>

      {/* Reward Tiers */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-white mb-4">Reward Tiers</h2>
        <div className="space-y-3 mb-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const progress = Math.min(stats.joined / tier.count, 1);
            return (
              <div
                key={tier.count}
                className={`bg-parties-surface rounded-xl p-4 border transition-colors ${
                  tier.unlocked
                    ? "border-parties-accent/30"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tier.unlocked
                        ? "bg-parties-accent/15"
                        : "bg-white/5"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        tier.unlocked
                          ? "text-parties-accent"
                          : "text-white/30"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm font-semibold ${
                          tier.unlocked ? "text-white" : "text-white/60"
                        }`}
                      >
                        {tier.reward}
                      </h3>
                      {tier.unlocked && (
                        <span className="text-[10px] font-semibold text-parties-accent uppercase">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-full bg-parties-accent rounded-full"
                        />
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0">
                        {Math.min(stats.joined, tier.count)}/{tier.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral History */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-sm font-semibold text-white mb-4">Referral History</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/20 border-t-parties-accent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-parties-surface rounded-xl p-8 text-center border border-white/5">
            <Users size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/40">No referrals yet</p>
            <p className="text-xs text-white/25 mt-1">
              Share your code to start earning rewards
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-parties-surface rounded-xl p-4 border border-white/5 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {entry.referred_name || entry.referred_email}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {statusBadge(entry.status)}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <h2 className="text-sm font-semibold text-white mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            {
              num: 1,
              title: "Share your code",
              desc: "Send your unique referral link to friends",
            },
            {
              num: 2,
              title: "Friend applies",
              desc: "They apply for membership using your referral",
            },
            {
              num: 3,
              title: "Earn rewards",
              desc: "Unlock perks as more friends join PARTIES",
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-parties-accent/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-parties-accent">
                  {step.num}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
