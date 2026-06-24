"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { IconProps } from "@phosphor-icons/react";

export interface SegmentedTabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<IconProps>;
}

interface SegmentedTabsProps {
  tabs: readonly SegmentedTabItem[] | SegmentedTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedTabs({ tabs, activeTab, onChange, className }: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all duration-200",
              isActive
                ? "border border-border/50 bg-background text-foreground shadow-sm"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon size={16} weight={isActive ? "fill" : "regular"} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
