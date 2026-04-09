"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Calendar, Ticket, Gift, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { fetchNotifications, markNotificationRead, getUser } from "@/lib/supabase";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const ICON_MAP: Record<string, typeof Bell> = {
  booking: Ticket,
  event: Calendar,
  promo: Gift,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) { setLoading(false); return; }
    fetchNotifications(user.id)
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try { await markNotificationRead(id); } catch {}
  }

  async function handleMarkAll() {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const n of unread) {
      try { await markNotificationRead(n.id); } catch {}
    }
  }

  const today = notifications.filter((n) => isToday(n.created_at));
  const earlier = notifications.filter((n) => !isToday(n.created_at));
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => router.back()} className="p-1 text-parties-text">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 text-xl font-bold text-parties-text">Notifications</h1>
        {hasUnread && (
          <button onClick={handleMarkAll} className="text-xs font-semibold text-parties-accent flex items-center gap-1">
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>
      <p className="text-sm text-parties-secondary mb-6 pl-8">Stay updated on your bookings</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] bg-parties-soft rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Bell size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">No notifications yet</h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px]">
            We&apos;ll notify you about bookings, events, and special offers.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-3">Today</h2>
              <div className="space-y-2">
                {today.map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={handleRead} />
                ))}
              </div>
            </div>
          )}
          {earlier.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-3">Earlier</h2>
              <div className="space-y-2">
                {earlier.map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={handleRead} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({ notif, onRead }: { notif: any; onRead: (id: number) => void }) {
  const Icon = ICON_MAP[notif.type] || Bell;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => !notif.read && onRead(notif.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
        notif.read ? "bg-white" : "bg-parties-accent/5"
      }`}
    >
      <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
        notif.read ? "bg-parties-soft" : "bg-parties-accent/10"
      }`}>
        <Icon size={18} className={notif.read ? "text-parties-muted" : "text-parties-accent"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-sm line-clamp-1 ${notif.read ? "text-parties-secondary" : "font-semibold text-parties-text"}`}>
            {notif.title}
          </h3>
          {!notif.read && <div className="w-2 h-2 rounded-full bg-parties-accent shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-parties-muted line-clamp-2 mt-0.5">{notif.message}</p>
        <p className="text-[10px] text-parties-muted mt-1">{timeAgo(notif.created_at)}</p>
      </div>
    </motion.button>
  );
}
