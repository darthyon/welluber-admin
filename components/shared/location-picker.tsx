"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  MagnifyingGlass,
  Check,
  Info,
  XCircle,
  CaretRight,
  NavigationArrow,
  MapTrifold,
  PencilSimple,
  X as XIcon
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { MOCK_LOCATION_SUGGESTIONS } from "@/lib/mock-data";
import { FormSelect } from "@/components/shared/form-select";

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
  errors?: Partial<Record<keyof LocationData, { message?: string }>>;
  className?: string;
}


const COUNTRIES = ["Malaysia", "Singapore", "Indonesia", "Thailand"] as const;

const POSTAL_LOOKUP: Record<string, { city: string; state: string }> = {
  "50000": { city: "Kuala Lumpur", state: "Kuala Lumpur" },
  "50050": { city: "Kuala Lumpur", state: "Kuala Lumpur" },
  "55100": { city: "Kuala Lumpur", state: "Kuala Lumpur" },
  "59200": { city: "Kuala Lumpur", state: "Kuala Lumpur" },
  "47500": { city: "Subang Jaya", state: "Selangor" },
  "47800": { city: "Petaling Jaya", state: "Selangor" },
  "40000": { city: "Shah Alam", state: "Selangor" },
  "10000": { city: "George Town", state: "Penang" },
  "11900": { city: "Bayan Lepas", state: "Penang" },
  "80000": { city: "Johor Bahru", state: "Johor" },
  "88000": { city: "Kota Kinabalu", state: "Sabah" },
  "93000": { city: "Kuching", state: "Sarawak" },
};

function lookupPostalCode(code: string): { city: string; state: string } | null {
  return POSTAL_LOOKUP[code] ?? null;
}

function reverseGeocode(lat: number, lon: number): Partial<LocationData> | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat >= 3.0 && lat <= 3.25 && lon >= 101.6 && lon <= 101.8) {
    return { line: "Jalan Bukit Bintang", country: "Malaysia", postalCode: "55100", city: "Kuala Lumpur", state: "Kuala Lumpur" };
  }
  if (lat >= 3.05 && lat <= 3.15 && lon >= 101.55 && lon <= 101.65) {
    return { line: "Jalan SS 15", country: "Malaysia", postalCode: "47500", city: "Subang Jaya", state: "Selangor" };
  }
  if (lat >= 5.3 && lat <= 5.5 && lon >= 100.2 && lon <= 100.4) {
    return { line: "Lebuh Chulia", country: "Malaysia", postalCode: "10000", city: "George Town", state: "Penang" };
  }
  return { country: "Malaysia" };
}

