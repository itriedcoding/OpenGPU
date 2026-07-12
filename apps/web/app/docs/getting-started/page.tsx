import { DocsLayout } from "@/components/DocsLayout";

export default function GettingStartedPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-6">Getting Started</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">What is OpenGPU?</h2>
        <p className="text-muted-foreground leading-relaxed">
          OpenGPU is an open source GPU cloud marketplace that connects GPU owners (providers) with
          developers and researchers who need compute power (renters). Our platform enables you to
          rent GPUs on demand or earn money by sharing your idle GPU hardware.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Prerequisites</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>A compatible NVIDIA or AMD GPU (RTX 3090 or newer recommended)</li>
          <li>Linux (Ubuntu 20.04+), macOS, or Windows with WSL2</li>
          <li>Node.js 18+ installed</li>
          <li>Stable internet connection (10+ Mbps recommended)</li>
          <li>An OpenGPU account (free to create)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Your First GPU Rental</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Create an Account", desc: "Sign up at opengpu.io. No credit card required for the free tier." },
            { step: "2", title: "Browse the Marketplace", desc: "Visit the GPU Marketplace to find the perfect GPU for your workload." },
            { step: "3", title: "Select and Rent", desc: "Choose your GPU, set the rental duration, and click Rent Now." },
            { step: "4", title: "Connect via SSH", desc: "Use the provided SSH credentials to connect to your GPU instance." },
            { step: "5", title: "Start Computing", desc: "Install your frameworks and start your AI/ML workload." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {item.step}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">As a Provider</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Want to earn money with your idle GPUs? Follow these steps:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Install the OpenGPU agent on your machine</li>
          <li>Run <code className="rounded bg-muted px-1.5 py-0.5 text-sm">opengpu init</code> to configure your node</li>
          <li>Select which GPUs to share and set your pricing</li>
          <li>Start the agent and your GPUs join the marketplace</li>
          <li>Receive weekly payouts directly to your bank account</li>
        </ol>
      </section>

      <section className="glass-panel p-6 bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground">
          Join our Discord community for real-time support, or check out the FAQ section.
        </p>
      </section>
    </DocsLayout>
  );
}
