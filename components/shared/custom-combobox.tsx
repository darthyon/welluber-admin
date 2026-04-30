"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, CaretDown, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CustomComboBoxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomComboBox({ 
  options, 
  value, 
  onChange,
  placeholder = "Select or type...",
  className
}: CustomComboBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.toLowerCase() === value.toLowerCase());
  const showAddCustom = value && !exactMatch;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        minWidth: "200px",
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border bg-background/5 text-body transition-all outline-none pr-10",
            isOpen ? "border-primary ring-2 ring-primary/10" : "border-border/60 hover:border-primary/30 transition-all",
            !value && "placeholder:text-faint"
          )}
          placeholder={placeholder}
        />
        <div 
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center h-full w-8"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CaretDown size={14} className={cn("text-faint transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (filteredOptions.length > 0 || showAddCustom) && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="z-[1000] overflow-y-auto max-h-[300px] rounded-lg border border-border/60 bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-100 p-1"
          style={dropdownStyle}
        >
          {showAddCustom && (
            <button
              onClick={() => handleSelect(value)}
            className="w-full text-left px-3 py-2 rounded-lg text-body bg-primary/10 text-primary font-semibold flex items-center gap-2 mb-1 border-b border-border/20"
            >
              <Plus size={14} weight="bold" />
              <span>Add custom: &quot;{value}&quot;</span>
            </button>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-body transition-colors flex items-center justify-between group",
                value === opt ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent/40 text-subtle hover:text-foreground"
              )}
            >
              <span className="truncate">{opt}</span>
              {value === opt && <Check size={14} className="text-primary shrink-0" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
