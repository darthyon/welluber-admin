"use client";

import { useState } from "react";
import { CaretDown, IdentificationCard, IdentificationBadge } from "@phosphor-icons/react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ID_TYPES = [
  { id: "IC", label: "NRIC", icon: IdentificationCard, description: "National ID Profile (MyKad)" },
  { id: "Passport", label: "Passport", icon: IdentificationBadge, description: "International Travel Document" },
];

interface IdentificationInputProps {
  type: string;
  number: string;
  onTypeChange: (type: string) => void;
  onNumberChange: (number: string) => void;
  className?: string;
}

export function IdentificationInput({ type, number, onTypeChange, onNumberChange, className }: IdentificationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedType = ID_TYPES.find(t => t.id === type) || ID_TYPES[0];

  return (
    <div className={cn("relative flex items-center h-[38px] bg-white border border-zinc-200 rounded-lg group focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all overflow-hidden", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 h-full border-r border-zinc-100 hover:bg-zinc-50 transition-colors shrink-0">
            <selectedType.icon size={16} className="text-zinc-500" />
            <span className="text-[13px] font-bold text-zinc-700">{selectedType.label}</span>
            <CaretDown size={12} className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[200px] p-1 border-zinc-200 shadow-xl shadow-zinc-200/50">
          <div className="grid gap-0.5">
            {ID_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onTypeChange(t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-50 transition-all text-left",
                  type === t.id && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                  type === t.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-white border-zinc-100 text-zinc-400"
                )}>
                  <t.icon size={18} />
                </div>
                <div>
                  <p className={cn("text-[13px] font-bold", type === t.id ? "text-primary" : "text-zinc-800")}>{t.label}</p>
                  <p className="text-[10px] text-zinc-400 leading-tight">{t.description}</p>
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
          placeholder={type === "IC" ? "000000-00-0000" : "Passport Number"}
          className="w-full h-full pl-3 pr-3 bg-transparent border-none outline-none text-[14px] font-medium text-zinc-700 font-mono tracking-tight"
        />
      </div>
    </div>
  );
}
