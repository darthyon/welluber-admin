"use client";

import { Storefront, Ticket, Package, MapPin } from "@phosphor-icons/react";
import type { ServiceProvider } from "@/types/provider";
import { PulseStatus } from "@/components/shared/pulse-status";
import { ActionPopover } from "@/components/shared/action-popover";
import { OverflowTags } from "@/components/shared/overflow-tags";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ServicePortfolioTags } from "./service-portfolio-tags";
import { Badge } from "@/components/ui/badge";

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
        className="group relative glass-card rounded-lg p-5 cursor-pointer overflow-hidden"
      >
        {/* Decorative accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-muted border border-border/60 text-muted-foreground flex items-center justify-center">
              {sp.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sp.logo} alt={sp.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Storefront size={22} weight="fill" />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-body text-foreground leading-tight tracking-tight">{sp.name}</p>
              <div className="flex items-center gap-2">
                <PulseStatus status={sp.status as "active" | "pending" | "suspended"} showLabel />
                <span className="text-micro text-muted-foreground/60 font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{sp.registrationNo}</span>
              </div>
            </div>
          </div>

          <ActionPopover actions={actions} />
        </div>


        {/* Main Content: Standardized Field Grid */}
        <div className="relative z-10 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Main Services */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <Package size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60 leading-none">Main Services</span>
            </div>
              {sp.mainServices.length === 0 ? (
                <span className="text-caption text-muted-foreground/40 italic block mt-1">None assigned</span>
              ) : (
                <div className="mt-1">
                  <ServicePortfolioTags mainServices={sp.mainServices} />
                </div>
              )}
            </div>

            {/* Active Vouchers */}
            <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <Ticket size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60 leading-none">Active Vouchers</span>
            </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/service-providers/${sp.id}?tab=vouchers`);
                }}
                className="group/vouchers cursor-pointer hover:text-primary transition-colors flex items-baseline gap-1.5 mt-0.5"
              >
                <span className="text-body font-semibold text-foreground group-hover/vouchers:text-primary transition-colors">
                  {sp.activeVoucherCount}
                </span>
                <span className="text-caption font-normal text-muted-foreground/60">pax active</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground/40 mb-3">
              <MapPin size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60 leading-none">Branches</span>
              <span className="h-2 w-2 rounded-full bg-border/60 flex items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sp.branches.length === 0 ? (
                <span className="text-caption text-muted-foreground/40 font-semibold italic">No branches</span>
              ) : (
                <>
                  {sp.branches.slice(0, 3).map((branch, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-background/40 hover:bg-background/60 text-caption font-medium px-2.5 py-0.5 border-border/60 h-6 transition-colors text-foreground/70"
                    >
                      {branch.name}
                    </Badge>
                  ))}
                  {sp.branches.length > 3 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-caption text-muted-foreground/60 hover:text-primary font-semibold px-1.5 h-6 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          +{sp.branches.length - 3} more
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-52 p-1.5 bg-popover rounded-lg border border-border/60 shadow-2xl z-[200]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-micro font-semibold text-muted-foreground/40 px-2.5 py-1.5 tracking-tight">
                            Other locations
                          </span>
                          {sp.branches.slice(3).map((branch, i) => (
                            <div 
                              key={i}
                              className="text-label px-2.5 py-1.5 hover:bg-muted/60 rounded-lg text-foreground/80 font-medium transition-colors cursor-default"
                            >
                              {branch.name}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
