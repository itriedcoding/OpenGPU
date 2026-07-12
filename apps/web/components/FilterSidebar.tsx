"use client";

interface FilterSidebarProps {
  filters: {
    brand: string;
    minVram: number;
    maxPrice: number;
    availability: string;
  };
  onChange: (filters: FilterSidebarProps["filters"]) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  return (
    <div className="glass-panel p-6 space-y-6">
      <h3 className="font-semibold text-foreground">Filters</h3>

      <div>
        <label className="text-sm font-medium text-foreground">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => onChange({ ...filters, brand: e.target.value })}
          className="input-field mt-2 text-sm"
        >
          <option value="">All Brands</option>
          <option value="NVIDIA">NVIDIA</option>
          <option value="AMD">AMD</option>
          <option value="Intel">Intel</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Min VRAM: {filters.minVram > 0 ? `${filters.minVram}GB+` : "Any"}
        </label>
        <input
          type="range"
          min={0}
          max={80}
          step={8}
          value={filters.minVram}
          onChange={(e) => onChange({ ...filters, minVram: Number(e.target.value) })}
          className="w-full mt-2 accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Any</span>
          <span>80GB+</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Max Price: {filters.maxPrice < 10 ? `≤$${filters.maxPrice.toFixed(2)}/hr` : "Any"}
        </label>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full mt-2 accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$0.50</span>
          <span>$10+</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Availability</label>
        <div className="mt-2 space-y-2">
          {[
            { value: "", label: "All" },
            { value: "available", label: "Available" },
            { value: "limited", label: "Limited" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="radio"
                name="availability"
                value={opt.value}
                checked={filters.availability === opt.value}
                onChange={(e) => onChange({ ...filters, availability: e.target.value })}
                className="accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => onChange({ brand: "", minVram: 0, maxPrice: 10, availability: "" })}
        className="w-full btn-outline text-sm py-2"
      >
        Reset Filters
      </button>
    </div>
  );
}
