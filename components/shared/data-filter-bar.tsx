"use client";

import React, { useState, useRef } from "react";
import { MagnifyingGlass, X, Funnel } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataFilterBarProps {
  /** Current search query value */
  searchQuery?: string;
  /** Callback for search query changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Primary filter components (e.g., FilterItem) to show in the bar */
  filters?: React.ReactNode;
  /** Optional configuration for an Advanced Filter trigger */
  advancedFilter?: {
    isOpen: boolean;
    onToggle: () => void;
    activeCount?: number;
  };
  /** Additional action components (e.g., Export, Create) to show on the right */
  actions?: React.ReactNode;
  /** Custom class name for the container */
  className?: string;
}

/**
 * A reusable, high-fidelity filter bar component for data tables.
 * Standardizes the layout for search, primary filters, and advanced options.
 */
export function DataFilterBar({
  searchQuery = "",
  onSearchChange = () => {},
  searchPlaceholder = "Search...",
  filters,
  advancedFilter,
  actions,
  className
}: DataFilterBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-zinc-50/50 border border-zinc-200/60 shadow-sm transition-all duration-300",
      isFocused && "bg-white border-primary/20 shadow-md ring-4 ring-primary/5",
      className
    )}>
      {/* Search Section */}
      <div className="flex-1 relative group">
        <MagnifyingGlass 
          size={18} 
          weight="bold" 
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
            isFocused || searchQuery ? "text-primary" : "text-zinc-400 group-hover:text-zinc-500"
          )} 
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full pl-11 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium outline-none transition-all placeholder:text-zinc-400",
            "focus:border-primary/40 focus:bg-white"
          )}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>

      {/* Filters & Actions Section */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Inline Filters */}
        {filters && (
          <div className="flex items-center gap-4 border-l md:border-l-0 md:pl-0 pl-4 border-zinc-200">
            {filters}
          </div>
        )}

        {/* Advanced Filter Trigger */}
        {advancedFilter && (
          <div className="flex items-center pl-2 border-l border-zinc-200/60">
            <Button
              variant="outline"
              size="sm"
              onClick={advancedFilter.onToggle}
              className={cn(
                "h-9 px-3 gap-2 text-[12px] font-bold rounded-xl border-zinc-200 relative",
                advancedFilter.isOpen ? "bg-primary/5 border-primary/30 text-primary" : "bg-white text-zinc-600 hover:bg-zinc-50"
              )}
            >
              <Funnel size={14} weight={advancedFilter.activeCount ? "fill" : "bold"} />
              Filter
              {advancedFilter.activeCount ? (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {advancedFilter.activeCount}
                </span>
              ) : null}
            </Button>
          </div>
        )}

        {/* Auxiliary Actions */}
        {actions && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200/60">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
