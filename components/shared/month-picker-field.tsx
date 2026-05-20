"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthPickerFieldProps {
  value?: number; // 1–12
  onChange: (month: number) => void;
  placeholder?: string;
  error?: boolean;
}

export function MonthPickerField({
  value,
  onChange,
  placeholder = "Select month",
  error,
}: MonthPickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-between gap-2 px-3 py-2 w-44 rounded-lg border bg-background text-label font-medium transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10",
            error ? "border-destructive" : "border-border",
            value ? "text-foreground" : "text-faint"
          )}
        >
          <span>{value ? MONTHS[value - 1] : placeholder}</span>
          <CalendarBlank size={14} className="text-faint shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-52 p-2 rounded-xl">
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((month, idx) => {
            const monthNum = idx + 1;
            const selected = value === monthNum;
            return (
              <button
                key={month}
                type="button"
                onClick={() => onChange(monthNum)}
                className={cn(
                  "py-2 rounded-lg text-label font-semibold border transition-all text-center",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-muted/20"
                )}
              >
                {month}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
