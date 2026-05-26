import { Buildings, Receipt, Shield } from "@phosphor-icons/react/dist/ssr"

import { WelluberLogo } from "@/components/shared/welluber-logo"
import type { UserRole } from "@/lib/session"

interface Quote {
  text: string
  name: string
  title: string
}

const QUOTES: Record<Exclude<UserRole, "host">, Quote> = {
  org: {
    text: "Our employees actually use their benefits now. Enrollment went from 43% to 91% in two months.",
    name: "Priya Menon",
    title: "HR Director, Acme Corporation",
  },
  serviceprovider: {
    text: "Settlements are automatic and transparent. I spend zero time chasing payments.",
    name: "Faiz Hakim",
    title: "Operations Lead, PeakFit",
  },
}

const HOST_HIGHLIGHTS = [
  { icon: Buildings, text: "Manage every org and service provider from one view" },
  { icon: Receipt, text: "Real-time claims, settlements, and reporting" },
  { icon: Shield, text: "Full platform visibility and access control" },
]

interface VisualPanelProps {
  role: UserRole
}

export function VisualPanel({ role }: VisualPanelProps) {
  return (
    <div
      className="relative hidden w-1/2 flex-col overflow-hidden lg:flex"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.28 0.16 245) 0%, oklch(0.42 0.21 277) 45%, oklch(0.52 0.22 305) 100%)",
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Radial glow — behind content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, oklch(0.65 0.18 300 / 0.25) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-12 pb-16">
        {/* Logo */}
        <WelluberLogo width={200} height={52} className="mb-10 text-white opacity-90" />

        {role === "host" ? (
          <div className="space-y-8">
            <div>
              <p className="text-heading font-semibold leading-snug text-white/90">
                The command center for WellUber operations.
              </p>
              <p className="mt-2 text-body text-white/50">
                Everything you need to run the platform, in one place.
              </p>
            </div>
            <ul className="space-y-4">
              {HOST_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-white/10 p-1.5">
                    <Icon size={14} weight="fill" className="text-white/70" />
                  </div>
                  <span className="text-body text-white/70">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            {/* Decorative quote mark */}
            <p
              className="mb-4 font-serif leading-none text-white/15 select-none"
              style={{ fontSize: "7rem", lineHeight: 1 }}
              aria-hidden
            >
              &ldquo;
            </p>

            <blockquote className="space-y-6">
              <p className="text-heading font-medium leading-snug text-white/90">
                {QUOTES[role].text}
              </p>
              <footer className="space-y-0.5">
                <p className="text-body font-medium text-white/80">{QUOTES[role].name}</p>
                <p className="text-label text-white/45">{QUOTES[role].title}</p>
              </footer>
            </blockquote>
          </>
        )}
      </div>
    </div>
  )
}