export function LocationPicker({ value, onChange, errors, className }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(MOCK_LOCATION_SUGGESTIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [coordsEditing, setCoordsEditing] = useState(false);
  const [latDraft, setLatDraft] = useState("");
  const [lonDraft, setLonDraft] = useState("");
  const coordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coordsEditing) return;
    const onClick = (e: MouseEvent) => {
      if (coordsRef.current && !coordsRef.current.contains(e.target as Node)) {
        commitCoords();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsEditing, latDraft, lonDraft]);

  const openCoords = () => {
    setLatDraft(value.lat !== undefined && value.lat !== "" ? String(value.lat) : "");
    setLonDraft(value.lon !== undefined && value.lon !== "" ? String(value.lon) : "");
    setCoordsEditing(true);
  };

  const commitCoords = () => {
    setCoordsEditing(false);
    const lat = parseFloat(latDraft);
    const lon = parseFloat(lonDraft);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const geo = reverseGeocode(lat, lon) ?? {};
      onChange({ ...value, ...geo, lat: latDraft, lon: lonDraft });
    } else {
      onChange({ ...value, lat: latDraft, lon: lonDraft });
    }
  };

  const cancelCoords = () => setCoordsEditing(false);

  const handlePostalBlur = () => {
    const code = (value.postalCode || "").trim();
    if (/^\d{5}$/.test(code)) {
      const hit = lookupPostalCode(code);
      if (hit) onChange({ ...value, postalCode: code, city: hit.city, state: hit.state });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (field: keyof LocationData, val: string | number) => {
    onChange({ ...value, [field]: val });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const filtered = MOCK_LOCATION_SUGGESTIONS.filter(s =>
        s.mainText.toLowerCase().includes(query.toLowerCase()) ||
        s.secondaryText.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: typeof MOCK_LOCATION_SUGGESTIONS[0]) => {
    setIsSearching(true);
    setShowSuggestions(false);
    setSearchQuery(suggestion.mainText);

    setTimeout(() => {
      onChange({
        ...value,
        line: suggestion.mainText,
        lat: suggestion.lat,
        lon: suggestion.lon,
        country: "Malaysia",
      });
      setIsSearching(false);
      setSearchQuery("");
    }, 800);
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    
    setTimeout(() => {
      const mockResult: Partial<LocationData> = {
        line: searchQuery,
        city: "Kuala Lumpur",
        state: "Kuala Lumpur",
        postalCode: "55100",
        lat: "3.1390",
        lon: "101.7036"
      };
      onChange({ ...value, ...mockResult });
      setIsSearching(false);
      setSearchQuery("");
    }, 1000);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-lg text-body outline-none transition-all font-medium",
      hasError 
        ? "border-destructive ring-destructive/10 text-destructive placeholder:text-destructive/60" 
        : "border-border focus:ring-2 focus:ring-primary/10 focus:border-primary/30 hover:border-border-hover text-foreground"
    );

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
      {/* Left Column: Map Interaction */}
      <div className="space-y-4">
        <div className="relative group h-full">
          <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[350px] rounded-lg border-2 border-border bg-muted/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-primary/20 shadow-sm">
            {/* Mock Map Background */}
            <div
              className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000"
              style={{
                backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}')`,
              }}
            />
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Info Icon (Top Right) */}
            <div className="absolute top-4 right-4 z-20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 bg-background/60 backdrop-blur-md border border-border/60 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm">
                      <Info size={18} weight="bold" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px]">
                    <p className="text-label leading-relaxed">
                      Search for a location to automatically populate the address fields.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Mock Navigation Control */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
              <div className="flex flex-col bg-background/80 backdrop-blur-md border border-border/60 rounded-lg shadow-sm overflow-hidden">
                <button type="button" className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors border-b border-border/40">+</button>
                <button type="button" className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">-</button>
              </div>
              <button type="button" className="p-2 bg-background/80 backdrop-blur-md border border-border/60 rounded-lg text-muted-foreground hover:text-primary shadow-sm transition-all">
                <NavigationArrow size={18} weight="fill" />
              </button>
            </div>

            {/* Animated Pin */}
            <div className={cn(
              "flex flex-col items-center gap-2 z-10 transition-transform duration-500",
              isSearching ? "animate-bounce" : "translate-y-0"
            )}>
              <div className="relative">
                <MapPin size={48} weight="fill" className={cn(
                  "transition-colors duration-500 drop-shadow-lg",
                  value.lat && value.lon ? "text-primary" : "text-faint"
                )} />
                {value.lat && value.lon && !isSearching && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full border-2 border-background shadow-sm" />
                )}
              </div>
              <div className={cn(
                "px-3 py-1 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full shadow-lg transition-all",
                value.lat && value.lon ? "scale-100 opacity-100" : "scale-90 opacity-0"
              )}>
                <span className="text-label font-medium text-primary whitespace-nowrap">
                  {isSearching ? "Locating..." : "Pinned Location"}
                </span>
              </div>
            </div>

            {/* Search & Suggestions Bar */}
            <div className="absolute bottom-4 inset-x-4 z-30" ref={dropdownRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlass size={16} className={cn(isSearching ? "text-primary animate-pulse" : "text-muted-foreground")} />
                </div>
                <input
                  type="text"
                  placeholder="Search location to autopopulate..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleManualSearch())}
                  className="w-full pl-10 pr-12 py-3.5 bg-background shadow-2xl shadow-black/10 border-border border-2 rounded-lg text-body font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-faint"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute bottom-full mb-2 inset-x-0 bg-background border border-border rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    <div className="p-2 border-b border-border/40 bg-muted/30">
                      <p className="text-label font-medium text-faint uppercase tracking-widest px-4">Suggestions</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {suggestions.length > 0 ? (
                        suggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center justify-between group transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <MapTrifold size={16} />
                              </div>
                              <div>
                                <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">{s.mainText}</p>
                                <p className="text-label text-muted-foreground line-clamp-1">{s.secondaryText}</p>
                              </div>
                            </div>
                            <CaretRight size={14} className="text-faint group-hover:text-primary transition-colors" />
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-label text-muted-foreground italic">No matches found. Press Enter to search manually.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleManualSearch}
                  disabled={!searchQuery || isSearching}
                  className="absolute right-2 top-1.5 bottom-1.5 w-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn shadow-[0_4px_12px_rgba(var(--primary-rgb),0.2)]"
                >
                  <Check size={18} weight="bold" className={cn("transition-transform", isSearching ? "scale-0" : "scale-100")} />
                  {isSearching && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
        {/* Lat/Lon click-to-edit pill */}
        <div className="flex justify-end" ref={coordsRef}>
          {coordsEditing ? (
            <div className="flex items-center gap-1.5 bg-background border border-primary/40 rounded-full pl-2 pr-1 py-1 shadow-sm">
              <input
                value={latDraft}
                onChange={(e) => setLatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitCoords(); }
                  if (e.key === "Escape") { e.preventDefault(); cancelCoords(); }
                }}
                placeholder="Lat"
                autoFocus
                className="w-20 px-1.5 py-0.5 bg-transparent text-label font-mono outline-none placeholder:text-faint"
              />
              <span className="text-faint">,</span>
              <input
                value={lonDraft}
                onChange={(e) => setLonDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitCoords(); }
                  if (e.key === "Escape") { e.preventDefault(); cancelCoords(); }
                }}
                placeholder="Lon"
                className="w-24 px-1.5 py-0.5 bg-transparent text-label font-mono outline-none placeholder:text-faint"
              />
              <button
                type="button"
                onClick={commitCoords}
                className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                aria-label="Apply coordinates"
              >
                <Check size={12} weight="bold" />
              </button>
              <button
                type="button"
                onClick={cancelCoords}
                className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80"
                aria-label="Cancel"
              >
                <XIcon size={12} weight="bold" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCoords}
              className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/20 text-label text-faint hover:text-primary hover:border-primary/30 transition-all font-mono"
            >
              {value.lat && value.lon ? (
                <span>{String(value.lat)}, {String(value.lon)}</span>
              ) : (
                <span className="not-italic">Set coordinates</span>
              )}
              <PencilSimple size={11} weight="bold" className="opacity-60 group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-body font-medium text-foreground">Street Address <span className="text-destructive">*</span></label>
            <input
              value={value.line}
              onChange={(e) => handleChange("line", e.target.value)}
              placeholder="e.g. Lot 1.02, Pavilion KL"
              className={inputCls(!!errors?.line)}
            />
            {errors?.line && (
              <p className="text-label text-destructive flex items-center gap-1 mt-1">
                <XCircle size={12} weight="fill" /> {errors.line.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-body font-medium text-foreground">Country <span className="text-destructive">*</span></label>
            <FormSelect
              value={value.country || "Malaysia"}
              onChange={(v) => handleChange("country", v)}
              options={COUNTRIES.map((c) => ({ label: c, value: c }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-body font-medium text-foreground">Postal Code <span className="text-destructive">*</span></label>
            <input
              value={value.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              onBlur={handlePostalBlur}
              placeholder="55100"
              className={inputCls(!!errors?.postalCode)}
            />
            <p className="text-label text-faint mt-1">City and state auto-detect from postal code.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body font-medium text-foreground">City <span className="text-destructive">*</span></label>
              <input
                value={value.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Kuala Lumpur"
                className={inputCls(!!errors?.city)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-body font-medium text-foreground">State <span className="text-destructive">*</span></label>
              <FormSelect
                value={value.state}
                onChange={(v) => handleChange("state", v)}
                options={[
                  { label: "Select State", value: "" },
                  { label: "Kuala Lumpur", value: "Kuala Lumpur" },
                  { label: "Selangor", value: "Selangor" },
                  { label: "Johor", value: "Johor" },
                  { label: "Penang", value: "Penang" },
                  { label: "Sabah", value: "Sabah" },
                  { label: "Sarawak", value: "Sarawak" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
