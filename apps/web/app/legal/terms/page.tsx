import { DocsLayout } from "@/components/DocsLayout";

export default function TermsPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 15, 2024</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the OpenGPU platform (&quot;Service&quot;), you agree to be bound by these
            Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            OpenGPU reserves the right to modify these Terms at any time. Continued use of the Service
            after changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. User Accounts</h2>
          <p>
            You must create an account to use the Service. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities under your account.
            You must provide accurate and complete information during registration and keep it updated.
            You must be at least 18 years old to create an account. One person may not maintain more
            than one account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. GPU Rental Terms</h2>
          <p>
            GPU rentals are billed on a pay-per-use basis at the rates displayed at the time of rental.
            Rental periods begin when the GPU instance is provisioned and end when terminated by the user.
            Users are responsible for properly shutting down workloads to avoid unnecessary charges.
            OpenGPU does not guarantee GPU availability and reserves the right to revoke access for
            violation of these Terms or the Acceptable Use Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Payment Terms</h2>
          <p>
            All payments are processed through our third-party payment processor. You agree to pay all
            charges incurred under your account at the prices in effect when charged. Charges are
            non-refundable except as required by law or as expressly stated in these Terms. OpenGPU
            reserves the right to suspend or terminate access for non-payment. Late payments may incur
            a 1.5% monthly interest charge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Provider Obligations</h2>
          <p>
            Providers must maintain their GPU hardware in good working condition with a minimum 95%
            uptime SLA. Providers are responsible for all costs associated with their hardware,
            electricity, and internet connectivity. OpenGPU charges a 15% platform fee on all provider
            earnings. Providers must comply with all applicable laws and regulations in their jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. User Obligations</h2>
          <p>
            Users must use GPUs in compliance with the Acceptable User Policy. Users may not use rented
            GPUs for illegal activities, cryptocurrency mining (unless explicitly permitted), or any
            purpose that violates applicable law. Users are responsible for all data stored on or
            transmitted through rented GPU instances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
          <p>
            Users retain all rights to their code, data, and models. OpenGPU claims no ownership over
            user content. The OpenGPU platform, including its software, design, and documentation, is
            protected by copyright and open source licenses. Users may not copy, modify, or distribute
            OpenGPU&apos;s proprietary technology without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
          <p>
            OpenGPU shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages, including but not limited to loss of profits, data, or business
            opportunities. Our total liability shall not exceed the amount paid by you in the twelve
            (12) months preceding the claim. The Service is provided &quot;as is&quot; without warranties
            of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
          <p>
            Either party may terminate this agreement at any time. OpenGPU may suspend or terminate
            your access immediately for violation of these Terms, non-payment, or conduct that OpenGPU
            reasonably believes is harmful to the Service or other users. Upon termination, your right
            to use the Service ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to conflict of law principles. Any disputes shall be resolved through binding
            arbitration under the rules of the American Arbitration Association, with proceedings held
            in Wilmington, Delaware.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
