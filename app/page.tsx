"use client";
import { useEffect } from "react";
import Link from "next/link";

const TICKER_ITEMS = [
  "MIAMI", "HAMPTONS", "IBIZA", "MONACO", "COACHELLA", "F1",
  "ART BASEL", "ST. TROPEZ", "CANNES", "DUBAI",
];

const TIERS = [
  {
    name: "SELECT",
    subtitle: "Entry-level access",
    features: [
      "Access to curated experiences",
      "City guides & recommendations",
      "Community events",
      "Digital concierge",
    ],
    featured: false,
    invitation: false,
  },
  {
    name: "RESERVE",
    subtitle: "Priority access + dedicated concierge",
    features: [
      "Everything in Select",
      "Personal concierge via text",
      "Priority reservations",
      "VIP table access",
    ],
    featured: true,
    invitation: false,
  },
  {
    name: "BLACK",
    subtitle: "By invitation only",
    features: [
      "Everything in Reserve",
      "Private jet & yacht access",
      "Bespoke trip curation",
      "Global event access",
    ],
    featured: false,
    invitation: true,
  },
];

const EXPERIENCES = [
  { title: "Coachella Houses", desc: "Desert weekends, redefined", img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80&auto=format" },
  { title: "F1 Monaco", desc: "Trackside access, yacht parties", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80&auto=format" },
  { title: "Hamptons Summer", desc: "The definitive summer experience", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format" },
  { title: "Art Basel", desc: "Where art meets nightlife", img: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=600&q=80&auto=format" },
  { title: "Private Dinners", desc: "Exclusive chef\u2019s tables worldwide", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80&auto=format" },
  { title: "Black Car Service", desc: "Sprinters, SUVs, door to door", img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80&auto=format" },
];


export default function LandingPage() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        .lp {
          --bg: #060606;
          --fg: #E8E4DD;
          --fg2: rgba(232,228,221,.45);
          --fg3: rgba(232,228,221,.2);
          --accent: #C6A96C;
          --accent-dim: rgba(198,169,108,.1);
          --accent-glow: rgba(198,169,108,.15);
          --line: rgba(232,228,221,.07);
          --surface: rgba(232,228,221,.025);
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--fg);
          font-family: var(--sans);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── Hero ── */
        .lp-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 clamp(2rem, 6vw, 6rem) clamp(4rem, 8vh, 6rem);
          position: relative;
        }
        .lp-hero::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 70%;
          height: 70%;
          background: radial-gradient(ellipse at center, var(--accent-glow), transparent 65%);
          pointer-events: none;
          opacity: .6;
        }

        .lp-hero-eyebrow {
          font-size: .68rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
          animation: fadeIn .6s ease;
        }

        .lp-hero h1 {
          font-family: var(--serif);
          font-size: clamp(2.6rem, 6.5vw, 5.5rem);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -.025em;
          max-width: 820px;
          margin-bottom: 2rem;
          animation: slideUp .7s cubic-bezier(.16,1,.3,1) .1s both;
        }

        .lp-hero-sub {
          font-size: clamp(.9rem, 1.2vw, 1.05rem);
          color: var(--fg2);
          max-width: 480px;
          line-height: 1.8;
          font-weight: 300;
          margin-bottom: 3rem;
          animation: slideUp .7s cubic-bezier(.16,1,.3,1) .2s both;
        }

        .lp-hero-actions {
          display: flex;
          gap: 1rem;
          animation: slideUp .7s cubic-bezier(.16,1,.3,1) .3s both;
        }

        .lp-btn {
          display: inline-flex;
          align-items: center;
          padding: .9rem 2.25rem;
          font-family: var(--sans);
          font-size: .78rem;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all .25s ease;
          cursor: pointer;
          border: none;
        }
        .lp-btn-primary {
          background: var(--fg);
          color: var(--bg);
        }
        .lp-btn-primary:hover {
          background: var(--accent);
          color: var(--bg);
        }
        .lp-btn-outline {
          background: transparent;
          color: var(--fg);
          border: 1px solid var(--fg3);
        }
        .lp-btn-outline:hover {
          border-color: var(--fg2);
        }

        /* ── Ticker ── */
        .lp-strip {
          padding: 2rem 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          overflow: hidden;
          white-space: nowrap;
        }
        .lp-strip-track {
          display: inline-flex;
          animation: ticker 28s linear infinite;
        }
        .lp-strip:hover .lp-strip-track {
          animation-play-state: paused;
        }
        .lp-strip-item {
          font-size: .72rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--fg3);
          padding: 0 2rem;
          transition: color .2s;
          cursor: default;
        }
        .lp-strip-item:hover {
          color: var(--accent);
        }

        /* ── Shared section ── */
        .lp-s {
          padding: clamp(5rem, 12vw, 10rem) clamp(2rem, 6vw, 6rem);
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-eyebrow {
          font-size: .68rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.5rem;
        }
        .lp-h2 {
          font-family: var(--serif);
          font-size: clamp(1.8rem, 3.5vw, 3rem);
          font-weight: 400;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          max-width: 600px;
        }

        /* ── What is PARTIES ── */
        .lp-statement {
          max-width: 700px;
        }
        .lp-statement p {
          font-family: var(--serif);
          font-size: clamp(1.2rem, 2.2vw, 1.6rem);
          font-weight: 400;
          line-height: 1.75;
          color: var(--fg);
          opacity: .8;
        }
        .lp-statement p + p {
          margin-top: 2rem;
        }

        /* ── Tiers ── */
        .lp-tiers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--line);
          border: 1px solid var(--line);
          margin-top: 3.5rem;
        }
        .lp-tier {
          background: var(--bg);
          padding: 2.75rem 2.25rem;
          display: flex;
          flex-direction: column;
          transition: background .3s ease, box-shadow .3s ease;
          cursor: default;
        }
        .lp-tier:hover {
          background: rgba(198,169,108,.04);
          box-shadow: inset 0 0 80px rgba(198,169,108,.03);
        }
        .lp-tier-featured {
          background: var(--surface);
        }
        .lp-tier-featured:hover {
          background: rgba(198,169,108,.07);
          box-shadow: inset 0 0 80px rgba(198,169,108,.05);
        }
        .lp-tier-name {
          font-size: .68rem;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: .6rem;
          color: var(--fg);
          transition: color .3s ease;
        }
        .lp-tier:hover .lp-tier-name {
          color: var(--accent);
        }
        .lp-tier-featured .lp-tier-name {
          color: var(--accent);
        }
        .lp-tier-sub {
          font-size: .82rem;
          color: var(--fg2);
          font-weight: 300;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .lp-tier-list {
          list-style: none;
          padding: 0;
          margin: 0 0 auto 0;
        }
        .lp-tier-list li {
          padding: .6rem 0;
          font-size: .8rem;
          font-weight: 300;
          color: var(--fg2);
          border-bottom: 1px solid var(--line);
        }
        .lp-tier-list li:last-child {
          border-bottom: none;
        }
        .lp-tier-tag {
          margin-top: 2rem;
          font-family: var(--serif);
          font-size: .85rem;
          font-style: italic;
          color: var(--fg2);
        }
        .lp-tiers-foot {
          margin-top: 3rem;
          text-align: center;
        }

        /* ── Experiences ── */
        .lp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin-top: 3.5rem;
        }
        .lp-grid-item {
          aspect-ratio: 3 / 4;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem 1.75rem;
          position: relative;
          overflow: hidden;
          background-size: cover;
          background-position: center;
        }
        .lp-grid-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6,6,6,.88) 0%, rgba(6,6,6,.45) 40%, rgba(6,6,6,.2) 100%);
          transition: background .4s;
        }
        .lp-grid-item:hover::before {
          background: linear-gradient(to top, rgba(6,6,6,.92) 0%, rgba(6,6,6,.35) 40%, rgba(6,6,6,.1) 100%);
        }
        .lp-grid-item h3 {
          font-family: var(--serif);
          font-size: clamp(1.15rem, 1.8vw, 1.4rem);
          font-weight: 400;
          margin-bottom: .35rem;
          position: relative;
          z-index: 1;
          transition: color .3s;
        }
        .lp-grid-item:hover h3 {
          color: var(--accent);
        }
        .lp-grid-item p {
          font-size: .78rem;
          color: rgba(232,228,221,.6);
          font-weight: 300;
          position: relative;
          z-index: 1;
        }

        /* ── (Process section removed) ── */

        /* ── Final CTA ── */
        .lp-close {
          text-align: center;
          padding: clamp(6rem, 14vw, 12rem) 2rem;
          position: relative;
        }
        .lp-close::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 55% 45% at 50% 50%, var(--accent-dim), transparent);
          pointer-events: none;
        }
        .lp-close h2 {
          font-family: var(--serif);
          font-size: clamp(2.2rem, 5.5vw, 4rem);
          font-weight: 400;
          margin-bottom: 1rem;
          position: relative;
        }
        .lp-close p {
          font-size: .95rem;
          color: var(--fg2);
          font-weight: 300;
          margin-bottom: 2.5rem;
          position: relative;
        }
        .lp-close .lp-btn {
          position: relative;
        }

        /* ── Footer ── */
        .lp-foot {
          border-top: 1px solid var(--line);
          padding: 3rem clamp(2rem, 6vw, 6rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-foot-logo {
          font-family: var(--serif);
          font-size: 1rem;
          letter-spacing: .08em;
        }
        .lp-foot-links {
          display: flex;
          gap: 2rem;
        }
        .lp-foot-links a {
          font-size: .7rem;
          color: var(--fg3);
          text-decoration: none;
          letter-spacing: .1em;
          text-transform: uppercase;
          transition: color .2s;
        }
        .lp-foot-links a:hover {
          color: var(--fg);
        }
        .lp-foot-copy {
          width: 100%;
          text-align: center;
          font-size: .65rem;
          color: var(--fg3);
          margin-top: .5rem;
        }

        /* ── Animations ── */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .rv {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .6s ease, transform .6s ease;
        }
        .rv.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .lp-tiers { grid-template-columns: 1fr; }
          .lp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .lp-hero-actions { flex-direction: column; }
          .lp-btn { width: 100%; justify-content: center; }
          .lp-grid { grid-template-columns: 1fr; }
          .lp-foot { flex-direction: column; text-align: center; }
          .lp-foot-links { justify-content: center; flex-wrap: wrap; }
        }
      `}</style>

      <div className="lp">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-eyebrow">Members Only</div>
          <h1>Private Access to the World&apos;s Most In&#8209;Demand Experiences</h1>
          <p className="lp-hero-sub">
            We handle the nightlife, the travel, the impossible reservations. You just show up.
          </p>
          <div className="lp-hero-actions">
            <Link href="/apply" className="lp-btn lp-btn-primary">Apply for Membership</Link>
            <Link href="/apply" className="lp-btn lp-btn-outline">Request Access</Link>
          </div>
        </section>

        {/* Ticker */}
        <div className="lp-strip">
          <div className="lp-strip-track">
            {Array.from({ length: 4 }).flatMap((_, i) =>
              TICKER_ITEMS.map((c, j) => (
                <span key={`${i}-${j}`} className="lp-strip-item">{c}</span>
              ))
            )}
          </div>
        </div>

        {/* What is PARTIES */}
        <section className="lp-s rv">
          <div className="lp-statement">
            <div className="lp-eyebrow">The Standard</div>
            <p>
              PARTIES is a private membership for people who&apos;d rather text someone than spend hours figuring out the best table in Monaco.
            </p>
            <p>
              Sold-out shows, impossible reservations, last-minute jets — we make it happen so you don&apos;t have to think about it.
            </p>
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="lp-s rv">
          <div className="lp-eyebrow">Membership</div>
          <h2 className="lp-h2">Pick your level.</h2>
          <div className="lp-tiers">
            {TIERS.map((t) => (
              <div key={t.name} className={`lp-tier${t.featured ? " lp-tier-featured" : ""}`}>
                <div className="lp-tier-name">{t.name}</div>
                <div className="lp-tier-sub">{t.subtitle}</div>
                <ul className="lp-tier-list">
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {t.invitation && <div className="lp-tier-tag">By invitation</div>}
              </div>
            ))}
          </div>
          <div className="lp-tiers-foot">
            <Link href="/apply" className="lp-btn lp-btn-primary">View Membership</Link>
          </div>
        </section>

        {/* Experiences */}
        <section className="lp-s rv">
          <div className="lp-eyebrow">Experiences</div>
          <h2 className="lp-h2">What we&apos;re known for.</h2>
          <div className="lp-grid">
            {EXPERIENCES.map((e) => (
              <div key={e.title} className="lp-grid-item" style={{ backgroundImage: `url(${e.img})` }}>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="lp-close rv">
          <h2>We keep it small on purpose.</h2>
          <p>Apply now. We&apos;ll be in touch.</p>
          <Link href="/apply" className="lp-btn lp-btn-primary">Apply for Membership</Link>
        </section>

        {/* Footer */}
        <footer className="lp-foot">
          <div className="lp-foot-logo">PARTIES</div>
          <div className="lp-foot-links">
            <a href="https://instagram.com/parties" target="_blank" rel="noopener noreferrer">Instagram</a>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:hello@parties.com">Contact</a>
          </div>
          <div className="lp-foot-copy">&copy; 2026 PARTIES. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
