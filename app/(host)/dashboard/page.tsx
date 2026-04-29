"use client"

import { useState } from "react"
import { Buildings, ShieldCheck, Users, CurrencyCircleDollar } from "@phosphor-icons/react"
import { ActivityChart } from "@/components/host/dashboard/activity-chart"
import { TopList } from "@/components/host/dashboard/top-list"
import { TrendingCategories } from "@/components/host/dashboard/trending-categories"
import { SettlementStatus } from "@/components/host/dashboard/settlement-status"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type DateRange } from "react-day-picker"

const topOrgs = [
  { id: "o1", rank: 1, name: "TechCorp Global", metric1: "12,402", metric2: "92%" },
  { id: "o2", rank: 2, name: "RetailPlus Group", metric1: "8,921", metric2: "78%" },
  { id: "o3", rank: 3, name: "Global Networks", metric1: "5,310", metric2: "64%" },
  { id: "o4", rank: 4, name: "Alpha Logistics", metric1: "4,105", metric2: "81%" },
  { id: "o5", rank: 5, name: "Swift Solutions", metric1: "3,890", metric2: "72%" },
]

const topSPs = [
  { id: "s1", rank: 1, name: "Urban Wellness Centre", metric1: "12k", metric2: "4.9" },
  { id: "s2", rank: 2, name: "Zenith Yoga Studio", metric1: "8.4k", metric2: "4.8" },
  { id: "s3", rank: 3, name: "Apex Performance Lab", metric1: "7.1k", metric2: "5.0" },
  { id: "s4", rank: 4, name: "Serenity Day Spa", metric1: "6.8k", metric2: "4.7" },
  { id: "s5", rank: 5, name: "Core Strength Gym", metric1: "5.2k", metric2: "4.9" },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<"By Month" | "By Quarter" | "By Year">("By Month")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <div className="space-y-10">
      {/* SECTION 1: All-Time Overview */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-heading font-semibold tracking-tight text-foreground">System Overview</h1>
            <p className="text-muted-foreground text-nav mt-1">
              Real-time flexi-benefit insights and all-time platform health
            </p>
          </div>
        </div>

        {/* KPIs */}
        <BentoGrid className="gap-3">
          <BentoCard 
            title="Active Members" 
            value="128,492" 
            icon={Users}
            trend={{ value: "+1.2%", label: "growth", isPositive: true }}
          >
            <div className="flex flex-col items-end gap-1.5 ml-auto">
              <span className="text-micro font-medium text-muted-foreground/50 tracking-[0.05em] group-hover:text-primary/60 transition-colors">64% Employees</span>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="w-16 cursor-help group/progress">
                      <Progress 
                        value={64} 
                        className="h-1.5 bg-primary/10 shadow-inner group-hover/progress:h-2 transition-all duration-300" 
                      />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top" className="text-label font-medium leading-relaxed">
                    <p className="flex items-center gap-2 text-primary font-semibold">
                       <span className="w-2 h-2 rounded-full bg-primary" />
                       82,402 Employees (64%)
                    </p>
                    <p className="flex items-center gap-2 mt-1 text-muted-foreground">
                       <span className="w-2 h-2 rounded-full bg-primary/30" />
                       46,090 Dependents (36%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </BentoCard>

          {/* Organizations */}
          <BentoCard 
            title="Organisations" 
            value="1,042" 
            icon={Buildings}
            trend={{ value: "+12.2%", label: "vs last month", isPositive: true }}
          />

          {/* Service Providers */}
          <BentoCard 
            title="Service Providers" 
            value="248" 
            icon={ShieldCheck}
            trend={{ value: "+4.8%", label: "vs last month", isPositive: true }}
          />

          {/* Platform Profitability */}
          <BentoCard 
            title="Platform Profitability" 
            value="RM 2.4M"
            icon={CurrencyCircleDollar}
            trend={{ value: "+3.2%", label: "growth", isPositive: true }}
          >
            <div className="flex flex-col items-end gap-1.5 ml-auto">
              <span className="text-micro font-medium text-muted-foreground/50 tracking-[0.05em] group-hover:text-primary/60 transition-colors">88% Claims</span>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="w-16 cursor-help group/progress">
                      <Progress 
                        value={88} 
                        className="h-1.5 bg-primary/10 shadow-inner group-hover/progress:h-2 transition-all duration-300" 
                      />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top" className="text-label font-medium leading-relaxed">
                    <p className="flex items-center gap-2 text-primary font-semibold">
                       <span className="w-2 h-2 rounded-full bg-primary" />
                       RM 18.2M Claims (88%)
                    </p>
                    <p className="flex items-center gap-2 mt-1 text-muted-foreground">
                       <span className="w-2 h-2 rounded-full bg-primary/30" />
                       RM 2.4M Net Profit (12%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* SECTION 2: Filterable Performance */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-subtitle font-semibold text-foreground">Performance</h2>
            <p className="text-muted-foreground text-nav mt-1">
              Ecosystem activity and settlement volume over time
            </p>
          </div>
          
          {/* Custom Compound Period Selectors */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex bg-muted/50 p-1 rounded-md border border-border">
              {["By Month", "By Quarter", "By Year"].map((p) => (
                <button 
                  key={p}
                  onClick={() => setPeriod(p as any)}
                  className={`px-3 py-1.5 text-label font-medium rounded transition-colors ${
                    period === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Secondary Option based on primary period */}
            <select className="px-3 py-1.5 h-[34px] bg-card border border-border hover:bg-muted/50 rounded-md text-label font-medium text-foreground outline-none cursor-pointer transition-colors max-w-[140px] appearance-none">
              {period === "By Month" && (
                <>
                  <option>January 2026</option>
                  <option>February 2026</option>
                  <option defaultValue="true">March 2026</option>
                </>
              )}
              {period === "By Quarter" && (
                <>
                  <option defaultValue="true">Q1 (Jan - Mar) 2026</option>
                  <option>Q2 (Apr - Jun) 2026</option>
                  <option>Q3 (Jul - Sep) 2026</option>
                  <option>Q4 (Oct - Dec) 2026</option>
                </>
              )}
              {period === "By Year" && (
                <>
                  <option defaultValue="true">2026</option>
                  <option>2025</option>
                  <option>2024</option>
                </>
              )}
            </select>

            {/* Custom Range using Shadcn Calendar (mocked trigger for layout) */}
            <DateRangePicker 
              value={dateRange}
              onChange={setDateRange}
              placeholder="Custom Range"
              align="end"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <div className="lg:col-span-1">
            <SettlementStatus />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="h-[350px]">
            <TopList title="Top Organisations" type="org" data={topOrgs} />
          </div>
          <div className="h-[350px]">
            <TopList title="Top Service Providers" type="sp" data={topSPs} />
          </div>
          <div className="h-[350px]">
            <TrendingCategories />
          </div>
        </div>
      </section>
    </div>
  )
}
