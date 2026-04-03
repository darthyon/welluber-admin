"use client"

import { useState, useRef, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CaretDown, MagnifyingGlass, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

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
        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-card border border-border hover:bg-muted/50 rounded-md text-[12px] font-medium text-foreground w-[180px] text-left transition-colors"
      >
        <span className="truncate">{selectedName}</span>
        <CaretDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[220px] bg-card border border-border shadow-md rounded-md z-[60] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border/50 flex items-center gap-2">
            <MagnifyingGlass size={14} className="text-muted-foreground" />
            <input 
              autoFocus
              className="bg-transparent text-[12px] outline-none w-full" 
              placeholder="Search organisation..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-3">No results found.</p>
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
                    "w-full text-left px-2 py-1.5 text-[12px] rounded-sm flex items-center justify-between",
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

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground mb-0.5">Voucher Lifecycle</h2>
          <p className="text-[12px] text-muted-foreground">Volume of newly issued vs redeemed vouchers (Check-ins)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Entity Filter (Searchable) */}
          <SearchableSelect 
            value={entityFilter} 
            onChange={setEntityFilter} 
            options={ORG_OPTIONS} 
          />
          
          {/* Default metric dropdown */}
          <select 
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="px-3 py-1.5 bg-card border border-border hover:bg-muted/50 rounded-md text-[12px] font-medium text-foreground outline-none cursor-pointer transition-colors"
          >
            <option value="both">Compare Both</option>
            <option value="issued">Issued Volume</option>
            <option value="checkedIn">Redemption Volume</option>
          </select>
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
            <Tooltip 
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
          <span className="text-[11px] font-medium text-muted-foreground">Vouchers Issued</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[11px] font-medium text-muted-foreground">Verified Check-ins</span>
        </div>
      </div>
    </div>
  )
}
