"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  XCircle,
  PencilSimple,
  X as XIcon
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MOCK_LOCATION_SUGGESTIONS } from "@/lib/mock-data";
import { FormSelect } from "@/components/shared/form-select";
import { LocationPickerMapPanel } from "@/components/shared/location-picker-map-panel";

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
      <LocationPickerMapPanel
        dropdownRef={dropdownRef}
        handleManualSearch={handleManualSearch}
        handleSearchChange={handleSearchChange}
        handleSelectSuggestion={handleSelectSuggestion}
        isSearching={isSearching}
        searchQuery={searchQuery}
        setShowSuggestions={setShowSuggestions}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        value={value}
      />

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
