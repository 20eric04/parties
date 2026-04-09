"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Users, Clock, CheckCircle, XCircle, Loader2, AtSign, MapPin, Mail, DollarSign, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { fetchMembershipApplications, updateApplicationStatus, sendNotificationEmail } from "@/lib/supabase";

const ADMIN_EMAILS = ["admin@parties.com"];

type AppStatus = "all" | "pending" | "approved" | "rejected" | "waitlisted";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city_of_residence: string;
  preferred_destinations: string[];
  budget_range: string;
  referral_source: string;
  instagram_handle?: string;
  personal_note: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
}

const TABS: { label: string; value: AppStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Waitlisted", value: "waitlisted" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  waitlisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function AdminPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppStatus>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const token = session?.access_token;

  const loadApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMembershipApplications(token);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) loadApplications();
    if (!authLoading && !token) setLoading(false);
  }, [authLoading, token, loadApplications]);

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    if (!token || updatingId) return;
    setUpdatingId(appId);
    try {
      const updated = await updateApplicationStatus(token, appId, newStatus);
      if (updated && updated.length > 0) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus, reviewed_at: new Date().toISOString() } : a))
        );

        // Send notification email for approvals and rejections
        const app = applications.find((a) => a.id === appId);
        if (app) {
          if (newStatus === "approved") {
            sendNotificationEmail("application_approved", app.email, app.full_name);
          } else if (newStatus === "rejected") {
            sendNotificationEmail("application_rejected", app.email, app.full_name);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let list = applications;
    if (activeTab !== "all") list = list.filter((a) => a.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.city_of_residence?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [applications, activeTab, search]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }), [applications]);

  const userEmail = session?.user?.email;
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);

  if (!authLoading && (!token || !isAdmin)) {
    return (
      <div className="min-h-dvh bg-parties-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-white mb-3">Access Denied</h1>
          <p className="text-parties-muted text-sm mb-6">{!token ? "You must be signed in to view this page." : "You do not have admin privileges."}</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-parties-accent text-white rounded-xl text-sm font-semibold hover:bg-parties-accent-hover transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parties-bg">
      {/* Header */}
      <div className="bg-parties-card border-b border-white/5 px-4 sm:px-8 pt-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-2 text-parties-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wide">Membership Applications</h1>
              <p className="text-parties-muted text-xs mt-0.5">Review and manage incoming applications</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: stats.total, icon: Users, color: "text-white" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400" },
              { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-emerald-400" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-parties-surface rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-[11px] text-parties-muted uppercase tracking-wider">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-1 bg-parties-surface rounded-xl p-1 border border-white/5">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === t.value
                      ? "bg-parties-accent text-white shadow-lg shadow-parties-accent/20"
                      : "text-parties-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parties-muted" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-parties-surface border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-parties-muted/60 focus:outline-none focus:border-parties-accent/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-parties-muted">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={loadApplications} className="px-5 py-2.5 bg-parties-accent text-white rounded-xl text-sm font-semibold hover:bg-parties-accent-hover transition-colors">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users size={32} className="text-parties-muted/40 mx-auto mb-3" />
            <p className="text-parties-muted text-sm">
              {search ? "No applications match your search." : "No applications found."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((app, i) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="bg-parties-card rounded-2xl border border-white/5 p-5 flex flex-col hover:border-white/10 transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-white truncate">{app.full_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={11} className="text-parties-muted shrink-0" />
                        <span className="text-xs text-parties-muted truncate">{app.email}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ml-2 ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 mb-4 flex-1">
                    {app.city_of_residence && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-parties-accent shrink-0" />
                        <span className="text-xs text-parties-muted">{app.city_of_residence}</span>
                      </div>
                    )}
                    {app.budget_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} className="text-parties-accent shrink-0" />
                        <span className="text-xs text-parties-muted">{app.budget_range}</span>
                      </div>
                    )}
                    {app.instagram_handle && (
                      <div className="flex items-center gap-2">
                        <AtSign size={12} className="text-parties-accent shrink-0" />
                        <span className="text-xs text-parties-muted">@{app.instagram_handle.replace(/^@/, "")}</span>
                      </div>
                    )}
                    {app.preferred_destinations && app.preferred_destinations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.preferred_destinations.map((d) => (
                          <span key={d} className="text-[10px] bg-white/5 text-parties-muted px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    )}
                    {app.personal_note && (
                      <div className="flex gap-2 mt-1">
                        <MessageSquare size={12} className="text-parties-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-parties-muted/80 leading-relaxed line-clamp-3">{app.personal_note}</p>
                      </div>
                    )}
                  </div>

                  {/* Submitted date */}
                  <p className="text-[10px] text-parties-muted/50 mb-3">
                    Submitted {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    {app.reviewed_at && <> &middot; Reviewed {new Date(app.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {app.status !== "approved" && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, "approved")}
                        disabled={updatingId === app.id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-wait"
                      >
                        {updatingId === app.id ? "..." : "Approve"}
                      </button>
                    )}
                    {app.status !== "rejected" && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, "rejected")}
                        disabled={updatingId === app.id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-wait"
                      >
                        {updatingId === app.id ? "..." : "Reject"}
                      </button>
                    )}
                    {app.status !== "waitlisted" && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, "waitlisted")}
                        disabled={updatingId === app.id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-wait"
                      >
                        {updatingId === app.id ? "..." : "Waitlist"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
