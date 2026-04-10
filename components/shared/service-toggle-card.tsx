"use client";

import * as React from "react";
import { Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/shared/switch";
import { Button } from "@/components/ui/button";

interface ServiceToggleCardProps {
  /**
   * The name of the service.
   */
  name: string;
  /**
   * Whether the service is currently selected/active.
   */
  isSelected: boolean;
  /**
   * Callback for toggling the selection state.
   */
  onToggle: (checked: boolean) => void;
  /**
   * List of active sub-services for this selection.
   */
  selectedSubServices: string[];
  /**
   * List of predefined sub-services in the masterlist (for styling).
   */
  masterlistSubServices?: string[];
  /**
   * Callback for adding a sub-service.
   */
  onAddSubService: (val: string) => void;
  /**
   * Callback for removing a sub-service.
   */
  onRemoveSubService: (val: string) => void;
  /**
   * Placeholder for the custom sub-service input.
   */
  placeholder?: string;
}

/**
 * A standardized high-density component for service management.
 * Pairs a main toggle with a Badge Cloud for sub-services and a custom input.
 */
export function ServiceToggleCard({
  name,
  isSelected,
  onToggle,
  selectedSubServices,
  masterlistSubServices = [],
  onAddSubService,
  onRemoveSubService,
  placeholder
}: ServiceToggleCardProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    const val = inputValue.trim();
    if (val) {
      onAddSubService(val);
      setInputValue("");
    }
  };

  return (
    <div 
      className={cn(
        "group p-4 rounded-2xl border transition-all duration-300",
        isSelected 
          ? "bg-primary/[0.02] border-primary/20" 
          : "bg-transparent border-border/50 hover:bg-muted/30 hover:border-primary/30"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Switch 
            checked={isSelected} 
            onCheckedChange={onToggle} 
          />
          <span className={cn(
            "text-body font-semibold tracking-tight transition-colors duration-300",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}>
            {name}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pl-11 space-y-4 animate-in slide-in-from-top-2 duration-300 ease-out">
          {/* Badge Cloud */}
          <div className="flex flex-wrap gap-2">
            {selectedSubServices.map((sub) => {
              const isMasterlist = masterlistSubServices.includes(sub);
              return (
                <span 
                  key={sub} 
                  className={cn(
                    "inline-flex items-center gap-1.5 text-caption px-2.5 py-1 rounded-lg font-medium border transition-all duration-200 group/badge",
                    isMasterlist 
                      ? "bg-muted text-muted-foreground border-border hover:border-muted-foreground/30" 
                      : "bg-primary/[0.04] text-primary border-primary/20 hover:bg-primary/10"
                  )}
                >
                  {sub}
                  {!isMasterlist && (
                    <button 
                      type="button" 
                      onClick={() => onRemoveSubService(sub)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors ml-0.5"
                    >
                      <Trash size={12} weight="bold" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          {/* Quick Input Row */}
          <div className="flex gap-2 max-w-sm mt-3 group/input">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="h-8 w-full px-3 py-1 bg-background border border-border rounded-lg text-label outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/30 focus:shadow-[0_0_10px_-4px_rgba(var(--primary-rgb),0.1)]"
              placeholder={placeholder || `Add custom sub-service...`}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 px-0 border-border text-muted-foreground/60 bg-background hover:text-primary hover:border-primary/30 transition-all shrink-0"
              onClick={handleAdd}
            >
              <Plus size={14} weight="bold" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
