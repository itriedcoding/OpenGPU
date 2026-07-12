"use client";

import { useState, useMemo } from "react";
import { mockGpus } from "@/lib/mock-data";
import { GpuCard } from "@/components/GpuCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";

export default function GpuMarketplace() {
  const [filters, setFilters] = useState({
    brand: "",
    minVram: 0,
    maxPrice: 10,
    availability: "",
  });
  const [sortBy, setSortBy] = useState<"price" | "performance" | "rating">("price");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredGpus = useMemo(() => {
    let gpus = [...mockGpus];

    if (filters.brand) gpus = gpus.filter((g) => g.brand === filters.brand);
    if (filters.minVram > 0) gpus = gpus.filter((g) => g.vram >= filters.minVram);
    if (filters.maxPrice < 10) gpus = gpus.filter((g) => g.pricePerHour <= filters.maxPrice);
    if (filters.availability) gpus = gpus.filter((g) => g.availability === filters.availability);

    switch (sortBy) {
      case "price":
        gpus.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "performance":
        gpus.sort((a, b) => b.performance.fp16 - a.performance.fp16);
        break;
      case "rating":
        gpus.sort((a, b) => b.provider.rating - a.provider.rating);
        break;
    }

    return gpus;
  }, [filters, sortBy]);

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
              {filteredGpus.length} GPU{filteredGpus.length !== 1 ? "s" : ""} found
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

          {filteredGpus.length === 0 ? (
            <div className="text-center py-16">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No GPUs found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters.</p>
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
