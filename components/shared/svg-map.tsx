"use client"

import { cn } from "@/lib/utils"

interface SvgMapProps {
  /** Latitude — only shifts the pin and the readout, not real geography. */
  lat?: number
  lon?: number
  /** Draw the pin. Callers that overlay their own marker pass false. */
  showPin?: boolean
  /** Show the coordinate readout in the corner. Requires lat and lon. */
  showCoordinates?: boolean
  className?: string
}

/**
 * Stylised map graphic. Deliberately not a real map — the app runs on mock
 * data, so there is nothing truthful to render. Replaces the Mapbox static
 * image calls: no token, no network request, no quota, themes with the app.
 *
 * When live location data arrives, swap the internals here and every caller
 * follows.
 */
function pinPosition(lat?: number, lon?: number) {
  if (lat == null || lon == null) return { x: 400, y: 200 }
  // Fractional part only — spreads nearby locations apart without pretending
  // the placement is geographically meaningful.
  const fx = (((lon % 1) + 1) % 1)
  const fy = (((lat % 1) + 1) % 1)
  return { x: 250 + fx * 300, y: 120 + fy * 160 }
}

export function SvgMap({
  lat,
  lon,
  showPin = false,
  showCoordinates = false,
  className,
}: SvgMapProps) {
  const pin = pinPosition(lat, lon)
  const hasCoords = lat != null && lon != null

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <rect width="800" height="400" className="fill-muted/40" />

        {/* Water */}
        <path
          d="M0 296 C 120 268, 210 330, 330 312 C 460 292, 540 344, 660 326 C 730 316, 770 334, 800 328 L800 400 L0 400 Z"
          className="fill-primary/10"
        />

        {/* Park */}
        <rect
          x="596"
          y="72"
          width="132"
          height="96"
          rx="10"
          className="fill-primary/10"
        />

        {/* City blocks */}
        <g className="fill-background/80">
          <rect x="48" y="52" width="120" height="76" rx="6" />
          <rect x="188" y="52" width="86" height="76" rx="6" />
          <rect x="294" y="52" width="140" height="46" rx="6" />
          <rect x="294" y="112" width="140" height="52" rx="6" />
          <rect x="454" y="52" width="120" height="112" rx="6" />
          <rect x="48" y="148" width="76" height="96" rx="6" />
          <rect x="144" y="148" width="130" height="96" rx="6" />
          <rect x="294" y="184" width="96" height="60" rx="6" />
          <rect x="410" y="184" width="164" height="60" rx="6" />
          <rect x="596" y="188" width="132" height="56" rx="6" />
          <rect x="48" y="264" width="150" height="44" rx="6" />
          <rect x="218" y="264" width="110" height="38" rx="6" />
        </g>

        {/* Roads */}
        <g
          className="stroke-border"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M0 138 H800" />
          <path d="M0 254 H800" />
          <path d="M284 0 V400" />
          <path d="M444 0 V400" />
          <path d="M586 0 V400" />
          <path d="M134 0 V264" />
        </g>

        {/* Minor streets */}
        <g
          className="stroke-border/60"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M0 96 H284" />
          <path d="M444 96 H800" />
          <path d="M0 196 H800" />
          <path d="M354 0 V138" />
          <path d="M514 138 V400" />
          <path d="M676 0 V72" />
          <path d="M214 264 V400" />
        </g>

        {showPin && (
          <g>
            <circle
              cx={pin.x}
              cy={pin.y}
              r="26"
              className="fill-primary/15"
            />
            <circle
              cx={pin.x}
              cy={pin.y}
              r="11"
              className="fill-primary stroke-background"
              strokeWidth="3"
            />
          </g>
        )}
      </svg>

      {showCoordinates && hasCoords && (
        <span className="absolute right-3 bottom-3 rounded-md border border-border/60 bg-background/85 px-2 py-1 font-mono text-micro font-medium text-subtle backdrop-blur-sm">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </span>
      )}
    </div>
  )
}
