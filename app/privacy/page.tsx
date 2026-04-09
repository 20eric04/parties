import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Parties",
  description: "Privacy Policy for the Parties luxury concierge platform.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-parties-bg text-white">
      <div className="max-w-2xl mx-auto px-6 py-16 pb-24">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mb-12"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back
        </Link>

        {/* Disclaimer */}
        <div className="mb-10 px-4 py-3 border border-white/10 rounded-xl bg-white/[0.02]">
          <p className="text-xs text-white/40 leading-relaxed">
            This document is a template and does not constitute legal advice. Please have it reviewed by qualified legal counsel before relying on it.
          </p>
        </div>

        {/* Header */}
        <h1 className="font-display text-4xl italic text-white mb-3">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-16">Effective Date: April 1, 2026</p>

        {/* Sections */}
        <div className="space-y-14">
          <Section title="1. Introduction">
            <p>
              Parties (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our luxury concierge and lifestyle membership platform, including our mobile application and website (collectively, the &ldquo;Platform&rdquo;).
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="text-white/80 font-medium mt-2 mb-2">Personal Information</h3>
            <p>When you create an account or use our Services, we may collect:</p>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>Full name, email address, and phone number</li>
              <li>Instagram handle and social media identifiers</li>
              <li>City preferences and location data</li>
              <li>Budget and spending preferences</li>
              <li>Profile photos and biographical information</li>
            </ul>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Payment Information</h3>
            <p>
              Payment details (credit card numbers, billing addresses) are collected and processed directly by Stripe, our PCI-compliant payment processor. We do not store your full payment card information on our servers.
            </p>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Usage Data</h3>
            <p>We automatically collect information about how you interact with the Platform, including:</p>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>Pages visited, features used, and search queries</li>
              <li>Booking history and preferences</li>
              <li>Session duration and frequency of use</li>
            </ul>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Device Information</h3>
            <p>We may collect information about your device, including device type, operating system, unique device identifiers, browser type, and IP address.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>Provide, maintain, and improve our Services</li>
              <li>Process bookings, reservations, and payments</li>
              <li>Personalize your experience and recommend relevant venues and services</li>
              <li>Communicate with you about bookings, updates, and promotions</li>
              <li>Send push notifications with your consent (booking confirmations, offers, updates)</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve the Platform</li>
            </ul>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We do not sell your personal information. We may share your data with the following parties:</p>

            <h3 className="text-white/80 font-medium mt-4 mb-2">Payment Processing</h3>
            <p>
              We share necessary transaction data with Stripe to process payments securely. Stripe&rsquo;s handling of your data is governed by their own privacy policy.
            </p>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Data Infrastructure</h3>
            <p>
              We use Supabase for backend data storage and authentication. Your data is stored securely in Supabase-managed infrastructure with encryption at rest and in transit.
            </p>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Venue and Service Partners</h3>
            <p>
              When you make a booking, we share relevant details (name, party size, special requests) with the venue or service provider to fulfill your reservation. We only share what is necessary to complete the booking.
            </p>

            <h3 className="text-white/80 font-medium mt-6 mb-2">Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, subpoena, or other legal process, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you with our Services. If you close your account, we will delete or anonymize your personal data within 90 days, unless retention is required by law or for legitimate business purposes (such as resolving disputes or enforcing agreements).
            </p>
            <p>
              Payment records may be retained for up to seven years to comply with financial regulations.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li><strong className="text-white/80">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white/80">Correction:</strong> Request that we update inaccurate or incomplete information</li>
              <li><strong className="text-white/80">Deletion:</strong> Request that we delete your personal data, subject to certain exceptions</li>
              <li><strong className="text-white/80">Portability:</strong> Request your data in a structured, machine-readable format</li>
              <li><strong className="text-white/80">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <span className="text-parties-accent">privacy@parties.com</span>. We will respond to your request within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies and Tracking">
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and deliver personalized content. You can manage your cookie preferences through your browser settings.
            </p>
            <p>
              We may use analytics tools to understand how users interact with the Platform. These tools may collect information sent by your device, including pages visited and other usage data.
            </p>
          </Section>

          <Section title="8. Push Notifications">
            <p>
              With your consent, we may send push notifications to your device regarding booking confirmations, status updates, promotional offers, and other relevant information. You can manage your notification preferences in your device settings or within the app at any time.
            </p>
          </Section>

          <Section title="9. Security Measures">
            <p>
              We implement industry-standard security measures to protect your information, including encryption in transit (TLS/SSL) and at rest, secure authentication protocols, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="10. Children&rsquo;s Privacy">
            <p>
              Our Services are intended for individuals aged 18 and older. We do not knowingly collect personal information from anyone under the age of 18. If we become aware that we have collected data from a minor, we will take steps to delete that information promptly.
            </p>
          </Section>

          <Section title="11. International Data Transfers">
            <p>
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have different data protection laws. By using our Services, you consent to the transfer of your data to these jurisdictions. We take appropriate safeguards to ensure your data remains protected in accordance with this Privacy Policy.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. For material changes, we will notify you via email or in-app notification. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="13. Contact Information">
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:
            </p>
            <p className="text-parties-accent">privacy@parties.com</p>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>&copy; 2026 Parties. All rights reserved.</span>
            <Link href="/terms" className="hover:text-white/50 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-white/90 mb-4">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-white/60">{children}</div>
    </section>
  );
}
