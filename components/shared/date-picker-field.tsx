"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarBlank } from "@phosphor-icons/react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value?: string; // ISO date string "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] font-medium text-left transition-all",
            "hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50",
            !selected && "text-zinc-400",
            selected && "text-zinc-700",
            className
          )}
        >
          <CalendarBlank size={16} className="text-zinc-400 shrink-0" />
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </button>
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
