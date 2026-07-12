"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchGpuById, startRental } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { Gpu } from "@/lib/types";
import { ArrowLeft, Star, MapPin, Zap, Shield, Cpu, Wifi, Thermometer, Loader2 } from "lucide-react";
import Link from "next/link";

export default function GpuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [gpu, setGpu] = useState<Gpu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(1);
  const [durationUnit, setDurationUnit] = useState<"hours" | "days" | "months">("hours");
  const [renting, setRenting] = useState(false);
  const [rentalError, setRentalError] = useState("");

  useEffect(() => {
    if (params.id) {
      loadGpu(params.id as string);
    }
  }, [params.id]);

  async function loadGpu(id: string) {
    try {
      setLoading(true);
      const data = await fetchGpuById(id);
      setGpu(data);
    } catch (err: any) {
      setError(err.message || "GPU not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleRent() {
    if (!isAuthenticated || !token || !gpu) {
      router.push("/auth/signin");
      return;
    }

    try {
      setRenting(true);
      setRentalError("");
      const durationHours = durationUnit === "hours" ? duration : durationUnit === "days" ? duration * 24 : duration * 24 * 30;
      await startRental(gpu.id, token, durationHours);
      router.push("/dashboard");
    } catch (err: any) {
      setRentalError(err.message || "Failed to start rental");
    } finally {
      setRenting(false);
    }
  }

  const getTotalCost = () => {
    if (!gpu) return 0;
    switch (durationUnit) {
      case "hours": return gpu.pricePerHour * duration;
      case "days": return gpu.pricePerHour * 24 * duration;
      case "months": return (gpu.pricePerMonth || gpu.pricePerHour * 24 * 30) * duration;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading GPU details...</p>
      </div>
    );
  }

  if (error || !gpu) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{error || "GPU not found."}</p>
        <Link href="/gpus" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: Cpu, label: "CUDA Cores", value: (gpu.specs?.cores || 0).toLocaleString() },
    { icon: Zap, label: "Boost Clock", value: gpu.specs?.boostClock || "N/A" },
    { icon: Thermometer, label: "TDP", value: gpu.specs?.tdp || "N/A" },
    { icon: Wifi, label: "Interface", value: gpu.specs?.interface || "N/A" },
    { icon: Thermometer, label: "Cooling", value: gpu.specs?.cooling || "N/A" },
    { icon: Wifi, label: "Network", value: gpu.specs?.networkSpeed || "N/A" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/gpus" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {gpu.brand === "NVIDIA" ? "N" : gpu.brand === "AMD" ? "A" : "I"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{gpu.name}</h1>
                    <p className="text-sm text-muted-foreground">{gpu.brand} · {gpu.vram}GB {gpu.vramType}</p>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                gpu.status === "available" || gpu.availability === "available" ? "bg-green-500/10 text-green-400" :
                gpu.status === "limited" || gpu.availability === "limited" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-red-500/10 text-red-400"
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  gpu.status === "available" || gpu.availability === "available" ? "bg-green-400" :
                  gpu.status === "limited" || gpu.availability === "limited" ? "bg-yellow-400" : "bg-red-400"
                }`} />
                {gpu.status === "available" || gpu.availability === "available" ? "Available Now" :
                 gpu.status === "limited" || gpu.availability === "limited" ? "Limited Availability" : "Unavailable"}
              </span>
            </div>
            {gpu.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{gpu.description}</p>
            )}
            {gpu.tags && gpu.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {gpu.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <spec.icon className="h-3 w-3" />
                    {spec.label}
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {gpu.performance && (
            <div className="glass-panel p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Performance Benchmarks</h2>
              <div className="space-y-4">
                {[
                  { label: "FP32 (Single Precision)", value: gpu.performance.fp32 || 0, max: 200 },
                  { label: "FP16 (Half Precision)", value: gpu.performance.fp16 || 0, max: 1000 },
                  { label: "TF32 (TensorFloat)", value: gpu.performance.tf32 || 0, max: 1000 },
                ].map((bench) => (
                  <div key={bench.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{bench.label}</span>
                      <span className="font-medium text-foreground">{bench.value} TFLOPS</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((bench.value / bench.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-foreground mb-4">Rent This GPU</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-foreground">{formatCurrency(gpu.pricePerHour)}</div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
              {rentalError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {rentalError}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="input-field text-sm"
                    />
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as typeof durationUnit)}
                      className="input-field text-sm w-28"
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatCurrency(getTotalCost())}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Service fee (5%)</span>
                    <span className="font-medium text-foreground">{formatCurrency(getTotalCost() * 0.05)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-foreground">{formatCurrency(getTotalCost() * 1.05)}</span>
                  </div>
                </div>
                <button
                  onClick={handleRent}
                  disabled={renting || (gpu.status !== "available" && gpu.availability !== "available")}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {renting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Starting...
                    </span>
                  ) : (
                    "Rent Now"
                  )}
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Link href="/auth/signin" className="text-primary hover:text-primary-400">Sign in</Link> to rent GPUs
                  </p>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-semibold text-foreground mb-3">Provider</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {gpu.provider?.name?.[0] || "P"}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{gpu.provider?.name || "Unknown Provider"}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {gpu.provider?.rating || 0} · {gpu.provider?.totalRentals || 0} rentals
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {gpu.location}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-semibold text-foreground mb-3">Includes</h3>
              <ul className="space-y-2">
                {["Dedicated GPU instance", "SSH access", "10 Gbps+ network", "24/7 monitoring", "Instant provisioning"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
