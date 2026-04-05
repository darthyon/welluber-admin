"use client";

import { useState } from "react";
import { 
  MapPin, 
  MagnifyingGlass, 
  Check,
  Info,
  XCircle,
  MapTrifold
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export interface LocationData {
  line: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat?: number | string;
  lon?: number | string;
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (value: LocationData) => void;
  errors?: any;
  className?: string;
}

export function LocationPicker({ value, onChange, errors, className }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleChange = (field: keyof LocationData, val: string | number) => {
    onChange({ ...value, [field]: val });
  };

  const handleMockSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API search and coordinate fetch
    setTimeout(() => {
      const mockResult: Partial<LocationData> = {
        line: searchQuery,
        city: "Kuala Lumpur",
        state: "Wilayah Persekutuan",
        postalCode: "55100",
        lat: "3.1390",
        lon: "101.7036"
      };
      
      onChange({ ...value, ...mockResult });
      setIsSearching(false);
      setSearchQuery(""); // Clear search after apply
    }, 1200);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-lg text-[14px] outline-none transition-all font-medium",
      hasError 
        ? "border-destructive ring-destructive/10 text-destructive placeholder:text-destructive/40" 
        : "border-border focus:ring-2 focus:ring-primary/10 focus:border-primary/30 hover:border-border-hover text-foreground"
    );

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
      {/* Left Column: Map Interaction */}
      <div className="space-y-4">
        <div className="relative group h-full">
          {/* Map Preview Container */}
          <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] rounded-2xl border-2 border-border bg-muted/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-primary/20">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)]" />
            
            {/* Info Icon with Tooltip (Top Right) */}
            <div className="absolute top-4 right-4 z-20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 bg-background/80 backdrop-blur border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                      <Info size={18} weight="bold" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px]">
                    <p className="text-[12px] leading-relaxed">
                      Pinned location will automatically populate the address details on the right.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Animated Pin */}
            <div className={cn(
              "flex flex-col items-center gap-2 z-10 transition-transform duration-500",
              isSearching ? "animate-bounce" : "translate-y-0"
            )}>
              <div className="relative">
                <MapPin size={48} weight="fill" className={cn(
                  "transition-colors duration-500",
                  value.lat && value.lon ? "text-primary" : "text-muted-foreground/40"
                )} />
                {value.lat && value.lon && !isSearching && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-semibold transition-colors tracking-tight",
                value.lat && value.lon ? "text-primary/70" : "text-muted-foreground/30"
              )}>
                {isSearching ? "Locating..." : (value.lat && value.lon ? "Pinned" : "No location set")}
              </span>
            </div>

            {/* Bottom Search Bar Component (Integrated into Map View) */}
            <div className="absolute bottom-4 inset-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlass size={16} className={cn(isSearching ? "text-primary animate-pulse" : "text-muted-foreground")} />
                </div>
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMockSearch())}
                  className="w-full pl-10 pr-12 py-3.5 bg-background shadow-2xl shadow-black/10 border-border border-2 rounded-xl text-[14px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={handleMockSearch}
                  disabled={!searchQuery || isSearching}
                  className="absolute right-2 top-1.5 bottom-1.5 w-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                >
                  <Check size={18} weight="bold" className={cn("transition-transform", isSearching ? "scale-0" : "scale-100")} />
                  {isSearching && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Address Fields */}
      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Street Address</label>
            <input
              value={value.line}
              onChange={(e) => handleChange("line", e.target.value)}
              placeholder="Lot 1.02, Pavilion KL"
              className={inputCls(!!errors?.line)}
            />
            {errors?.line && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <XCircle size={12} weight="fill" /> {errors.line.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">City</label>
              <input
                value={value.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Kuala Lumpur"
                className={inputCls(!!errors?.city)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Postal Code</label>
              <input
                value={value.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="55100"
                className={inputCls(!!errors?.postalCode)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">State</label>
            <select
              value={value.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className={cn(inputCls(!!errors?.state), "cursor-pointer")}
            >
              <option value="">Select State</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Selangor">Selangor</option>
              <option value="Johor">Johor</option>
              <option value="Penang">Penang</option>
              <option value="Sabah">Sabah</option>
              <option value="Sarawak">Sarawak</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-4">
           <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Latitude</label>
            <input
              value={value.lat ?? ""}
              onChange={(e) => handleChange("lat", e.target.value)}
              className={cn(inputCls(), "font-mono text-[13px]")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Longitude</label>
            <input
              value={value.lon ?? ""}
              onChange={(e) => handleChange("lon", e.target.value)}
              className={cn(inputCls(), "font-mono text-[13px]")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
