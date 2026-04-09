"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Search, MessageCircle, Calendar, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const TABS = [
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/concierge", icon: MessageCircle, label: "Concierge", featured: true },
  { href: "/bookings", icon: Calendar, label: "Bookings" },
  { href: "/profile", icon: User, label: "Account" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAuth();
  const hideNav = pathname.startsWith("/venue/") || pathname === "/concierge";

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-parties-accent/30 border-t-parties-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 pb-[108px]">{children}</main>
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <div className="mx-5 mb-1">
            <div className="bg-parties-bg rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-white/70 flex-1">Next: <span className="text-white font-medium">Saturday at LIV</span></p>
              <button onClick={() => router.push("/bookings")} className="text-[10px] text-parties-accent font-semibold">View</button>
            </div>
          </div>
          <div className="bg-gradient-to-t from-white via-white to-transparent pt-2 px-5 pb-7">
            <div className="flex justify-around items-center bg-white border border-black/[0.06] rounded-[20px] py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
              {TABS.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                const featured = (tab as any).featured;
                return (
                  <button key={tab.href} onClick={() => router.push(tab.href)} className={`flex flex-col items-center gap-1 min-w-[60px] ${featured ? "relative -mt-3" : ""}`}>
                    {featured ? (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${active ? "bg-parties-accent" : "bg-parties-bg"} shadow-lg`}>
                        <tab.icon size={20} className="text-white" fill="none" />
                      </div>
                    ) : (
                      <tab.icon size={22} className={active ? "text-parties-accent" : "text-parties-muted"} fill={active ? "currentColor" : "none"} />
                    )}
                    <span className={`text-[10px] font-semibold ${active ? "text-parties-accent" : featured ? "text-parties-text" : "text-parties-muted"}`}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
