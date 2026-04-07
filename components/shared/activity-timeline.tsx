"use client";

import * as React from "react";
import { ClockCounterClockwise, Plus, Check, Trash, Pencil, CurrencyCircleDollar, Gear, ShieldCheck, User, Users } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type ActivityType = "Create" | "Update" | "Delete" | "Approval" | "Payout" | "System" | "SettingChange" | "Link";

export interface ActivityTimelineItem {
  id: string | number;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  type?: ActivityType;
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const TYPE_ICONS: Record<ActivityType, React.ReactElement> = {
  Create: <Plus size={12} weight="bold" />,
  Update: <Pencil size={12} weight="bold" />,
  Delete: <Trash size={12} weight="bold" />,
  Approval: <Check size={12} weight="bold" />,
  Payout: <CurrencyCircleDollar size={12} weight="bold" />,
  System: <Gear size={12} weight="bold" />,
  SettingChange: <ShieldCheck size={12} weight="bold" />,
  Link: <Users size={12} weight="bold" />,
};

const TYPE_COLORS: Record<ActivityType, string> = {
  Create: "bg-blue-500",
  Update: "bg-amber-500",
  Delete: "bg-rose-500",
  Approval: "bg-emerald-500",
  Payout: "bg-indigo-500",
  System: "bg-zinc-500",
  SettingChange: "bg-purple-500",
  Link: "bg-sky-500",
};

export function ActivityTimeline({ items, title, icon, className }: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-6">
          {icon || <ClockCounterClockwise size={18} weight="bold" className="text-primary" />}
          {title && <h3 className="text-[14px] font-bold text-foreground">{title}</h3>}
        </div>
      )}

      <div className="relative">
        {items.map((item, i) => {
          const type = item.type || "System";
          const isLast = i === items.length - 1;

          return (
            <div 
              key={item.id} 
              className={cn(
                "relative pl-8 pb-8 last:pb-0 group",
                !isLast && "before:absolute before:left-[4.5px] before:top-[22px] before:bottom-0 before:w-[1px] before:bg-border before:transition-colors group-hover:before:bg-primary/20"
              )}
            >
              {/* Timeline Dot/Icon */}
              <div className={cn(
                "absolute left-[1px] top-1.5 w-2 h-2 rounded-full ring-[4px] ring-background z-10 transition-all duration-300",
                item.type ? `${TYPE_COLORS[type]} shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]` : "bg-muted-foreground/30"
              )}>
                {item.type && (
                  <div className="absolute inset-0 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-200">
                    {/* Optional: Show small icon on hover if needed, or just keep it simple */}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-[13.5px] font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider tabular-nums">
                    {item.timestamp.split(',')[1]?.trim() || item.timestamp}
                  </span>
                </div>
                
                <p className="text-[12.5px] text-muted-foreground leading-relaxed font-medium opacity-80">
                    {item.description}
                </p>

                <div className="flex items-center gap-2 mt-1.5 font-medium">
                  {item.user && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                        <User size={10} className="text-muted-foreground" />
                      </div>
                      <span className="text-[11px] text-muted-foreground/60">
                        by <span className="text-foreground font-bold">{item.user}</span>
                      </span>
                    </div>
                  )}
                  {item.user && item.timestamp.includes(',') && (
                    <span className="text-[10px] text-muted-foreground/30">•</span>
                  )}
                  <span className="text-[11px] text-muted-foreground/50">
                    {item.timestamp.includes(',') ? item.timestamp.split(',')[0] : item.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mb-4 border border-dashed border-zinc-200">
              <ClockCounterClockwise size={24} />
            </div>
            <p className="text-[13px] text-zinc-500 font-medium">No activities recorded in this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
