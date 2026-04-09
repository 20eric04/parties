"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Users, Check, DollarSign, UserPlus, Share2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getUser } from "@/lib/supabase";

const SAMPLE_INVITES = [
  { name: "Alex M.", status: "confirmed", date: "2026-03-22" },
  { name: "Jordan K.", status: "attended", date: "2026-03-20" },
  { name: "Taylor S.", status: "pending", date: "2026-03-23" },
  { name: "Riley P.", status: "confirmed", date: "2026-03-21" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  attended: "bg-blue-100 text-blue-700",
};

export default function PromoterPage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;
  const [copied, setCopied] = useState(false);

  const inviteCode = user
    ? `PROMO-${user.id?.slice(0, 6).toUpperCase() || "VIP"}`
    : "PROMO-VIP001";
  const inviteLink = `https://parties.app/promo/${inviteCode}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1 text-parties-text">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-parties-text">Promoter Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-parties-soft rounded-xl p-4 text-center">
          <UserPlus size={20} className="text-parties-accent mx-auto mb-2" />
          <p className="text-xl font-bold text-parties-text">{SAMPLE_INVITES.length}</p>
          <p className="text-[10px] text-parties-secondary uppercase">Total Invites</p>
        </div>
        <div className="bg-parties-soft rounded-xl p-4 text-center">
          <Users size={20} className="text-parties-accent mx-auto mb-2" />
          <p className="text-xl font-bold text-parties-text">
            {SAMPLE_INVITES.filter((i) => i.status === "confirmed" || i.status === "attended").length}
          </p>
          <p className="text-[10px] text-parties-secondary uppercase">Confirmed</p>
        </div>
        <div className="bg-parties-soft rounded-xl p-4 text-center">
          <DollarSign size={20} className="text-parties-accent mx-auto mb-2" />
          <p className="text-xl font-bold text-parties-text">$150</p>
          <p className="text-[10px] text-parties-secondary uppercase">Earned</p>
        </div>
      </div>

      {/* Invite link */}
      <div className="bg-parties-bg rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Your Invite Link
        </p>
        <div className="bg-parties-surface rounded-xl px-4 py-3 mb-3">
          <p className="text-sm text-white/70 truncate font-mono">{inviteLink}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 py-3 bg-parties-accent text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={copyLink}
            className="w-12 rounded-xl bg-parties-surface flex items-center justify-center"
          >
            <Share2 size={18} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Share invite CTA */}
      <button
        onClick={copyLink}
        className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl mb-8 flex items-center justify-center gap-2"
      >
        <Share2 size={16} />
        Share Invite
      </button>

      {/* Recent invites */}
      <h2 className="text-sm font-semibold text-parties-text mb-4">Recent Invites</h2>
      <div className="space-y-3">
        {SAMPLE_INVITES.map((invite, i) => (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 bg-parties-soft rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-sm font-semibold text-parties-text">
                {invite.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-parties-text">{invite.name}</h3>
              <div className="flex items-center gap-1 text-[11px] text-parties-muted">
                <Clock size={10} />
                {new Date(invite.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
                statusStyle[invite.status] || statusStyle.pending
              }`}
            >
              {invite.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
