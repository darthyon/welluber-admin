"use client";

import {
  MapPin,
  MagnifyingGlass,
  Check,
  Info,
  CaretRight,
  NavigationArrow,
  MapTrifold,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { LocationData } from "@/components/shared/location-picker";
import { MOCK_LOCATION_SUGGESTIONS } from "@/lib/mock-data";

interface LocationPickerMapPanelProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  handleManualSearch: () => void;
  handleSearchChange: (query: string) => void;
  handleSelectSuggestion: (suggestion: typeof MOCK_LOCATION_SUGGESTIONS[0]) => void;
  isSearching: boolean;
  searchQuery: string;
  setShowSuggestions: (show: boolean) => void;
  showSuggestions: boolean;
  suggestions: typeof MOCK_LOCATION_SUGGESTIONS;
  value: LocationData;
}

export function LocationPickerMapPanel({
  dropdownRef,
  handleManualSearch,
  handleSearchChange,
  handleSelectSuggestion,
  isSearching,
  searchQuery,
  setShowSuggestions,
  showSuggestions,
  suggestions,
  value,
}: LocationPickerMapPanelProps) {
  return (
    <div className="space-y-4">
      <div className="relative group h-full">
        <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-muted/30 shadow-sm transition-all duration-500 group-hover:border-primary/20 aspect-[16/10] lg:h-full lg:aspect-auto">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 group-hover:grayscale-0"
            style={{
              backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}')`,
            }}
          />
          <div className="absolute inset-0 bg-primary/5 transition-colors duration-700 group-hover:bg-transparent" />
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="absolute top-4 right-4 z-20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-lg border border-border/60 bg-background/60 p-2 text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/40 hover:text-primary">
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

          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
            <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 shadow-sm backdrop-blur-md">
              <button type="button" className="border-b border-border/40 p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">+</button>
              <button type="button" className="p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">-</button>
            </div>
            <button type="button" className="rounded-lg border border-border/60 bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:text-primary">
              <NavigationArrow size={18} weight="fill" />
            </button>
          </div>

          <div className={cn("z-10 flex flex-col items-center gap-2 transition-transform duration-500", isSearching ? "animate-bounce" : "translate-y-0")}>
            <div className="relative">
              <MapPin
                size={48}
                weight="fill"
                className={cn("drop-shadow-lg transition-colors duration-500", value.lat && value.lon ? "text-primary" : "text-faint")}
              />
              {value.lat && value.lon && !isSearching ? (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 shadow-sm dark:bg-emerald-400" />
              ) : null}
            </div>
            <div className={cn("rounded-full border border-border/50 bg-background/90 px-3 py-1 shadow-lg backdrop-blur-sm transition-all", value.lat && value.lon ? "scale-100 opacity-100" : "scale-90 opacity-0")}>
              <span className="whitespace-nowrap text-label font-medium text-primary">
                {isSearching ? "Locating..." : "Pinned Location"}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-4 z-30" ref={dropdownRef}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlass size={16} className={cn(isSearching ? "animate-pulse text-primary" : "text-muted-foreground")} />
              </div>
              <input
                type="text"
                placeholder="Search location to autopopulate..."
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), handleManualSearch())}
                className="w-full rounded-lg border-2 border-border bg-background py-3.5 pl-10 pr-12 text-body font-medium shadow-2xl shadow-black/10 outline-none transition-all placeholder:text-faint focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
              />

              {showSuggestions ? (
                <div className="animate-in absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-lg border border-border bg-background shadow-2xl duration-200 slide-in-from-bottom-2">
                  <div className="border-b border-border/40 bg-muted/30 p-2">
                    <p className="px-4 text-label font-medium uppercase tracking-widest text-faint">Suggestions</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.mainText}-${index}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-primary">
                              <MapTrifold size={16} />
                            </div>
                            <div>
                              <p className="text-body font-medium text-foreground transition-colors group-hover:text-primary">{suggestion.mainText}</p>
                              <p className="line-clamp-1 text-label text-muted-foreground">{suggestion.secondaryText}</p>
                            </div>
                          </div>
                          <CaretRight size={14} className="text-faint transition-colors group-hover:text-primary" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-label italic text-muted-foreground">No matches found. Press Enter to search manually.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleManualSearch}
                disabled={!searchQuery || isSearching}
                className="group/btn absolute top-1.5 right-2 bottom-1.5 flex w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:bg-primary/90"
              >
                <Check size={18} weight="bold" className={cn("transition-transform", isSearching ? "scale-0" : "scale-100")} />
                {isSearching ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  </div>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
