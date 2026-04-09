"use client";
import { useState } from "react";
import Link from "next/link";
import { submitMembershipApplication, sendNotificationEmail } from "@/lib/supabase";

const CITIES = ["Miami", "New York", "Los Angeles", "London", "Dubai", "Ibiza", "Monaco", "Other"];
const EXPERIENCE_OPTIONS = ["Nightlife", "Travel", "Dining", "Events", "All"];
const SPEND_OPTIONS = ["Under $5K", "$5K\u2013$10K", "$10K\u2013$25K", "$25K\u2013$50K", "$50K+"];

export default function ApplyPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [instagram, setInstagram] = useState("");
  const [experiences, setExperiences] = useState<string[]>([]);
  const [spend, setSpend] = useState("");
  const [conciergeExp, setConciergeExp] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleExperience = (e: string) => {
    if (e === "All") {
      setExperiences((prev) => prev.includes("All") ? [] : ["All"]);
      return;
    }
    setExperiences((prev) => {
      const without = prev.filter((x) => x !== "All");
      return without.includes(e) ? without.filter((x) => x !== e) : [...without, e];
    });
  };

  const canSubmit =
    fullName.length > 0 &&
    email.includes("@") &&
    city.length > 0 &&
    experiences.length > 0 &&
    spend.length > 0 &&
    conciergeExp !== null;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError("");
    setLoading(true);
    try {
      const personalNote = [
        `Concierge experience: ${conciergeExp ? "Yes" : "No"}.`,
        note ? note : "",
      ].filter(Boolean).join(" ");

      await submitMembershipApplication({
        full_name: fullName,
        email,
        phone: phone || "",
        city_of_residence: city,
        preferred_destinations: experiences,
        budget_range: spend,
        referral_source: "Website — /apply",
        instagram_handle: instagram || undefined,
        personal_note: personalNote,
      });
      setSubmitted(true);
      sendNotificationEmail("application_received", email, fullName);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
          .ap{min-height:100dvh;background:#060606;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'Inter',-apple-system,sans-serif;color:#E8E4DD}
          .ap-done{text-align:center;max-width:440px;animation:aUp .5s cubic-bezier(.16,1,.3,1) both}
          .ap-done h1{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,3.5rem);font-weight:400;margin-bottom:1.5rem}
          .ap-done .line{width:2.5rem;height:1px;background:#C6A96C;margin:0 auto 1.75rem}
          .ap-done p{color:rgba(232,228,221,.5);font-size:.95rem;line-height:1.75;font-weight:300}
          .ap-done .small{font-size:.8rem;color:rgba(232,228,221,.25);margin-top:2rem}
          .ap-done .home{display:inline-block;margin-top:3rem;padding:.85rem 2.25rem;border:1px solid rgba(232,228,221,.12);color:rgba(232,228,221,.6);font-size:.78rem;font-weight:500;text-decoration:none;letter-spacing:.1em;text-transform:uppercase;transition:all .25s}
          .ap-done .home:hover{border-color:#C6A96C;color:#C6A96C}
          @keyframes aUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <div className="ap">
          <div className="ap-done">
            <h1>Thank you.</h1>
            <div className="line" />
            <p>Our team will review your application and be in touch shortly.</p>
            <p className="small">Applications are typically reviewed within 48 hours.</p>
            <Link href="/" className="home">Return Home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        .ap {
          --bg: #060606;
          --fg: #E8E4DD;
          --fg2: rgba(232,228,221,.45);
          --fg3: rgba(232,228,221,.2);
          --accent: #C6A96C;
          --line: rgba(232,228,221,.07);
          --input-bg: rgba(232,228,221,.03);
          --input-border: rgba(232,228,221,.09);
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Inter', -apple-system, sans-serif;

          min-height: 100dvh;
          background: var(--bg);
          font-family: var(--sans);
          color: var(--fg);
          position: relative;
        }
        .ap::before {
          content: '';
          position: fixed;
          top: -30%;
          right: -20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse at center, rgba(198,169,108,.06), transparent 65%);
          pointer-events: none;
        }

        .ap-wrap {
          max-width: 560px;
          margin: 0 auto;
          padding: clamp(2.5rem, 6vh, 5rem) clamp(1.5rem, 4vw, 2rem) 4rem;
          position: relative;
        }

        /* Nav */
        .ap-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: clamp(3rem, 6vh, 5rem);
        }
        .ap-nav-back {
          font-size: .72rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--fg3);
          text-decoration: none;
          transition: color .2s;
        }
        .ap-nav-back:hover { color: var(--fg2); }
        .ap-nav-logo {
          font-family: var(--serif);
          font-size: .9rem;
          letter-spacing: .06em;
          color: var(--fg3);
        }

        /* Header */
        .ap-head {
          margin-bottom: clamp(3rem, 6vh, 4.5rem);
        }
        .ap-head h1 {
          font-family: var(--serif);
          font-size: clamp(2rem, 4.5vw, 2.75rem);
          font-weight: 400;
          line-height: 1.2;
          margin-bottom: 1.25rem;
        }
        .ap-head p {
          font-size: .88rem;
          color: var(--fg2);
          font-weight: 300;
          line-height: 1.7;
          max-width: 420px;
        }

        /* Sections */
        .ap-group {
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid var(--line);
        }
        .ap-group:last-of-type {
          border-bottom: none;
          margin-bottom: 2.5rem;
          padding-bottom: 0;
        }
        .ap-group-label {
          font-size: .65rem;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
        }

        /* Fields */
        .ap-row {
          margin-bottom: 1.5rem;
        }
        .ap-row:last-child {
          margin-bottom: 0;
        }
        .ap-label {
          display: block;
          font-size: .78rem;
          font-weight: 400;
          color: var(--fg2);
          margin-bottom: .5rem;
          letter-spacing: .01em;
        }
        .ap-hint {
          font-size: .68rem;
          color: var(--fg3);
          font-weight: 300;
          margin-left: .35rem;
        }

        /* Inputs */
        .ap-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 0;
          padding: .85rem 1rem;
          font-size: .9rem;
          color: var(--fg);
          font-family: var(--sans);
          font-weight: 300;
          outline: none;
          transition: border-color .2s;
        }
        .ap-input:focus { border-color: var(--accent); }
        .ap-input::placeholder { color: var(--fg3); }

        .ap-select {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 0;
          padding: .85rem 1rem;
          font-size: .9rem;
          color: var(--fg);
          font-family: var(--sans);
          font-weight: 300;
          outline: none;
          appearance: none;
          transition: border-color .2s;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23E8E4DD' stroke-opacity='0.2' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }
        .ap-select:focus { border-color: var(--accent); }
        .ap-select option { background: #111; color: var(--fg); }

        .ap-textarea {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 0;
          padding: .85rem 1rem;
          font-size: .9rem;
          color: var(--fg);
          font-family: var(--sans);
          font-weight: 300;
          outline: none;
          resize: none;
          min-height: 100px;
          transition: border-color .2s;
        }
        .ap-textarea:focus { border-color: var(--accent); }
        .ap-textarea::placeholder { color: var(--fg3); }

        /* Chips */
        .ap-chips {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
        }
        .ap-chip {
          padding: .6rem 1.1rem;
          border: 1px solid var(--input-border);
          border-radius: 0;
          font-size: .8rem;
          font-weight: 400;
          color: var(--fg2);
          background: transparent;
          cursor: pointer;
          transition: all .2s;
          font-family: var(--sans);
        }
        .ap-chip:hover {
          border-color: var(--fg3);
          color: var(--fg);
        }
        .ap-chip.on {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(198,169,108,.06);
        }

        /* Toggles */
        .ap-toggles {
          display: flex;
          gap: .5rem;
        }
        .ap-tog {
          flex: 1;
          padding: .7rem;
          border: 1px solid var(--input-border);
          border-radius: 0;
          font-size: .85rem;
          font-weight: 400;
          color: var(--fg2);
          background: transparent;
          cursor: pointer;
          transition: all .2s;
          text-align: center;
          font-family: var(--sans);
        }
        .ap-tog:hover {
          border-color: var(--fg3);
        }
        .ap-tog.on {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(198,169,108,.06);
        }

        /* Split row */
        .ap-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .75rem;
        }

        /* Submit */
        .ap-submit {
          width: 100%;
          padding: 1rem;
          background: var(--fg);
          color: var(--bg);
          font-family: var(--sans);
          font-size: .82rem;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          border: none;
          border-radius: 0;
          cursor: pointer;
          transition: all .25s;
        }
        .ap-submit:hover:not(:disabled) {
          background: var(--accent);
        }
        .ap-submit:disabled {
          opacity: .2;
          cursor: not-allowed;
        }

        .ap-error {
          padding: .75rem 1rem;
          border: 1px solid var(--input-border);
          font-size: .82rem;
          color: var(--fg2);
          margin-bottom: 2rem;
        }

        .ap-spin {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(6,6,6,.15);
          border-top-color: var(--bg);
          border-radius: 50%;
          animation: spin .5s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ap-in {
          animation: aUp .5s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes aUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 500px) {
          .ap-split { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ap">
        <div className="ap-wrap ap-in">

          <nav className="ap-nav">
            <Link href="/" className="ap-nav-back">&larr; Back</Link>
            <div className="ap-nav-logo">PARTIES</div>
          </nav>

          <div className="ap-head">
            <h1>Apply for Membership</h1>
            <p>Applications are reviewed privately. Approval is not guaranteed.</p>
          </div>

          {error && <div className="ap-error">{error}</div>}

          {/* Personal */}
          <div className="ap-group">
            <div className="ap-group-label">About You</div>

            <div className="ap-row">
              <label className="ap-label">Full Name</label>
              <input className="ap-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className="ap-row">
              <label className="ap-label">Email</label>
              <input className="ap-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>

            <div className="ap-split ap-row">
              <div>
                <label className="ap-label">Phone</label>
                <input className="ap-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="ap-label">Instagram <span className="ap-hint">recommended</span></label>
                <input className="ap-input" type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
              </div>
            </div>

            <div className="ap-row">
              <label className="ap-label">Where are you based?</label>
              <select className="ap-select" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="" disabled>Select city</option>
                {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="ap-group">
            <div className="ap-group-label">Lifestyle</div>

            <div className="ap-row">
              <label className="ap-label">What are you into?</label>
              <div className="ap-chips">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button key={opt} type="button" className={`ap-chip${experiences.includes(opt) ? " on" : ""}`} onClick={() => toggleExperience(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-row">
              <label className="ap-label">Monthly spend on experiences?</label>
              <div className="ap-chips">
                {SPEND_OPTIONS.map((opt) => (
                  <button key={opt} type="button" className={`ap-chip${spend === opt ? " on" : ""}`} onClick={() => setSpend(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-row">
              <label className="ap-label">Used a concierge service before?</label>
              <div className="ap-toggles">
                <button type="button" className={`ap-tog${conciergeExp === true ? " on" : ""}`} onClick={() => setConciergeExp(true)}>Yes</button>
                <button type="button" className={`ap-tog${conciergeExp === false ? " on" : ""}`} onClick={() => setConciergeExp(false)}>No</button>
              </div>
            </div>

            <div className="ap-row">
              <label className="ap-label">Anything else? <span className="ap-hint">optional</span></label>
              <textarea className="ap-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell us what you're looking for..." />
            </div>
          </div>

          <button className="ap-submit" disabled={!canSubmit || loading} onClick={handleSubmit}>
            {loading ? <span className="ap-spin" /> : "Request Access"}
          </button>

        </div>
      </div>
    </>
  );
}
