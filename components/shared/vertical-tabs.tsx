"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { IconProps } from "@phosphor-icons/react";

export interface VerticalTabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<IconProps>;
}

interface VerticalTabsProps {
  tabs: readonly VerticalTabItem[] | VerticalTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function VerticalTabs({ tabs, activeTab, onChange, className }: VerticalTabsProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-body font-medium transition-all duration-300 border-l-2",
              isActive
                ? "bg-primary/5 border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border"
            )}
          >
            {Icon && (
              <Icon 
                size={18} 
                weight={isActive ? "fill" : "regular"} 
                className={cn("transition-colors", isActive && "text-primary")} 
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
