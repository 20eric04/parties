"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  {
    label: "Apply for Membership",
    href: "/membership",
    primary: true,
  },
  {
    label: "Explore Destinations",
    href: "/explore",
  },
  {
    label: "St. Tropez Season Guide",
    href: "/explore",
  },
  {
    label: "Monaco F1 Weekend",
    href: "/explore",
  },
  {
    label: "Cannes Film Festival",
    href: "/explore",
  },
  {
    label: "Download the App",
    href: "#",
    badge: "Coming Soon",
  },
];

export default function LinksPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh bg-parties-bg text-white relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-parties-accent/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-parties-accent)_0%,_transparent_60%)] opacity-[0.06] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center min-h-dvh px-6 pt-14 pb-10 max-w-[480px] mx-auto">
        {/* Monogram / Avatar */}
        <div
          className="w-20 h-20 rounded-full border border-white/15 bg-parties-surface flex items-center justify-center mb-5 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.9)",
          }}
        >
          <span className="font-display text-3xl italic text-parties-accent">P</span>
        </div>

        {/* Logo */}
        <h1
          className="font-display text-4xl italic text-white tracking-wide transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transitionDelay: "0.05s",
          }}
        >
          Parties
        </h1>

        {/* Accent line */}
        <div
          className="mt-3 w-8 h-[2px] bg-parties-accent rounded-full transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transitionDelay: "0.15s",
          }}
        />

        {/* Tagline */}
        <p
          className="mt-4 text-sm text-white/50 text-center max-w-[260px] leading-relaxed transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transitionDelay: "0.2s",
          }}
        >
          Your VIP Access to the World&rsquo;s Best Nightlife
        </p>

        {/* Links */}
        <div className="w-full mt-8 flex flex-col gap-3">
          {LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={`
                group relative w-full py-4 px-5 rounded-2xl text-center text-[15px] font-semibold
                transition-all duration-200 active:scale-[0.98]
                ${
                  link.primary
                    ? "bg-parties-accent text-white hover:bg-parties-accent-hover"
                    : "bg-white/[0.05] text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
                }
              `}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s, border-color 0.2s",
                transitionDelay: `${0.25 + i * 0.07}s`,
              }}
            >
              {link.label}
              {link.badge && (
                <span className="ml-2 inline-block text-[10px] font-semibold tracking-wider uppercase bg-white/10 text-white/60 px-2 py-0.5 rounded-full align-middle">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Social proof */}
        <p
          className="mt-8 text-xs text-white/30 tracking-wide transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "0.75s",
          }}
        >
          Join 500+ members worldwide
        </p>

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Footer */}
        <div
          className="mt-10 flex items-center justify-center gap-4 text-[11px] text-white/25 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "0.85s",
          }}
        >
          <Link href="/terms" className="hover:text-white/40 transition-colors">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-white/40 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
