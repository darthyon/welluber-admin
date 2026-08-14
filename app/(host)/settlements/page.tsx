import { CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr"

export default function SettlementsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-heading font-semibold text-foreground">Settlements</h1>
        <p className="text-body text-subtle">
          Track service provider settlement activity and payouts.
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-center">
        <CurrencyCircleDollar size={40} weight="light" className="mb-3 text-muted-foreground" />
        <p className="text-heading font-semibold text-foreground">Coming Soon</p>
        <p className="mt-1 max-w-sm text-body text-subtle">
          Settlement management is currently in development.
        </p>
      </div>
    </div>
  )
}
