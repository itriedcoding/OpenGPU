import { UserPlus, Monitor, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up",
    description: "Create your free account in seconds. No credit card required to get started.",
  },
  {
    icon: Monitor,
    step: "02",
    title: "Choose GPU",
    description: "Browse our marketplace and select the perfect GPU for your workload and budget.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Start Computing",
    description: "Connect via SSH or API and start your compute workload immediately.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-heading text-foreground">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Get up and running in three simple steps.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="absolute -top-2 -right-2 text-6xl font-bold text-primary/10">
                {step.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-muted-foreground">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
