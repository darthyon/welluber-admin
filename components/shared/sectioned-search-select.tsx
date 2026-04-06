"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlass, Check, CaretDown, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TaxonomyCategory {
  category: string;
  services: string[];
}

interface SectionedSearchSelectProps {
  taxonomy: TaxonomyCategory[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
}

export function SectionedSearchSelect({ 
  taxonomy, 
  value, 
  onChange,
  placeholder = "Select service...",
  className,
  clearable = true,
  disabled = false
}: SectionedSearchSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

  const filteredTaxonomy = taxonomy.map(cat => ({
    ...cat,
    services: cat.services.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.services.length > 0);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
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
        minWidth: "240px",
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
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl border bg-white text-[13px] transition-all text-left pr-12",
          isOpen ? "border-primary ring-2 ring-primary/10" : "border-zinc-200 hover:border-zinc-300",
          !value && "text-zinc-400",
          disabled && "opacity-60 cursor-not-allowed bg-zinc-50"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
      </button>

      <div className="absolute right-3 top-[22px] -translate-y-1/2 flex items-center gap-1.5 px-0.5 pointer-events-none">
        {!disabled && clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors pointer-events-auto"
            title="Clear selection"
          >
            <X size={12} weight="bold" />
          </button>
        )}
        <CaretDown size={14} className={cn("text-zinc-400 transition-transform shrink-0", isOpen && "rotate-180", disabled && "opacity-40")} />
      </div>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="z-[1000] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          style={dropdownStyle}
        >
          <div className="p-2 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
            <MagnifyingGlass size={16} className="text-zinc-400 shrink-0" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent border-0 outline-none text-[13px] h-8"
              placeholder="Search services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredTaxonomy.length > 0 ? (
              filteredTaxonomy.map((group) => (
                <div key={group.category} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 select-none">
                    {group.category}
                  </div>
                  {group.services.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between group",
                        value === opt ? "bg-primary/5 text-primary font-semibold" : "hover:bg-zinc-50 text-zinc-600"
                      )}
                    >
                      <span>{opt}</span>
                      {value === opt && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-400 text-[12px]">
                No services found matching &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
