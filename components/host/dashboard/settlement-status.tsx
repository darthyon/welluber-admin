import { ShieldCheck, ArrowRight } from "@phosphor-icons/react"

export function SettlementStatus() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm">
      {/* Decorative gradient background similar to Stitch Profitability card */}
      <div className="pointer-events-none absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-primary/5" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-body leading-none font-semibold tracking-tight text-foreground">
              Settlement Status
            </h2>
            <div
              className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
              title="System operational"
            />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck size={18} weight="fill" />
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-label font-medium text-muted-foreground">
            Pending Payouts
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-heading font-medium text-muted-foreground">
              RM
            </span>
            <span className="text-display leading-tight font-semibold tracking-tight text-foreground tabular-nums">
              18.2M
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-label">
            <span className="font-medium text-muted-foreground">
              Next Cycle Date
            </span>
            <span className="font-semibold text-foreground">May 01, 2026</span>
          </div>

          <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: "85%" }}
            ></div>
          </div>
          <div className="flex justify-between text-label font-medium text-muted-foreground">
            <span>Cycle Progress</span>
            <span>26 Days Elapsed</span>
          </div>
        </div>

        <button className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-body font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border/80 hover:bg-muted/50 active:scale-[0.98]">
          Trigger Payout <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
