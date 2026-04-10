"use client";

import { useState } from "react";
import { CaretDown, Phone } from "@phosphor-icons/react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
];

interface PhoneInputProps {
  value: string; // The full number with prefix
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder = "12-345 6789", className }: PhoneInputProps) {
  // Parse initial value to find matching country
  const initialCountry = COUNTRIES.find(c => value.startsWith(c.code)) || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [isOpen, setIsOpen] = useState(false);

  // Extract the number part without prefix
  const numberPart = value.startsWith(selectedCountry.code) 
    ? value.slice(selectedCountry.code.length).trim() 
    : value;

  const handleNumberChange = (newNumber: string) => {
    // Only allow digits, spaces, and hyphens
    const cleanNumber = newNumber.replace(/[^\d\s-]/g, "");
    onChange(`${selectedCountry.code} ${cleanNumber}`);
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    onChange(`${country.code} ${numberPart}`);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative flex items-center h-[38px] bg-background border border-border rounded-lg group focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all overflow-hidden", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 h-full border-r border-border/50 hover:bg-muted transition-colors shrink-0">
            <span className="text-[16px]">{selectedCountry.flag}</span>
            <span className="text-nav font-semibold text-foreground font-mono">{selectedCountry.code}</span>
            <CaretDown size={12} className={cn("text-muted-foreground/60 transition-transform", isOpen && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[180px] p-1 border-border shadow-2xl z-[200]">
          <div className="grid gap-0.5">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-all text-left group",
                  selectedCountry.code === c.code && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[16px]">{c.flag}</span>
                  <span className={cn("text-nav font-medium", selectedCountry.code === c.code ? "text-primary" : "text-foreground/80")}>
                    {c.name}
                  </span>
                </div>
                <span className="text-caption font-semibold text-muted-foreground/40 font-mono group-hover:text-primary/70">{c.code}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1 relative flex items-center h-full">
        <Phone size={16} className="absolute left-3 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
        <input 
          type="tel"
          value={numberPart}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full pl-10 pr-3 bg-transparent border-none outline-none text-body font-medium text-foreground/80 font-mono tracking-tight"
        />
      </div>
    </div>
  );
}
