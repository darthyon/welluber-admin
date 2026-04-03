import { ShieldCheck, ArrowRight } from "@phosphor-icons/react"

export function SettlementStatus() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col relative overflow-hidden">
      {/* Decorative gradient background similar to Stitch Profitability card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-[0.08em]">Settlement Status</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={18} weight="fill" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[12px] text-muted-foreground font-medium mb-1">Pending Payouts</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-medium text-muted-foreground">RM</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">18.2M</span>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-muted-foreground">Next Cycle Date</span>
            <span className="font-medium text-foreground">May 01, 2026</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-1.5 mb-1 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Cycle Progress</span>
            <span>26 Days elapsed</span>
          </div>
        </div>

        <button className="mt-5 w-full flex items-center justify-center gap-1.5 bg-background border border-border hover:bg-accent text-foreground transition-colors py-2 rounded-md text-[13px] font-medium">
          Trigger Payout <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
