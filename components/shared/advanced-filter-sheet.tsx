"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  IdentificationCard,
  Wallet
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface WorkforceRange {
  label: string;
  min: number;
  max: number;
}

export interface AdvancedFilters {
  utilization: [number, number];
  employees: [number, number];
  services: string[];
  industry: string;
  walletModel: string;
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  utilization: [0, 100] as [number, number],
  employees: [0, 5000] as [number, number],
  services: [],
  industry: "all",
  walletModel: "all",
};

interface AdvancedFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  setFilters: (filters: AdvancedFilters) => void;
  onApply: () => void;
  workforceRanges?: WorkforceRange[];
  industries?: string[];
  showWalletModel?: boolean;
  showWorkforce?: boolean;
  showUtilization?: boolean;
  showIndustry?: boolean;
  description?: string;
}

export function AdvancedFilterSheet({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  workforceRanges = [],
  industries = [],
  showWalletModel = true,
  showWorkforce = true,
  showUtilization = true,
  showIndustry = true,
  description = "Detailed reporting and attribute selection.",
}: AdvancedFilterSheetProps) {

  const [customPax, setCustomPax] = React.useState<string>("");

  const handleRangeSelect = (range: { min: number, max: number }) => {
    setFilters({ ...filters, employees: [range.min, range.max] });
    setCustomPax("");
  };

  const handleCustomPax = (val: string) => {
    setCustomPax(val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      setFilters({ ...filters, employees: [0, num] });
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_ADVANCED_FILTERS);
    setCustomPax("");
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Filters"
      description={description}
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <Button variant="ghost" onClick={handleReset} className="text-nav hover:bg-muted font-semibold text-muted-foreground">
            Clear All
          </Button>
          <Button onClick={onApply} className="text-nav rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="space-y-10 pb-12 pr-1">

        {/* Utilization Section */}
        {showUtilization && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
               <IdentificationCard size={18} weight="bold" />
               <h3 className="text-label font-semibold tracking-tight leading-none">Utilization</h3>
            </div>

            <div className="space-y-8 pl-1">
              <Slider
                label="Max Budget Utilization"
                min={0}
                max={100}
                unit="%"
                value={filters.utilization?.[1] || 100}
                onChange={(v) => setFilters({ ...filters, utilization: [0, v] })}
              />

              {showWalletModel && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <Wallet size={14} weight="bold" />
                    <label className="text-caption font-semibold tracking-tight">Wallet model</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Cash Balance", "Credit Limit"].map((model) => (
                      <button
                        key={model}
                        onClick={() => setFilters({ ...filters, walletModel: model === filters.walletModel ? "all" : model })}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-caption font-semibold transition-all capitalize",
                          filters.walletModel === model
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Workforce Size Section */}
        {showWorkforce && workforceRanges.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
               <Users size={18} weight="bold" />
               <h3 className="text-label font-semibold tracking-tight leading-none">Workforce size</h3>
            </div>

            <div className="space-y-5 pl-1">
              <div className="grid grid-cols-2 gap-2">
                {workforceRanges.map((range) => {
                  const isActive = filters.employees[0] === range.min && filters.employees[1] === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => handleRangeSelect(range)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-label font-semibold transition-all",
                        isActive
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-card border-border hover:border-primary/40 text-muted-foreground hover:bg-muted/30"
                      )}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                 <label className="text-caption font-semibold text-muted-foreground/60 tracking-tight mb-2 block">Custom employee count</label>
                <input
                  type="number"
                  placeholder="Enter specific count..."
                  className="w-full h-11 px-4 rounded-xl border border-border bg-card text-nav focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={customPax}
                  onChange={(e) => handleCustomPax(e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* Industry Section */}
        {showIndustry && industries.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
               <Briefcase size={18} weight="bold" />
               <h3 className="text-label font-semibold tracking-tight leading-none">Company details</h3>
            </div>
            <div className="space-y-4 pl-1">
               <div className="space-y-2">
                  <label className="text-caption font-semibold text-muted-foreground/60 tracking-tight block">Industry vertical</label>
                 <select
                   className="w-full h-11 px-4 rounded-xl border border-border bg-card text-nav focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium"
                   value={filters.industry}
                   onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                 >
                   <option value="all">All Industries</option>
                   {industries.map(ind => (
                     <option key={ind} value={ind}>{ind}</option>
                   ))}
                 </select>
               </div>
            </div>
          </section>
        )}
      </div>
    </Sheet>
  );
}
