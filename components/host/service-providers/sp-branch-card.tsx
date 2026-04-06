"use client";

import { MapPin, Clock, Buildings } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { SpBranch } from "@/types/provider";
import { OPERATING_DAYS } from "@/features/providers/constants";
import { cn } from "@/lib/utils";

interface SpBranchCardProps {
  branch: SpBranch;
  onView: () => void;
  onEdit: () => void;
}

function getHoursSummary(branch: SpBranch): string {
  const hours = branch.operatingHours;
  const openDays = OPERATING_DAYS.filter((d) => !hours[d.key].isClosed);
  if (openDays.length === 0) return "Closed all week";
  // Check if all open days have same hours
  const firstDay = hours[openDays[0].key];
  const allSame = openDays.every(
    (d) => hours[d.key].open === firstDay.open && hours[d.key].close === firstDay.close
  );
  if (allSame) {
    return `${openDays[0].label.slice(0, 3)}–${openDays[openDays.length - 1].label.slice(0, 3)} ${firstDay.open}–${firstDay.close}`;
  }
  return `Open ${openDays.length} days/week`;
}

export function SpBranchCard({ branch, onView, onEdit }: SpBranchCardProps) {
  const actions = [
    { label: "View details", onClick: onView },
    { label: "Edit branch", onClick: onEdit },
  ];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onView}
      className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden relative flex flex-col h-full"
    >
      {/* Decorative Accent (Aligned with Org Card) */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
            <Buildings size={20} weight="fill" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[14px] text-foreground group-hover:text-primary transition-all tracking-tight leading-none">
                {branch.name}
              </h4>
              <StatusBadge status={branch.isActive ? "Active" : "Suspended"} variant={branch.isActive ? "emerald" : "zinc"} />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <MapPin size={12} className="opacity-70" />
              <span className="font-medium">{branch.address.city}, {branch.address.state}</span>
            </div>
          </div>
        </div>

        <ActionPopover actions={actions} />
      </div>

      {/* Services (Pills) */}
      <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
        {branch.services.slice(0, 3).map((s, i) => (
          <Badge key={i} variant="secondary" className="text-[10px] font-medium bg-muted/50 border-border/40 text-muted-foreground px-2 h-5">
            {s.service}
          </Badge>
        ))}
        {branch.services.length > 3 && (
          <span className="text-[10px] text-muted-foreground/60 font-semibold ml-0.5">+{branch.services.length - 3} more</span>
        )}
      </div>

      {/* Footer Footer Footer (Operating Hours Matching Org staff/wallet styling) */}
      <div className="mt-auto pt-4 border-t border-border/40 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-tight text-muted-foreground/60">Operating hours</span>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
            <Clock size={14} weight="duotone" className="text-primary" />
            <span>{getHoursSummary(branch)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
