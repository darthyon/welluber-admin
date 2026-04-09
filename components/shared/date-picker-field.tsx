"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarBlank, X } from "@phosphor-icons/react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value?: string; // ISO date string "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  clearable = true,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    if (!value || typeof value !== "string") return undefined;
    
    // Attempt to parse the ISO date string
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    
    // Proper checking: Ensure the resulting date object is valid before returning it
    // This prevents the "Invalid time value" RangeError in format()
    return !isNaN(date.getTime()) ? date : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format to YYYY-MM-DD without timezone shift
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative group">
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 bg-background border border-border rounded-lg text-[14px] font-medium text-left transition-all pr-10",
              "hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/50",
              !selected && "text-muted-foreground/60",
              selected && "text-foreground",
              className
            )}
          >
            <CalendarBlank size={16} className="text-muted-foreground/60 shrink-0" />
            {selected ? format(selected, "dd MMM yyyy") : placeholder}
          </button>
          
          {clearable && selected && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
              title="Clear date"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[300]" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout="dropdown"
          defaultMonth={selected}
          fromYear={2020}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  );
}
