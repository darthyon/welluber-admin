"use client";

import * as React from "react";
import { Check, CaretDown, Heartbeat } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchableMultiSelect } from "./searchable-multi-select";

interface MultiSelectFilterProps {
  label: string;
  taxonomy: { category: string; services: string[] }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  singularLabel?: string;
  pluralLabel?: string;
}

export function MultiSelectFilter({ 
  label, 
  taxonomy, 
  selected, 
  onChange,
  singularLabel = "category",
  pluralLabel = "categories"
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const labelText = selected.length === 0 
    ? `All ${pluralLabel.charAt(0).toUpperCase() + pluralLabel.slice(1)}` 
    : selected.length === 1 
      ? selected[0] 
      : `${selected.length} ${pluralLabel}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-label font-medium text-muted-foreground whitespace-nowrap select-none">{label}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3 gap-2 text-nav font-normal border-border/60 bg-card hover:bg-muted/50 hover:border-border transition-all rounded-lg",
              selected.length > 0 && "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30"
            )}
          >
            <span className="truncate max-w-[120px]">{labelText}</span>
            <CaretDown size={14} weight="bold" className="opacity-40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 shadow-2xl border-border overflow-hidden rounded-lg" align="start">
          <div className="flex flex-col max-h-[450px]">
             {/* Integrated Header */}
             <div className="px-4 py-3 border-b border-border/50 bg-muted/10">
               <h4 className="text-caption font-semibold tracking-tight text-muted-foreground/60 flex items-center gap-2">
                 <Heartbeat size={14} weight="bold" className="text-primary" />
                 Select {pluralLabel.charAt(0).toUpperCase() + pluralLabel.slice(1)}
               </h4>
            </div>

            {/* Inline Integrated MultiSelect */}
            <div className="p-2 overflow-y-auto">
              <SearchableMultiSelect 
                taxonomy={taxonomy}
                selected={selected}
                onChange={onChange}
                placeholder={`Search ${pluralLabel}...`}
                isInline={true}
              />
            </div>

            {/* Integrated Footer */}
            {selected.length > 0 && (
              <div className="p-2 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                <span className="text-micro text-muted-foreground font-medium px-2">
                  {selected.length} {pluralLabel} selected
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-caption font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  onClick={() => onChange([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
