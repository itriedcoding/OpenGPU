import Link from "next/link";
import { mockGpus } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Star } from "lucide-react";

export function GpuShowcase() {
  const featuredGpus = mockGpus.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="section-heading text-foreground">
            Popular <span className="text-gradient">GPUs</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with the most popular GPUs on our platform.
          </p>
        </div>
        <Link
          href="/gpus"
          className="hidden items-center gap-2 text-primary hover:text-primary-400 sm:flex"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredGpus.map((gpu) => (
          <Link
            key={gpu.id}
            href={`/gpus/${gpu.id}`}
            className="glass-panel p-6 card-hover group"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {gpu.brand === "NVIDIA" ? "N" : "A"}
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  gpu.availability === "available"
                    ? "bg-green-500/10 text-green-400"
                    : gpu.availability === "limited"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  gpu.availability === "available" ? "bg-green-400" :
                  gpu.availability === "limited" ? "bg-yellow-400" : "bg-red-400"
                }`} />
                {gpu.availability === "available" ? "Available" :
                 gpu.availability === "limited" ? "Limited" : "Unavailable"}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {gpu.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{gpu.vram}GB {gpu.vramType}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{gpu.provider.rating}</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(gpu.pricePerHour)}
                </span>
                <span className="text-sm text-muted-foreground">/hour</span>
              </div>
              <span className="btn-primary text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Rent Now
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center sm:hidden">
        <Link href="/gpus" className="btn-primary inline-flex items-center gap-2">
          View All GPUs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
