"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Check } from "@phosphor-icons/react";
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
  staticOptions?: string[];
  title?: string;
}

export function SearchableMultiSelect({ 
  taxonomy, 
  selected, 
  onChange,
  placeholder = "Search services...",
  isInline = false,
  staticOptions = [],
  title = "Available Options"
}: SearchableMultiSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const id = React.useId();

  // Filter logic for sectioned taxonomy
  const filteredStaticOptions = React.useMemo(() => 
    staticOptions.filter(opt => 
      opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt)
    ), [staticOptions, query, selected]);

  const filteredTaxonomy = React.useMemo(() => 
    taxonomy.map(cat => ({
      ...cat,
      services: cat.services.filter(s => 
        s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
      )
    })).filter(cat => cat.services.length > 0), [taxonomy, query, selected]);

  const allOptions = React.useMemo(() => {
    const opts: string[] = [...filteredStaticOptions];
    filteredTaxonomy.forEach(cat => opts.push(...cat.services));
    return opts;
  }, [filteredStaticOptions, filteredTaxonomy]);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
    setQuery("");
    setActiveIndex(-1);
    if (!isInline) setIsOpen(false);
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter(s => s !== opt));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => (prev < allOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < allOptions.length) {
          toggleOption(allOptions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case "Backspace":
        if (query === "" && selected.length > 0) {
          removeOption(selected[selected.length - 1]);
        }
        break;
    }
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
        setActiveIndex(-1);
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

  const showList = isInline || (isOpen && (query.length > 0 || allOptions.length > 0));

  const renderDropdownContent = () => (
    <div className="p-1" role="listbox" id={`${id}-listbox`}>
      {/* Header with Clear All only */}
      {(taxonomy.length > 0 || staticOptions.length > 0) && (
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 mb-1">
          <span className="text-label font-medium text-muted-foreground">
            {query ? "Filtered Results" : title}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-label font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      {allOptions.length > 0 ? (
        <div className="space-y-1">
          {filteredStaticOptions.map((opt, idx) => {
            const isHighlighted = activeIndex === idx;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={selected.includes(opt)}
                onClick={() => toggleOption(opt)}
                onMouseEnter={() => setActiveIndex(idx)}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-lg text-body transition-colors flex items-center justify-between group font-semibold text-primary",
                  isHighlighted ? "bg-muted/50" : "hover:bg-muted/50"
                )}
              >
                <span>{opt}</span>
                <Check size={14} className={cn("transition-opacity", selected.includes(opt) ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
              </button>
            );
          })}
          
          {filteredTaxonomy.map((group) => (
            <div key={group.category} className="mb-2">
              {(taxonomy.length > 1 || staticOptions.length > 0) && (
                <div className="px-3 py-1.5 text-label font-medium text-faint select-none">
                  {group.category}
                </div>
              )}
              {group.services.map((opt) => {
                const globalIdx = filteredStaticOptions.length + 
                  filteredTaxonomy.slice(0, filteredTaxonomy.indexOf(group)).reduce((acc, curr) => acc + curr.services.length, 0) + 
                  group.services.indexOf(opt);
                const isHighlighted = activeIndex === globalIdx;
                
                return (
                  <button
                    key={opt}
                    role="option"
                    aria-selected={selected.includes(opt)}
                    onClick={() => toggleOption(opt)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-body transition-colors flex items-center justify-between group font-normal",
                      isHighlighted ? "bg-muted/50" : "hover:bg-muted/50"
                    )}
                  >
                    <span>{opt}</span>
                    <Check size={14} className={cn("transition-opacity", selected.includes(opt) ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground text-label">
          {query ? `No results found matching "${query}"` : "Search to narrow down options"}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("relative w-full", !isInline && isOpen && "z-50")} ref={containerRef}>
      <div className="space-y-2">
        {/* Selected Tags */}
        <div 
          className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
        >
          {selected.map((s) => (
            <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-label font-medium gap-1 group whitespace-nowrap">
              {s}
              <button 
                onClick={() => removeOption(s)}
                className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                type="button"
                aria-label={`Remove ${s}`}
              >
                <X size={10} weight="bold" />
              </button>
            </Badge>
          ))}
          <input 
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-body placeholder:text-faint min-w-[120px] h-6 px-1"
            placeholder={selected.length === 0 ? placeholder : ""}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls={`${id}-listbox`}
            aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
          />
        </div>

        {/* Dropdown Results */}
        {showList && (
          isInline ? (
            <div className="max-h-[300px] mt-0 overflow-y-auto">
              {renderDropdownContent()}
            </div>
          ) : typeof document !== "undefined" ? createPortal(
            <div
              ref={dropdownRef}
              className="z-[1000] max-h-[400px] overflow-y-auto rounded-lg border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-100"
              style={dropdownStyle}
            >
              {renderDropdownContent()}
            </div>,
            document.body
          ) : null
        )}
      </div>
    </div>
  );
}
