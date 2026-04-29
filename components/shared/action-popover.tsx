"use client";

import { DotsThreeVertical } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import React from "react";

export interface ActionItem {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  className?: string;
  isDanger?: boolean;
  isSectionTitle?: boolean;
  icon?: React.ReactNode;
}

interface ActionPopoverProps {
  actions: ActionItem[];
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  label?: string;
}

export function ActionPopover({ 
  actions, 
  triggerClassName, 
  contentClassName,
  align = "end",
  label
}: ActionPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0",
            label ? "px-3 py-1.5 text-nav font-medium" : "p-1.5",
            triggerClassName
          )}
        >
          {label && <span className="text-nav font-medium">{label}</span>}
          <DotsThreeVertical size={20} weight="bold" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        align={align}
        className={cn(
          "w-52 p-1.5 bg-card border border-border shadow-2xl rounded-lg z-50 animate-in fade-in zoom-in-95 duration-100", 
          contentClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {actions.map((action, i) => {
            if (action.isSectionTitle) {
              return (
                <div key={i} className="px-3 py-1.5 text-micro font-semibold text-muted-foreground opacity-50 select-none">
                  {action.label}
                </div>
              );
            }

            const Component = action.href ? "a" : "button";
            
            return (
              <React.Fragment key={i}>
                <Component
                  href={action.href}
                  onClick={(e) => {
                    if (action.onClick) {
                      e.preventDefault();
                      e.stopPropagation();
                      action.onClick(e);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-nav font-medium transition-colors text-left",
                    action.isDanger 
                      ? "text-rose-500 hover:bg-rose-50" 
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    action.className
                  )}
                >
                  {action.icon && <span className="text-muted-foreground/60">{action.icon}</span>}
                  {action.label}
                </Component>
                {/* Visual separator before section titles (except first) */}
                {i < actions.length - 1 && actions[i+1].isSectionTitle && (
                  <div className="h-px bg-border/50 mx-2 my-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
