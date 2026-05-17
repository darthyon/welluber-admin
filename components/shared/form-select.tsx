"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/searchable-select";

const SEARCH_THRESHOLD = 7;

interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  error?: boolean;
  searchable?: boolean;
}

export function FormSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder,
  disabled,
  triggerClassName,
  error,
  searchable,
}: FormSelectProps) {
  const validOptions = options.filter((opt) => opt.value !== "");
  const isSearchable = searchable ?? validOptions.length > SEARCH_THRESHOLD;

  if (isSearchable) {
    return (
      <SearchableSelect
        value={value}
        onChange={onChange}
        options={validOptions}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        disabled={disabled}
        triggerClassName={cn(
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          triggerClassName
        )}
      />
    );
  }

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "w-full h-[38px] px-3 py-2 bg-background border border-border rounded-lg text-body font-medium text-foreground transition-all",
          "hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/50",
          "data-[placeholder]:text-faint",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="w-full min-w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-y-auto rounded-xl bg-popover border border-border shadow-lg"
        position="popper"
        align="start"
      >
        {validOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg text-body font-medium cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
