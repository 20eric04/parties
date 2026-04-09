"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Send,
  ChevronDown,
  Plus,
  UserPlus,
  Globe,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchSocialPosts,
  createSocialPost,
  respondToSocialPost,
  getSession,
} from "@/lib/supabase";

const VIBE_OPTIONS = [
  "Chill",
  "Party",
  "Business",
  "Celebration",
  "Date Night",
  "Girls Night",
  "Guys Night",
  "Spontaneous",
];

const BUDGET_OPTIONS = [
  "$ — Under $500",
  "$$ — $500–$1,500",
  "$$$ — $1,500–$5,000",
  "$$$$ — $5,000+",
];

function avatarInitial(name?: string) {
  return (name || "?").charAt(0).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// --- Open Table Card ---
function OpenTableCard({
  post,
  onRequest,
  requesting,
}: {
  post: any;
  onRequest: (post: any) => void;
  requesting: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
    >
      <div className="bg-gradient-to-r from-parties-bg to-parties-surface p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-parties-accent/20 flex items-center justify-center text-parties-accent font-semibold text-sm">
            {avatarInitial(post.host_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {post.venue_name}
            </p>
            <p className="text-xs text-white/50">
              Hosted by {post.host_name || "Member"}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg px-2.5 py-1.5 text-center">
            <p className="text-[10px] font-bold text-parties-accent leading-none">
              {post.event_date
                ? new Date(post.event_date + "T00:00:00")
                    .toLocaleString("en-US", { month: "short" })
                    .toUpperCase()
                : "TBD"}
            </p>
            <p className="text-base font-bold text-white leading-none">
              {post.event_date
                ? new Date(post.event_date + "T00:00:00").getDate()
                : "—"}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 pt-3">
        <div className="flex items-center gap-3 text-xs text-parties-secondary mb-3">
          {post.event_time && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.event_time}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={12} />
            {post.available_spots} of {post.total_spots} spots open
          </span>
        </div>
        {post.description && (
          <p className="text-sm text-parties-secondary mb-3 line-clamp-2">
            {post.description}
          </p>
        )}
        {post.vibe_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.vibe_tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-parties-accent bg-parties-accent/10 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onRequest(post)}
          disabled={requesting === post.id}
          className="w-full py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {requesting === post.id ? (
            <>
              <Check size={16} />
              Request Sent!
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Request to Join
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// --- LFG Card ---
function LFGCard({
  post,
  onConnect,
  connecting,
}: {
  post: any;
  onConnect: (post: any) => void;
  connecting: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-parties-surface flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {avatarInitial(post.host_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-parties-text">
              {post.host_name || "Member"} is looking for people
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-parties-secondary">
              <Globe size={12} />
              <span className="truncate">
                {post.destination || "Flexible destination"}
              </span>
            </div>
          </div>
        </div>
        {post.event_date && (
          <div className="flex items-center gap-1.5 text-xs text-parties-secondary mb-2">
            <Calendar size={12} />
            <span>{formatDate(post.event_date)}</span>
          </div>
        )}
        {post.description && (
          <p className="text-sm text-parties-secondary mb-3 line-clamp-3">
            {post.description}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
          {post.budget_range && (
            <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <DollarSign size={10} />
              {post.budget_range}
            </span>
          )}
          {post.vibe_tags?.map((tag: string) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-parties-accent bg-parties-accent/10 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => onConnect(post)}
          disabled={connecting === post.id}
          className="w-full py-2.5 bg-parties-bg text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {connecting === post.id ? (
            <>
              <Check size={16} />
              Message Sent!
            </>
          ) : (
            <>
              <Send size={16} />
              Connect
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// --- Share Form ---
function ShareForm({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  submitting: boolean;
}) {
  const [postType, setPostType] = useState<"open_table" | "looking_for_group">(
    "open_table"
  );
  const [venueName, setVenueName] = useState("");
  const [destination, setDestination] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [totalSpots, setTotalSpots] = useState("4");
  const [availableSpots, setAvailableSpots] = useState("2");
  const [budgetRange, setBudgetRange] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  function toggleVibe(v: string) {
    setSelectedVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function handleSubmit() {
    const data: any = {
      type: postType,
      event_date: eventDate || null,
      event_time: eventTime || null,
      description: description || null,
      vibe_tags: selectedVibes,
    };
    if (postType === "open_table") {
      data.venue_name = venueName;
      data.total_spots = parseInt(totalSpots) || 4;
      data.available_spots = parseInt(availableSpots) || 2;
    } else {
      data.destination = destination;
      data.budget_range = budgetRange || null;
    }
    onSubmit(data);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85dvh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-black/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-parties-text">
                Share Your Plans
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-parties-soft flex items-center justify-center"
              >
                <X size={16} className="text-parties-secondary" />
              </button>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Type selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setPostType("open_table")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors ${
                  postType === "open_table"
                    ? "bg-parties-accent text-white"
                    : "bg-parties-soft text-parties-secondary"
                }`}
              >
                I have open spots
              </button>
              <button
                onClick={() => setPostType("looking_for_group")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors ${
                  postType === "looking_for_group"
                    ? "bg-parties-accent text-white"
                    : "bg-parties-soft text-parties-secondary"
                }`}
              >
                Looking for people
              </button>
            </div>

            {/* Conditional fields */}
            {postType === "open_table" ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. LIV Miami"
                    className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text placeholder:text-parties-muted outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                      Total Spots
                    </label>
                    <input
                      type="number"
                      value={totalSpots}
                      onChange={(e) => setTotalSpots(e.target.value)}
                      min="2"
                      max="20"
                      className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                      Spots Available
                    </label>
                    <input
                      type="number"
                      value={availableSpots}
                      onChange={(e) => setAvailableSpots(e.target.value)}
                      min="1"
                      max="20"
                      className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Ibiza, Tulum, Mykonos..."
                    className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text placeholder:text-parties-muted outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                    Budget Range
                  </label>
                  <div className="space-y-1.5">
                    {BUDGET_OPTIONS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBudgetRange(b)}
                        className={`w-full text-left py-2.5 px-4 text-sm rounded-xl transition-colors ${
                          budgetRange === b
                            ? "bg-parties-accent/10 text-parties-accent font-semibold border border-parties-accent/30"
                            : "bg-parties-soft text-parties-secondary"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-1.5">
                Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  postType === "open_table"
                    ? "Tell people about the vibe, dress code, what to expect..."
                    : "What are you looking for? Split a villa, share a table, travel buddy..."
                }
                rows={3}
                className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text placeholder:text-parties-muted outline-none resize-none"
              />
            </div>

            {/* Vibe Tags */}
            <div>
              <label className="text-xs font-semibold text-parties-secondary uppercase tracking-wider block mb-2">
                Vibe Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleVibe(v)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                      selectedVibes.includes(v)
                        ? "bg-parties-accent text-white"
                        : "bg-parties-soft text-parties-secondary"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                (postType === "open_table" && !venueName) ||
                (postType === "looking_for_group" && !destination)
              }
              className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  Share with Members
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main Page ---
export default function SocialPage() {
  const { user, session } = useAuth();
  const [tab, setTab] = useState<"tables" | "lfg">("tables");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const d = await fetchSocialPosts();
      setPosts(Array.isArray(d) ? d : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const openTables = posts.filter((p) => p.type === "open_table");
  const lfgPosts = posts.filter((p) => p.type === "looking_for_group");

  async function handleRequest(post: any) {
    const s = getSession();
    if (!s?.access_token) return;
    setRequesting(post.id);
    try {
      await respondToSocialPost(
        s.access_token,
        post.id,
        post.host_name || "there",
        post.type
      );
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setRequesting(null), 2500);
  }

  async function handleConnect(post: any) {
    const s = getSession();
    if (!s?.access_token) return;
    setConnecting(post.id);
    try {
      await respondToSocialPost(
        s.access_token,
        post.id,
        post.host_name || "there",
        post.type
      );
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setConnecting(null), 2500);
  }

  async function handleSubmitPost(data: any) {
    const s = getSession();
    if (!s?.access_token) return;
    setSubmitting(true);
    try {
      await createSocialPost(s.access_token, data);
      setFormOpen(false);
      loadPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[28px] font-semibold text-parties-text">
          Social
        </h1>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-parties-accent"
        >
          <Plus size={16} />
          Share
        </button>
      </div>
      <p className="text-sm text-parties-secondary mb-6">
        Find your people, share the experience
      </p>

      {/* Warm intro banner */}
      <div className="bg-gradient-to-r from-parties-bg to-parties-surface rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-parties-accent/20 flex items-center justify-center shrink-0">
            <Users size={20} className="text-parties-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg text-white mb-0.5">
              Better together
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Join someone&apos;s table, find a travel buddy, or share your own
              plans with fellow members. All connections are handled
              through our concierge for your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("tables")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
            tab === "tables"
              ? "bg-parties-accent text-white"
              : "text-parties-muted"
          }`}
        >
          Open Tables
        </button>
        <button
          onClick={() => setTab("lfg")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
            tab === "lfg"
              ? "bg-parties-accent text-white"
              : "text-parties-muted"
          }`}
        >
          Looking for Group
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[180px] bg-parties-soft rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : tab === "tables" ? (
        openTables.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-1">
              No open tables yet
            </h3>
            <p className="text-sm text-parties-secondary mb-4">
              Be the first to share your table!
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl"
            >
              <Plus size={16} />
              Share Your Table
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {openTables.map((post) => (
              <OpenTableCard
                key={post.id}
                post={post}
                onRequest={handleRequest}
                requesting={requesting}
              />
            ))}
          </div>
        )
      ) : lfgPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
            <Globe size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">
            No one looking yet
          </h3>
          <p className="text-sm text-parties-secondary mb-4">
            Post what you&apos;re looking for and connect with members.
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl"
          >
            <Plus size={16} />
            Post Your Plans
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lfgPosts.map((post) => (
            <LFGCard
              key={post.id}
              post={post}
              onConnect={handleConnect}
              connecting={connecting}
            />
          ))}
        </div>
      )}

      {/* Floating CTA */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setFormOpen(true)}
        className="fixed bottom-[140px] right-5 w-14 h-14 bg-parties-accent rounded-full flex items-center justify-center shadow-lg shadow-parties-accent/30 z-40"
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Share Form Modal */}
      <ShareForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitPost}
        submitting={submitting}
      />
    </div>
  );
}
