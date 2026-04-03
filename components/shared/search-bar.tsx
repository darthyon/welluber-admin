"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "Search...", value, onChange, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onChange("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative flex-1 group/search", className)}>
      <MagnifyingGlass 
        size={16} 
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground/60"
        )} 
      />
      <input 
        ref={inputRef}
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full pl-9 pr-9 py-2 bg-muted/30 border border-border rounded-lg text-[13px] outline-none transition-all duration-200",
          "placeholder:text-muted-foreground/50",
          "focus:bg-background focus:ring-1 focus:ring-primary/20 focus:border-primary/30",
          "hover:bg-muted/50"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-muted text-muted-foreground/50 hover:text-foreground transition-all"
        >
          <X size={12} weight="bold" />
        </button>
      )}
    </div>
  );
}
