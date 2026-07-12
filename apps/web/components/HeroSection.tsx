"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gpu-gradient">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Zap className="h-4 w-4" />
            <span>Open Source & Community Driven</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            The Open Source{" "}
            <span className="text-gradient">GPU Cloud</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
            Rent powerful GPUs on demand for AI, ML, rendering, and compute
            workloads. Or earn money by sharing your idle GPU power with the
            world.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/gpus"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              Browse GPUs
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/provider"
              className="btn-outline inline-flex items-center gap-2 border-white/20 px-8 py-4 text-lg text-white hover:bg-white/10"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
