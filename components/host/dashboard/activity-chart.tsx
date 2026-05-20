"use client"

import { useState, useRef, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CaretDown, MagnifyingGlass, Check, Info } from "@phosphor-icons/react"
import { useMounted } from "@/hooks/use-mounted"
import { FormSelect } from "@/components/shared/form-select"

// Dummy data for Month view with dual metrics (Issued vs Checked-in)
const dataMonth = [
  { name: "Jan", issued: 4500, checkedIn: 4400 },
  { name: "Feb", issued: 2000, checkedIn: 1600 },
  { name: "Mar", issued: 6200, checkedIn: 5500 },
  { name: "Apr", issued: 6400, checkedIn: 5900 },
  { name: "May", issued: 4800, checkedIn: 4300 },
  { name: "Jun", issued: 5200, checkedIn: 4600 },
  { name: "Jul", issued: 2500, checkedIn: 2100 },
  { name: "Aug", issued: 6300, checkedIn: 5800 },
  { name: "Sep", issued: 4500, checkedIn: 4000 },
  { name: "Oct", issued: 2400, checkedIn: 2000 },
  { name: "Nov", issued: 6100, checkedIn: 5600 },
  { name: "Dec", issued: 5800, checkedIn: 5300 }
]

const ORG_OPTIONS = [
  { id: "all", name: "All Organisations" },
  { id: "o1", name: "TechCorp Global" },
  { id: "o2", name: "RetailPlus Group" },
  { id: "o3", name: "Global Networks" },
  { id: "o4", name: "Alpha Logistics" },
  { id: "o5", name: "Swift Solutions" }
]

function SearchableSelect({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void;
  options: {id: string, name: string}[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
  const selectedName = options.find(o => o.id === value)?.name || "Select..."

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 px-3 h-7 bg-background border border-border hover:border-foreground/20 rounded-lg text-label font-medium text-foreground w-[160px] text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
      >
        <span className="truncate">{selectedName}</span>
        <CaretDown size={12} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[200px] bg-card border border-border shadow-md rounded-lg z-[60] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border/50 flex items-center gap-2">
            <MagnifyingGlass size={14} className="text-muted-foreground" />
            <input 
              autoFocus
              className="bg-transparent text-label outline-none w-full" 
              placeholder="Search organisation..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-label text-muted-foreground text-center py-3">No results found.</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-label rounded-sm flex items-center justify-between",
                    value === opt.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="truncate">{opt.name}</span>
                  {value === opt.id && <Check size={14} weight="bold" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ActivityChart() {
  const [metric, setMetric] = useState<"both" | "issued" | "checkedIn">("both")
  const [entityFilter, setEntityFilter] = useState("all")
  const isMounted = useMounted()

  if (!isMounted) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col relative overflow-hidden min-h-[400px]">
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h2 className="text-body font-medium text-foreground tracking-tight">Voucher Lifecycle</h2>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-faint cursor-help hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-label font-medium leading-relaxed max-w-[220px]">
                  Volume of newly issued vs redeemed vouchers (Check-ins)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Entity Filter (Searchable) */}
          <SearchableSelect 
            value={entityFilter} 
            onChange={setEntityFilter} 
            options={ORG_OPTIONS} 
          />
          
          {/* Default metric dropdown */}
          <FormSelect
            value={metric}
            onChange={(v) => setMetric(v as "both" | "issued" | "checkedIn")}
            options={[
              { label: "Compare Both", value: "both" },
              { label: "Issued Volume", value: "issued" },
              { label: "Redemption Volume", value: "checkedIn" },
            ]}
            size="xs"
            triggerClassName="w-auto min-w-[130px]"
          />
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataMonth} barGap={0} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.5 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.5 }}
              dx={-10}
            />
            <RechartsTooltip 
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                borderColor: "var(--border)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: "12px",
                padding: "8px 12px"
              }}
              itemStyle={{ color: "var(--foreground)", fontSize: "12px", fontWeight: 500, padding: "2px 0" }}
            />
            
            {(metric === "both" || metric === "issued") && (
              <Bar 
                dataKey="issued" 
                name="Vouchers Issued"
                fill="currentColor" 
                className="text-primary/30"
                radius={[2, 2, 0, 0]} 
                maxBarSize={40}
              />
            )}
            
            {(metric === "both" || metric === "checkedIn") && (
              <Bar 
                dataKey="checkedIn" 
                name="Check-ins"
                fill="currentColor" 
                className="text-primary"
                radius={[2, 2, 0, 0]} 
                maxBarSize={40}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <span className="text-label font-medium text-muted-foreground">Vouchers Issued</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-label font-medium text-muted-foreground">Verified Check-ins</span>
        </div>
      </div>
    </div>
  )
}
