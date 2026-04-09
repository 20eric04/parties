import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Parties",
  description: "Terms of Service for the Parties luxury concierge platform.",
};

export default function TermsOfService() {
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
        <h1 className="font-display text-4xl italic text-white mb-3">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-16">Effective Date: April 1, 2026</p>

        {/* Sections */}
        <div className="space-y-14">
          <Section title="1. Service Description">
            <p>
              Parties (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a luxury concierge and lifestyle membership platform that provides access to curated venue bookings, VIP table reservations, restaurant reservations, private car services, jet charters, hotel accommodations, and related hospitality experiences (&ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing or using the Parties application, website, or any of our Services, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use our Services.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years of age and capable of entering into a legally binding agreement to use our Services. By creating an account, you represent and warrant that you meet these requirements.
            </p>
          </Section>

          <Section title="3. Membership Terms">
            <p>
              Access to Parties is membership-based. Membership is granted on an application basis and is subject to approval at our sole discretion. We reserve the right to decline or revoke membership at any time without providing a reason.
            </p>
            <p>
              Membership fees, if applicable, will be communicated during the application process. Fees are non-refundable unless otherwise stated. Membership is personal and non-transferable — you may not share your account credentials or allow others to use your account.
            </p>
          </Section>

          <Section title="4. Booking and Payment Terms">
            <p>
              All bookings made through Parties are subject to availability and confirmation by the relevant venue or service provider. We act as an intermediary and do not guarantee availability.
            </p>
            <p>
              Payments are processed securely through Stripe, a PCI-compliant third-party payment processor. By making a payment, you agree to Stripe&rsquo;s terms of service in addition to these Terms.
            </p>
            <p>
              <strong className="text-white/90">Cancellation Policy:</strong> Cancellations must be made at least 48 hours before the scheduled booking. Late cancellations or no-shows may incur charges up to the full booking amount. Specific cancellation terms may vary by venue or service and will be disclosed at the time of booking.
            </p>
            <p>
              <strong className="text-white/90">Refunds:</strong> Refunds are evaluated on a case-by-case basis. If a service is not delivered as confirmed, you may request a refund by contacting our support team. Processing times for approved refunds are typically 5&ndash;10 business days.
            </p>
          </Section>

          <Section title="5. User Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>Provide false, misleading, or fraudulent information during registration or booking</li>
              <li>Use the Services for any unlawful purpose</li>
              <li>Misrepresent your identity, affiliation, or membership status</li>
              <li>Interfere with or disrupt the platform, servers, or networks</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Resell, sublicense, or commercially exploit your access to the platform</li>
            </ul>
            <p>
              Violation of these terms may result in immediate suspension or termination of your membership without refund.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content, trademarks, logos, designs, and software associated with Parties are our exclusive property or the property of our licensors. You may not reproduce, distribute, modify, or create derivative works from any content on our platform without prior written consent.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Parties and its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Services.
            </p>
            <p>
              Our total liability for any claim related to the Services shall not exceed the amount you paid to Parties in the twelve (12) months preceding the claim. We do not guarantee uninterrupted or error-free operation of our platform.
            </p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>
              Our platform may integrate with or link to third-party services, including but not limited to Stripe for payment processing and various venue and hospitality partners. We are not responsible for the practices, content, or availability of third-party services.
            </p>
          </Section>

          <Section title="9. Dispute Resolution">
            <p>
              Any disputes arising from or relating to these Terms or your use of the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration will take place in Miami, Florida, unless otherwise agreed.
            </p>
            <p>
              You agree to waive any right to participate in a class action lawsuit or class-wide arbitration. This arbitration agreement does not preclude either party from seeking injunctive relief in court for matters related to intellectual property or data security.
            </p>
          </Section>

          <Section title="10. Modifications to Terms">
            <p>
              We reserve the right to update or modify these Terms at any time. Changes will be effective upon posting to the platform. Continued use of the Services after modifications constitutes acceptance of the updated Terms. For material changes, we will make reasonable efforts to notify you via email or in-app notification.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your access to the Services at our discretion, with or without notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Services ceases immediately.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law principles.
            </p>
          </Section>

          <Section title="13. Contact Information">
            <p>
              For questions or concerns regarding these Terms, please contact us at:
            </p>
            <p className="text-parties-accent">legal@parties.com</p>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>&copy; 2026 Parties. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">
              Privacy Policy
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
