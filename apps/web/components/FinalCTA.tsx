import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="section-heading text-foreground">
          Ready to Get <span className="text-gradient">Started</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Join thousands of developers and researchers using OpenGPU for their
          compute workloads.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/docs"
            className="btn-outline inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
