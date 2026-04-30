"use client";

import * as React from "react";
import { Check, CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchableFilterItemProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export function SearchableFilterItem({ 
  label, 
  options, 
  value, 
  onChange, 
  icon,
  placeholder = "Search options...",
  className
}: SearchableFilterItemProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-label font-medium text-muted-foreground whitespace-nowrap select-none">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3 gap-2 text-body font-normal border-border/60 bg-card hover:bg-muted/50 hover:border-border transition-all rounded-lg",
              value !== "all" && "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30"
            )}
          >
            {icon}
            <span className="truncate max-w-[120px]">{selectedOption?.label || "All"}</span>
            <CaretDown size={14} weight="bold" className="opacity-40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0 shadow-2xl border-border/50 rounded-lg overflow-hidden" align="start">
          <div className="flex flex-col h-full max-h-[300px]">
            <div className="p-2 border-b border-border/40 bg-muted/20 flex items-center gap-2">
              <MagnifyingGlass size={16} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-body h-7 focus:ring-0 placeholder:text-faint"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-body rounded-lg transition-all text-left font-normal",
                      value === option.value
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check size={14} weight="bold" />}
                  </button>
                ))
              ) : (
                <div className="py-6 px-4 text-center text-label text-muted-foreground font-medium italic">
                  No results found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
