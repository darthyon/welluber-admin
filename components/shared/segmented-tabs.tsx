"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { IconProps } from "@phosphor-icons/react"

export interface SegmentedTabItem {
  id: string
  label: string
  icon?: React.ComponentType<IconProps>
}

interface SegmentedTabsProps {
  tabs: readonly SegmentedTabItem[] | SegmentedTabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function SegmentedTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full items-center gap-6 overflow-x-auto border-b border-border",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 py-3 text-body font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {Icon && (
              <Icon
                size={16}
                weight={isActive ? "fill" : "regular"}
                className={cn(isActive && "text-primary")}
              />
            )}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
