"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COUNTRIES = [
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "Phone number",
  className,
  error,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  
  // Try to parse dial code from value
  const selectedCountry = React.useMemo(() => {
    if (!value) return COUNTRIES[0]; // Default to Malaysia
    const match = COUNTRIES.find(c => value.startsWith(c.dialCode));
    return match || COUNTRIES[0];
  }, [value]);

  const phoneNumber = React.useMemo(() => {
    if (!value) return "";
    return value.replace(selectedCountry.dialCode, "").trim();
  }, [value, selectedCountry]);

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    const newValue = `${country.dialCode} ${phoneNumber}`;
    onChange?.(newValue);
    setOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const newValue = `${selectedCountry.dialCode} ${rawValue}`;
    onChange?.(newValue);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[95px] px-3 shrink-0 justify-between font-medium border-border hover:bg-muted/50",
              error && "border-destructive ring-destructive/20"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="text-nav">{selectedCountry.dialCode}</span>
            </span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="p-1 max-h-[300px] overflow-y-auto">
             <p className="text-micro font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 py-2">Select Country</p>
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-nav rounded-md hover:bg-muted transition-colors",
                  selectedCountry.code === country.code && "bg-muted/50"
                )}
                onClick={() => handleCountrySelect(country)}
              >
                <span className="text-xl leading-none">{country.flag}</span>
                <span className="flex-1 text-left font-medium">{country.name}</span>
                <span className="text-muted-foreground text-caption">{country.dialCode}</span>
                {selectedCountry.code === country.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
          error 
            ? "border-destructive ring-1 ring-destructive/20" 
            : "border-border focus:border-foreground/30 focus:bg-muted/30"
        )}
      />
    </div>
  );
}
