"use client";

import { useState, useEffect } from "react";
import { GpuCard } from "@/components/GpuCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react";
import { fetchGPUs } from "@/lib/api";
import { Gpu } from "@/lib/types";

export default function GpuMarketplace() {
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    minVram: 0,
    maxPrice: 10,
    availability: "",
  });
  const [sortBy, setSortBy] = useState<"price" | "performance" | "rating">("price");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadGPUs();
  }, []);

  async function loadGPUs() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchGPUs();
      setGpus(data);
    } catch (err: any) {
      setError(err.message || "Failed to load GPUs");
    } finally {
      setLoading(false);
    }
  }

  const filteredGpus = gpus
    .filter((g) => !filters.brand || g.brand === filters.brand)
    .filter((g) => filters.minVram <= 0 || g.vram >= filters.minVram)
    .filter((g) => filters.maxPrice >= 10 || g.pricePerHour <= filters.maxPrice)
    .filter((g) => !filters.availability || g.availability === filters.availability || g.status === filters.availability)
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return a.pricePerHour - b.pricePerHour;
        case "performance": return (b.performance?.fp16 || 0) - (a.performance?.fp16 || 0);
        case "rating": return (b.provider?.rating || 0) - (a.provider?.rating || 0);
        default: return 0;
      }
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="section-heading text-foreground">GPU Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and rent GPUs from providers worldwide.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredGpus.length} GPU${filteredGpus.length !== 1 ? "s" : ""} found`}
            </p>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input-field w-auto text-sm py-2"
              >
                <option value="price">Sort by Price</option>
                <option value="performance">Sort by Performance</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading GPUs from the network...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Failed to load GPUs</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <button onClick={loadGPUs} className="btn-primary mt-4 text-sm px-4 py-2">
                Retry
              </button>
            </div>
          ) : filteredGpus.length === 0 ? (
            <div className="text-center py-16">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No GPUs found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters, or check back later as providers join the network.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            }`}>
              {filteredGpus.map((gpu) => (
                <GpuCard key={gpu.id} gpu={gpu} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
