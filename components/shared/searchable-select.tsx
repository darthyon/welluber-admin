"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretDown, Check } from "@phosphor-icons/react";

interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  emptyText?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled,
  triggerClassName,
  emptyText = "No results found.",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = React.useMemo(
    () =>
      search
        ? options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase())
          )
        : options,
    [options, search]
  );

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-[38px] px-3 py-2 bg-background border border-border rounded-lg text-body font-medium text-foreground transition-all justify-between",
            "hover:border-foreground/20 hover:bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/50",
            !selectedOption && "text-faint",
            triggerClassName
          )}
        >
          <span className="truncate">{selectedOption?.label || placeholder}</span>
          <CaretDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl bg-popover border border-border shadow-lg"
        align="start"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            {filteredOptions.length === 0 ? (
              <CommandEmpty className="py-4 text-label text-muted-foreground text-center">
                {emptyText}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer rounded-lg text-body font-medium"
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {value === opt.value && (
                      <Check size={14} className="shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
