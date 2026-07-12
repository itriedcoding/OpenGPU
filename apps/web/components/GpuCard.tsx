"use client";

import Link from "next/link";
import { Gpu } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Star, MapPin, Zap, ArrowRight } from "lucide-react";

interface GpuCardProps {
  gpu: Gpu;
  viewMode?: "grid" | "list";
}

export function GpuCard({ gpu, viewMode = "grid" }: GpuCardProps) {
  const availabilityColor =
    gpu.availability === "available"
      ? "bg-green-400"
      : gpu.availability === "limited"
      ? "bg-yellow-400"
      : "bg-red-400";

  const availabilityText =
    gpu.availability === "available"
      ? "Available"
      : gpu.availability === "limited"
      ? "Limited"
      : "Unavailable";

  if (viewMode === "list") {
    return (
      <Link
        href={`/gpus/${gpu.id}`}
        className="glass-panel p-4 card-hover flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          {gpu.brand === "NVIDIA" ? "N" : "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{gpu.name}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              gpu.availability === "available" ? "bg-green-500/10 text-green-400" :
              gpu.availability === "limited" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-red-500/10 text-red-400"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${availabilityColor}`} />
              {availabilityText}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{gpu.vram}GB {gpu.vramType}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{gpu.location}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{gpu.provider.rating}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{formatCurrency(gpu.pricePerHour)}</div>
            <div className="text-xs text-muted-foreground">/hour</div>
          </div>
          <span className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1">
            Rent <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/gpus/${gpu.id}`}
      className="glass-panel p-5 card-hover group flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
          {gpu.brand === "NVIDIA" ? "N" : "A"}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          gpu.availability === "available" ? "bg-green-500/10 text-green-400" :
          gpu.availability === "limited" ? "bg-yellow-500/10 text-yellow-400" :
          "bg-red-500/10 text-red-400"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${availabilityColor}`} />
          {availabilityText}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {gpu.name}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{gpu.vram}GB {gpu.vramType}</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{gpu.provider.rating}</span>
        <span>·</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{gpu.location.split(" ")[0]}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {gpu.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-end justify-between border-t border-border/50 mt-4">
        <div>
          <span className="text-xl font-bold text-foreground">{formatCurrency(gpu.pricePerHour)}</span>
          <span className="text-xs text-muted-foreground">/hour</span>
        </div>
        <span className="text-xs text-muted-foreground">{gpu.provider.name}</span>
      </div>
    </Link>
  );
}
