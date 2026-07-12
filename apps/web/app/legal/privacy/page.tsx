import { DocsLayout } from "@/components/DocsLayout";

export default function PrivacyPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 15, 2024</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly: name, email address, payment information,
            and account preferences. We automatically collect usage data including IP address, browser
            type, pages visited, and interaction patterns. We also collect device information and
            logs related to GPU usage, rental duration, and performance metrics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Information</h2>
          <p>
            We use your information to provide, maintain, and improve the Service; process transactions
            and send related information; send technical notices, updates, and support messages;
            respond to comments and questions; and monitor usage trends and preferences. We use
            aggregate, anonymized data for analytics and to improve our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with third-party service
            providers who perform services on our behalf (payment processing, hosting, analytics). We
            may also share information when required by law, to protect our rights, or in connection
            with a merger, acquisition, or sale of assets.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Cookies</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your preferences,
            and analyze usage patterns. Essential cookies are required for the Service to function.
            Analytics cookies help us understand how users interact with our platform. You can manage
            cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS 1.3)
            and at rest (AES-256), regular security audits, access controls, and monitoring. However,
            no method of transmission or storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
          <p>
            We retain your account information for as long as your account is active. Rental history
            and usage data are retained for 24 months. Financial records are retained for 7 years
            as required by law. You may request deletion of your data at any time, subject to
            legal retention requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights (GDPR)</h2>
          <p>
            If you are in the European Economic Area, you have the right to access, correct, or delete
            your personal data; data portability; object to processing; and withdraw consent. Contact
            us at privacy@opengpu.io to exercise these rights. We respond to requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have the right to know what personal information we
            collect, delete your personal information, opt out of the sale of personal information
            (we do not sell), and not be discriminated against for exercising your rights. Contact
            us at privacy@opengpu.io.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for children under 16. We do not knowingly collect personal
            information from children. If you believe we have collected information from a child,
            please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Information</h2>
          <p>
            For privacy-related inquiries, contact us at: privacy@opengpu.io or OpenGPU Inc.,
            123 Innovation Drive, Wilmington, DE 19801, United States.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
