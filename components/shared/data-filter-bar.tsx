"use client";

import React, { useState, useRef } from "react";
import { MagnifyingGlass, X, FadersHorizontal } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 py-2 transition-all duration-300",
      className
    )}>
      {/* Container for Search and Filters */}
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search Section */}
        <div className="flex-1 min-w-[200px] max-w-sm relative group">
          <MagnifyingGlass 
            size={18} 
            weight="bold" 
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
              isFocused || searchQuery ? "text-primary" : "text-faint group-hover:text-subtle"
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
              "w-full pl-11 pr-10 py-2.5 bg-background/5 border border-border/60 rounded-lg text-body font-medium outline-none transition-all placeholder:text-faint",
              "focus:border-primary/40 focus:bg-background/20 focus:shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]"
            )}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-faint hover:text-primary hover:bg-primary/5 transition-all"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* Inline Filters */}
        {filters && (
          <div className="flex items-center gap-4">
            {filters}
          </div>
        )}
      </div>

      {/* Advanced Filters & Actions Section */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Advanced Filter Trigger */}
        {advancedFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={advancedFilter.onToggle}
            className={cn(
              "h-10 px-4 gap-2 text-body font-semibold rounded-lg border border-border/60 transition-all",
              advancedFilter.isOpen || (advancedFilter.activeCount ?? 0) > 0 
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" 
                : "bg-background/40 text-muted-foreground hover:bg-accent border-border/40"
            )}
          >
            <FadersHorizontal size={18} weight={(advancedFilter.activeCount ?? 0) > 0 ? "fill" : "bold"} />
            Advanced Filters
            {(advancedFilter.activeCount ?? 0) > 0 && (
              <Badge className="ml-1 h-5 min-w-[20px] px-1.5 bg-primary text-white border-0 text-label font-medium">
                {advancedFilter.activeCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Auxiliary Actions division if needed, but usually actions are enough */}
        {actions && (
          <div className="flex items-center gap-2 pl-3 border-l border-border/60">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
