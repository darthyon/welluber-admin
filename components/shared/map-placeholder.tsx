"use client";

import { MapPin } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  lat?: number;
  lon?: number;
  address?: string;
  className?: string;
}

/**
 * View-mode map placeholder using Mapbox static image.
 * No API hooks — renders a static map image with a pin overlay.
 * Falls back to a generic location placeholder when coordinates are missing.
 */
export function MapPlaceholder({ lat, lon, address, className }: MapPlaceholderProps) {
  const hasCoords = lat != null && lon != null;

  const mapUrl = hasCoords
    ? `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+4338CA(${lon},${lat})/${lon},${lat},15/600x300@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    : null;

  return (
    <div className={cn("relative rounded-lg border border-border overflow-hidden bg-muted/20", className)}>
      {mapUrl ? (
        <div className="relative aspect-[2/1] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt={address || "Location map"}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[2/1] w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <MapPin size={20} weight="fill" />
          </div>
          <p className="text-label font-medium">No coordinates available</p>
        </div>
      )}
    </div>
  );
}
