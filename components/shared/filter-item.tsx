"use client";

import * as React from "react";
import { Check, CaretDown, Funnel } from "@phosphor-icons/react";
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

interface FilterItemProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export function FilterItem({ label, options, value, onChange, icon }: FilterItemProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-medium text-muted-foreground whitespace-nowrap select-none">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3 gap-2 text-[13px] font-normal border-border/60 bg-card hover:bg-muted/50 hover:border-border transition-all rounded-lg",
              value !== "all" && "border-indigo-200 bg-indigo-50/30 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-300"
            )}
          >
            {icon}
            <span className="truncate max-w-[120px]">{selectedOption?.label || "All"}</span>
            <CaretDown size={14} weight="bold" className="opacity-40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-1 shadow-2xl border-border/50 rounded-xl" align="start">
          <div className="flex flex-col gap-0.5">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-[13px] rounded-lg transition-all text-left font-normal",
                  value === option.value
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {option.label}
                {value === option.value && <Check size={14} weight="bold" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
