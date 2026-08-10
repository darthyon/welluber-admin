"use client"

import { cn } from "@/lib/utils"

interface LocationMapProps {
  /** Latitude — only nudges the pin and fills the readout. */
  lat?: number
  lon?: number
  /** Draw the pin. Callers that overlay their own marker pass false. */
  showPin?: boolean
  /** Show the coordinate readout in the corner. Requires lat and lon. */
  showCoordinates?: boolean
  className?: string
}

/**
 * Klang Valley map built from CARTO Positron raster tiles (OpenStreetMap data)
 * bundled under `public/map-tiles`. They are static files, so nothing is
 * fetched from a tile server at runtime — no API key, no quota, works offline.
 *
 * Tiles are zoom 12, x 3202–3206, y 2011–2013: a 5×3 mosaic covering roughly
 * Shah Alam through Kuala Lumpur. Attribution is required by the ODbL licence
 * and is rendered in the corner — do not remove it.
 *
 * The same view backs every location; the mock data has no real geography
 * behind it, so the baked-in place labels read as wrong for a non-KL branch.
 * When live coordinates arrive, swap the internals here and every caller
 * follows.
 */
const TILE_X = [3202, 3203, 3204, 3205, 3206] as const
const TILE_Y = [2011, 2012, 2013] as const

function pinPosition(lat?: number, lon?: number) {
  if (lat == null || lon == null) return { left: "50%", top: "50%" }
  // Fractional part only — separates nearby locations without implying the
  // placement is geographically meaningful.
  const fx = ((lon % 1) + 1) % 1
  const fy = ((lat % 1) + 1) % 1
  return { left: `${35 + fx * 30}%`, top: `${32 + fy * 34}%` }
}

export function LocationMap({
  lat,
  lon,
  showPin = false,
  showCoordinates = false,
  className,
}: LocationMapProps) {
  const pin = pinPosition(lat, lon)
  const hasCoords = lat != null && lon != null

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Mosaic sized to the tile grid's own 5:3 ratio, then scaled to cover
          the container so the seams stay aligned. */}
      <div
        // Positron is already pale, so no desaturation. Dark mode inverts the
        // light tiles rather than shipping a second set.
        className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-5 grid-rows-3 dark:brightness-[0.9] dark:invert dark:hue-rotate-180"
        // Native tile size (5 × 256 = 1280) so seams line up exactly, growing
        // only if the panel is wider than the mosaic. The panel crops the rest.
        style={{ width: "1280px", minWidth: "100%", aspectRatio: "5 / 3" }}
      >
        {TILE_Y.map((y) =>
          TILE_X.map((x) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${x}-${y}`}
              src={`/map-tiles/z12-${x}-${y}.png`}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="lazy"
              decoding="async"
              className="block h-full w-full select-none"
            />
          ))
        )}
      </div>

      {showPin && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={pin}
        >
          <span className="block h-11 w-11 rounded-full bg-primary/20" />
          <span className="absolute top-1/2 left-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-primary shadow-sm" />
        </div>
      )}

      {showCoordinates && hasCoords && (
        <span className="absolute right-2 bottom-2 rounded-md border border-border/60 bg-background/85 px-2 py-1 font-mono text-micro font-medium text-subtle backdrop-blur-sm">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </span>
      )}

      {/* ODbL requires visible attribution. */}
      <span className="pointer-events-none absolute bottom-1 left-2 text-micro font-medium text-foreground/45">
        © OpenStreetMap © CARTO
      </span>
    </div>
  )
}
