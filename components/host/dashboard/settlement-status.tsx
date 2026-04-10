import { ShieldCheck, ArrowRight } from "@phosphor-icons/react"

export function SettlementStatus() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col relative overflow-hidden shadow-sm">
      {/* Decorative gradient background similar to Stitch Profitability card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-foreground leading-none tracking-tight">Settlement Status</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System operational" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ShieldCheck size={18} weight="fill" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[12px] font-medium text-muted-foreground mb-2">Pending Payouts</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] font-medium text-muted-foreground">RM</span>
            <span className="text-[24px] font-semibold tracking-tight text-foreground leading-tight">18.2M</span>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-muted-foreground font-medium">Next Cycle Date</span>
            <span className="font-semibold text-foreground">May 01, 2026</span>
          </div>
          
          <div className="w-full bg-muted/60 rounded-full h-1.5 mb-1 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>Cycle Progress</span>
            <span>26 Days Elapsed</span>
          </div>
        </div>

        <button className="mt-5 w-full flex items-center justify-center gap-1.5 bg-background border border-border hover:bg-muted/50 hover:border-border/80 text-foreground transition-all duration-200 py-2 rounded-lg text-[13px] font-semibold shadow-sm active:scale-[0.98]">
          Trigger Payout <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
