import { Code, CreditCard, Globe, Shield } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Open Source",
    description:
      "Fully transparent platform built in the open. Inspect the code, contribute, and help shape the future of GPU computing.",
  },
  {
    icon: CreditCard,
    title: "Pay Per Hour",
    description:
      "Only pay for what you use. No long-term contracts or hidden fees. Start computing for as little as $0.35/hour.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description:
      "Access GPUs distributed across 20+ data centers worldwide. Choose the location closest to you for minimal latency.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant infrastructure with end-to-end encryption, secure boot, and isolated environments for every workload.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="section-heading text-foreground">
          Built for the <span className="text-gradient">Future</span> of Computing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Everything you need to rent, share, and manage GPU compute resources
          in one powerful platform.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-panel p-6 card-hover"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
