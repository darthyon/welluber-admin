"use client";

import { useState } from "react";
import { CaretDown, IdentificationCard, IdentificationBadge } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface IdTypeOption {
  id: string;
  label: string;
  description: string;
}

const DEFAULT_ID_TYPES: IdTypeOption[] = [
  { id: "IC", label: "IC", description: "National Identification Card" },
  { id: "Passport", label: "Passport", description: "International Travel Document" },
];

interface IdentificationInputProps {
  type: string;
  number: string;
  onTypeChange: (type: string) => void;
  onNumberChange: (number: string) => void;
  idTypes?: IdTypeOption[];
  className?: string;
}

export function IdentificationInput({ type, number, onTypeChange, onNumberChange, idTypes, className }: IdentificationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const types = idTypes && idTypes.length > 0 ? idTypes : DEFAULT_ID_TYPES;
  const selectedType = types.find(t => t.id === type) || types[0]!;

  return (
    <div className={cn("relative flex items-center h-[38px] bg-background border border-border rounded-lg group focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all overflow-hidden", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 px-3 h-full border-r border-border/50 hover:bg-muted transition-colors shrink-0">
            <IdentificationCard size={16} className="text-faint" />
            <span className="text-body font-medium text-foreground">{selectedType.label}</span>
            <CaretDown size={12} className={cn("text-faint transition-transform", isOpen && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[220px] p-1 border-border shadow-2xl z-[200]">
          <div className="grid gap-0.5">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onTypeChange(t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-all text-left",
                  type === t.id && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                  type === t.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border/40 text-faint"
                )}>
                  <IdentificationCard size={18} />
                </div>
                <div>
                  <p className={cn("text-body font-semibold", type === t.id ? "text-primary" : "text-foreground")}>{t.label}</p>
                  <p className="text-label text-faint leading-tight">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1 relative flex items-center h-full">
        <input
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={selectedType.id === "Passport" ? "Passport Number" : "ID Number"}
          className="w-full h-full pl-3 pr-3 bg-transparent border-none outline-none text-body font-medium text-foreground font-mono tracking-tight"
        />
      </div>
    </div>
  );
}
