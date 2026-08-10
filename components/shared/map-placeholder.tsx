"use client";

import { MapPin } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SvgMap } from "@/components/shared/svg-map";

interface MapPlaceholderProps {
  lat?: number;
  lon?: number;
  address?: string;
  className?: string;
}

/**
 * View-mode map placeholder. Renders a stylised SVG map with a pin — no
 * network request, no API token. Falls back to a generic location placeholder
 * when coordinates are missing.
 */
export function MapPlaceholder({ lat, lon, address, className }: MapPlaceholderProps) {
  const hasCoords = lat != null && lon != null;

  return (
    <div
      className={cn("relative rounded-lg border border-border overflow-hidden bg-muted/20", className)}
      aria-label={address || "Location map"}
    >
      {hasCoords ? (
        <div className="relative aspect-[3/1] w-full">
          <SvgMap lat={lat} lon={lon} showPin showCoordinates />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[3/1] w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <MapPin size={20} weight="fill" />
          </div>
          <p className="text-label font-medium">No coordinates available</p>
        </div>
      )}
    </div>
  );
}
