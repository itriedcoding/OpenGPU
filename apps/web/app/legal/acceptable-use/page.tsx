import { DocsLayout } from "@/components/DocsLayout";

export default function AcceptableUsePage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-2">Acceptable Use Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 15, 2024</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Overview</h2>
          <p>
            This Acceptable Use Policy (&quot;AUP&quot;) describes prohibited uses of the OpenGPU platform.
            This policy is designed to protect the OpenGPU platform, its users, and the broader
            internet community. Violations may result in suspension or termination of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Prohibited Uses</h2>
          <p className="mb-3">You may not use OpenGPU for any of the following purposes:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Cryptocurrency mining or blockchain operations unless explicitly authorized by OpenGPU in writing</li>
            <li>Activities that violate any applicable law, regulation, or government order</li>
            <li>Distribution of malware, viruses, or other malicious software</li>
            <li>Unauthorized access to computer systems, networks, or data</li>
            <li>Denial-of-service attacks or traffic amplification attacks</li>
            <li>Operating open proxies, relays, or anonymization services</li>
            <li>Sending unsolicited bulk messages (spam)</li>
            <li>Hosting or distributing content that is illegal, harmful, or violates the rights of others</li>
            <li>Any activity that could damage, disable, or impair the Service</li>
            <li>Impersonating any person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. GPU Usage Guidelines</h2>
          <p className="mb-3">When using rented GPUs, you must:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Use GPUs only for legitimate computational workloads</li>
            <li>Properly terminate sessions when workloads are complete</li>
            <li>Not attempt to access or interfere with other users&apos; workloads</li>
            <li>Not attempt to circumvent resource limits or security measures</li>
            <li>Not run persistent background services without authorization</li>
            <li>Comply with all software license agreements for frameworks and tools you install</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Content Policies</h2>
          <p>
            You may not use OpenGPU to store, process, or transmit content that is illegal, harmful,
            threatening, abusive, harassing, defamatory, or otherwise objectionable. This includes
            but is not limited to content that promotes violence, discrimination, or illegal
            activities. You may not use the Service to generate deepfakes or misleading synthetic media.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Network Usage</h2>
          <p>
            You may not use the Service for network scanning, port scanning, vulnerability scanning,
            or penetration testing against any system without explicit written authorization. You may
            not generate excessive traffic that degrades Service performance or disrupts other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Enforcement</h2>
          <p>
            OpenGPU reserves the right to investigate and take appropriate action against anyone who
            violates this policy. Actions may include: warning the user, temporary suspension of
            access, permanent termination of account, and reporting to law enforcement authorities.
            We may take action without prior notice for severe or repeated violations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Reporting Violations</h2>
          <p>
            If you become aware of any violation of this policy, please report it to
            abuse@opengpu.io. We will investigate all reports promptly and take appropriate action.
          </p>
        </section>

        <section className="glass-panel p-6 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">Zero Tolerance</h3>
          <p className="text-sm">
            OpenGPU maintains a zero-tolerance policy for activities that threaten the security or
            integrity of our platform or its users. Immediate account termination may occur for
            severe violations.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
