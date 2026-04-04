"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, MagnifyingGlass, Check, CaretDown } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaxonomyCategory {
  category: string;
  services: string[];
}

interface SearchableMultiSelectProps {
  taxonomy: TaxonomyCategory[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isInline?: boolean;
}

export function SearchableMultiSelect({ 
  taxonomy, 
  selected, 
  onChange,
  placeholder = "Search services...",
  isInline = false
}: SearchableMultiSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

  // Filter logic for sectioned taxonomy
  const filteredTaxonomy = taxonomy.map(cat => ({
    ...cat,
    services: cat.services.filter(s => 
      s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
    )
  })).filter(cat => cat.services.length > 0);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
    setQuery("");
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter(s => s !== opt));
  };

  // Close when clicking outside (only if not inline)
  React.useEffect(() => {
    if (isInline) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInline]);

  React.useEffect(() => {
    if (isInline || !isOpen || !containerRef.current) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isInline, isOpen, query, selected.length]);

  const showList = isInline || (isOpen && (query.length > 0 || filteredTaxonomy.length > 0));

  return (
    <div className={cn("relative w-full", !isInline && isOpen && "z-50")} ref={containerRef}>
      <div className="space-y-2">
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
          {selected.map((s) => (
            <Badge key={s} variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 px-2 py-0.5 text-[11px] font-medium gap-1 group whitespace-nowrap">
              {s}
              <button 
                onClick={() => removeOption(s)}
                className="hover:text-rose-500 transition-colors"
                type="button"
              >
                <X size={10} weight="bold" />
              </button>
            </Badge>
          ))}
          <input 
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] placeholder:text-muted-foreground/60 min-w-[120px] h-6 px-1"
            placeholder={selected.length === 0 ? placeholder : ""}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
          />
        </div>

        {/* Dropdown Results */}
        {showList && (
          isInline ? (
            <div className="max-h-[300px] mt-0 overflow-y-auto">
              <div className="p-1">
                {filteredTaxonomy.length > 0 ? (
                  filteredTaxonomy.map((group) => (
                    <div key={group.category} className="mb-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">
                        {group.category}
                      </div>
                      {group.services.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleOption(opt)}
                          type="button"
                          className="w-full text-left px-3 py-1.5 rounded-lg text-[13px] hover:bg-muted/50 transition-colors flex items-center justify-between group font-normal"
                        >
                          <span>{opt}</span>
                          <Check size={14} className="opacity-0 group-hover:opacity-40" />
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-[12px]">
                    {query ? `No services found matching "${query}"` : "Search to narrow down services"}
                  </div>
                )}
              </div>
            </div>
          ) : typeof document !== "undefined" ? createPortal(
            <div
              ref={dropdownRef}
              className="z-[1000] max-h-[400px] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-100"
              style={dropdownStyle}
            >
              <div className="p-1">
                {filteredTaxonomy.length > 0 ? (
                  filteredTaxonomy.map((group) => (
                    <div key={group.category} className="mb-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">
                        {group.category}
                      </div>
                      {group.services.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleOption(opt)}
                          type="button"
                          className="w-full text-left px-3 py-1.5 rounded-lg text-[13px] hover:bg-muted/50 transition-colors flex items-center justify-between group font-normal"
                        >
                          <span>{opt}</span>
                          <Check size={14} className="opacity-0 group-hover:opacity-40" />
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-[12px]">
                    {query ? `No services found matching "${query}"` : "Search to narrow down services"}
                  </div>
                )}
              </div>
            </div>,
            document.body
          ) : null
        )}
      </div>
    </div>
  );
}
