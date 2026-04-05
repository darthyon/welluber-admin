"use client";

import { Storefront, Ticket } from "@phosphor-icons/react";
import type { ServiceProvider } from "@/types/provider";
import { PulseStatus } from "@/components/shared/pulse-status";
import { ActionPopover } from "@/components/shared/action-popover";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Decorative accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-100/80 border border-zinc-200/60 text-zinc-500 flex items-center justify-center">
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
                <span className="text-[9px] text-zinc-400 font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 tracking-tight">{sp.registrationNo}</span>
              </div>
            </div>
          </div>

          <ActionPopover actions={actions} />
        </div>

        {/* Service Categories */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold tracking-tight text-zinc-400">Service categories</span>
            <div className="flex flex-wrap gap-1.5">
              {sp.serviceCategories.length === 0 ? (
                <span className="text-[11px] text-zinc-400 italic">None assigned</span>
              ) : (
                <>
                  {sp.serviceCategories.slice(0, 3).map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] font-medium bg-white border-zinc-200 text-zinc-600 px-2 py-0.5 h-5">
                      {cat}
                    </Badge>
                  ))}
                  {sp.serviceCategories.length > 3 && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold px-1.5 underline decoration-zinc-200 underline-offset-4 transition-colors"
                        >
                          +{sp.serviceCategories.length - 3} more
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="w-52 bg-white rounded-2xl border-zinc-200 shadow-2xl z-[200]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-semibold tracking-tight text-zinc-400 px-2 py-1 opacity-50">All categories</span>
                          {sp.serviceCategories.slice(3).map((cat, i) => (
                            <div key={i} className="text-[12px] px-2 py-1.5 hover:bg-zinc-50 rounded-lg text-zinc-700 font-medium">{cat}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Active Vouchers */}
          <div className="flex items-center gap-2 pt-1">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold",
              sp.activeVoucherCount > 0
                ? "bg-primary/5 border-primary/20 text-primary"
                : "bg-zinc-50 border-zinc-200 text-zinc-400"
            )}>
              <Ticket size={13} weight="fill" />
              {sp.activeVoucherCount} active voucher{sp.activeVoucherCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
              {sp.branches.length} branch{sp.branches.length !== 1 ? "es" : ""}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
