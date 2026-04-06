"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Check, CaretDown, Plus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomMultiSelect({ 
  options, 
  selected, 
  onChange,
  placeholder = "Select or type to add...",
  className,
  disabled = false
}: CustomMultiSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt)
  );

  const exactMatch = options.some(opt => opt.toLowerCase() === query.toLowerCase());
  const alreadySelected = selected.some(s => s.toLowerCase() === query.toLowerCase());
  const showAddCustom = query && !exactMatch && !alreadySelected;

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
    setQuery("");
  };

  const addCustom = () => {
    if (query && !selected.includes(query)) {
      onChange([...selected, query]);
      setQuery("");
    }
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
      <div 
        className={cn(
          "relative min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white transition-all cursor-text pr-12",
          isOpen ? "border-primary ring-2 ring-primary/10" : "border-zinc-200 hover:border-zinc-300",
          disabled && "opacity-60 cursor-not-allowed bg-zinc-50"
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {selected.map((s) => (
            <Badge 
              key={s} 
              variant="secondary" 
              className="bg-zinc-100 text-zinc-700 border-zinc-200 px-2.5 py-1 text-[12px] font-medium gap-1.5 group whitespace-nowrap h-7 items-center"
            >
              {s}
              {!disabled && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(s);
                  }}
                  className="hover:text-rose-500 transition-colors shrink-0"
                  type="button"
                >
                  <X size={10} weight="bold" />
                </button>
              )}
            </Badge>
        ))}
        <input 
          type="text"
          className="flex-1 bg-transparent border-0 outline-none text-[13px] placeholder:text-zinc-400 min-w-[80px] h-7 px-1"
          placeholder={selected.length === 0 ? placeholder : ""}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return;
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" && query) {
              e.preventDefault();
              if (showAddCustom) addCustom();
              else if (filteredOptions.length > 0) toggleOption(filteredOptions[0]);
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-400 gap-1.5 pl-2 bg-white/80 backdrop-blur-[2px]">
          {!disabled && selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="p-1 rounded-md hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              title="Clear all"
            >
              <X size={12} weight="bold" />
            </button>
          )}
          <CaretDown size={12} className={cn("transition-transform shrink-0", isOpen && "rotate-180", disabled && "opacity-40")} />
        </div>
      </div>

      {isOpen && (filteredOptions.length > 0 || showAddCustom) && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="z-[1000] overflow-y-auto max-h-[300px] rounded-xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 p-1"
          style={dropdownStyle}
        >
          {showAddCustom && (
            <button
              onClick={addCustom}
              className="w-full text-left px-3 py-2 rounded-lg text-[13px] bg-primary/5 text-primary font-bold flex items-center gap-2 mb-1 border-b border-zinc-50"
            >
              <Plus size={14} weight="bold" />
              <span>Add custom: &quot;{query}&quot;</span>
            </button>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleOption(opt)}
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-zinc-50 text-zinc-600 transition-colors flex items-center justify-between group font-medium"
            >
              <span className="truncate">{opt}</span>
              <Check size={14} className="opacity-0 group-hover:opacity-40" />
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
