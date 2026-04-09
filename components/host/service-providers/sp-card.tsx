"use client";

import { Storefront, Ticket } from "@phosphor-icons/react";
import type { ServiceProvider } from "@/types/provider";
import { PulseStatus } from "@/components/shared/pulse-status";
import { ActionPopover } from "@/components/shared/action-popover";
import { OverflowTags } from "@/components/shared/overflow-tags";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServicePortfolioTags } from "./service-portfolio-tags";

interface SpCardProps {
  sp: ServiceProvider;
}

export function SpCard({ sp }: SpCardProps) {
  const router = useRouter();

  const actions = [
    { label: "View details", href: `/service-providers/${sp.id}` },
    { label: "Edit SP", href: `/service-providers/${sp.id}/edit` },
    { label: "Actions", isSectionTitle: true },
    {
      label: sp.status === "suspended" ? "Activate SP" : "Suspend SP",
      onClick: () => console.log(sp.status === "suspended" ? "activate" : "suspend", sp.id),
      className: sp.status === "suspended" ? "text-emerald-600 font-semibold" : "text-destructive font-semibold",
    },
  ];

  return (
    <TooltipProvider>
      <motion.div
        onClick={() => router.push(`/service-providers/${sp.id}`)}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative glass-card rounded-xl p-5 cursor-pointer overflow-hidden"
      >
        {/* Decorative accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-muted border border-border/60 text-muted-foreground flex items-center justify-center">
              {sp.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sp.logo} alt={sp.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Storefront size={22} weight="fill" />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-[14px] text-foreground leading-tight tracking-tight">{sp.name}</p>
              <div className="flex items-center gap-2">
                <PulseStatus status={sp.status as "active" | "pending" | "suspended"} showLabel />
                <span className="text-[9px] text-muted-foreground/60 font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{sp.registrationNo}</span>
              </div>
            </div>
          </div>

          <ActionPopover actions={actions} />
        </div>

        {/* Main Services */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold tracking-tight text-muted-foreground/60">Main Services</span>
            {sp.mainServices.length === 0 ? (
              <span className="text-[11px] text-muted-foreground/40 italic">None assigned</span>
            ) : (
              <ServicePortfolioTags mainServices={sp.mainServices} />
            )}
          </div>

          {/* Active Vouchers */}
          <div className="flex items-center gap-2 pt-1">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold",
              sp.activeVoucherCount > 0
                ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.1)]"
                : "bg-muted/40 border-border/60 text-muted-foreground/60"
            )}>
              <Ticket size={13} weight="fill" />
              {sp.activeVoucherCount} active voucher{sp.activeVoucherCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 text-[11px] font-medium text-muted-foreground/60">
              {sp.branches.length} branch{sp.branches.length !== 1 ? "es" : ""}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
