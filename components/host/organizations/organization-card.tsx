"use client";

import { Buildings, DotsThreeVertical, Users, Shield, ChartPieSlice } from "@phosphor-icons/react";
import { Organization } from "@/features/organizations/types";
import { PulseStatus } from "@/components/shared/pulse-status";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { UtilizationChart } from "./utilization-chart";
import { EntityAvatar } from "@/components/shared/entity-avatar";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface OrganizationCardProps {
  org: Organization;
}

export function OrganizationCard({ org }: OrganizationCardProps) {
  const router = useRouter();

  // Professional color mapping for utilization
  const getUtilColor = (val: number) => {
    if (val > 80) return "text-rose-500";
    if (val > 50) return "text-amber-500";
    return "text-emerald-500";
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', { 
      style: 'currency', 
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const actions = [
    { 
      label: "Edit organisation", 
      href: `/organizations/${org.id}/edit` 
    },
    { 
      label: "Quick invite admin", 
      onClick: () => console.log("Invite clicked") 
    },
    { 
      label: "Organisation settings", 
      isSectionTitle: true 
    },
    { 
      label: "Benefit policies", 
      href: `/organizations/${org.id}?tab=policies`,
      className: "text-primary font-semibold"
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        onClick={() => router.push(`/organizations/${org.id}`)}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative glass-card rounded-lg p-5 cursor-pointer overflow-hidden"
      >
        {/* Bento-style Decorative Accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />


        {/* Top Section: Header & Actions */}
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3.5">
            <EntityAvatar name={org.name} size="lg" />

            <div className="space-y-1.5">
              <Link 
                href={`/organizations/${org.id}`}
                className="font-semibold text-body text-foreground hover:text-primary transition-colors block leading-tight"
              >
                {org.name}
              </Link>
              <div className="flex items-center gap-2">
                <PulseStatus status={org.status as any} showLabel={true} className="px-1.5 py-0.5 rounded-md text-micro" />
                <span className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{org.id}</span>
              </div>
            </div>
          </div>

          <ActionPopover actions={actions} />
        </div>

        {/* Content Sections */}
        <div className="space-y-6 relative z-10">
          
          {/* Row 1: Employees & Utilization (Paired) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Workforce / Employees */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <Users size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Workforce</span>
            </div>
              <div className="space-y-2">
                <span className="text-body font-semibold text-foreground block">
                  {org.employeeCount.toLocaleString()} <span className="text-label font-normal text-faint">pax</span>
                </span>
              </div>
            </div>

            {/* Utilization */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-faint">
                <ChartPieSlice size={14} weight="bold" />
                <span className="text-label font-semibold text-faint leading-none">Utilisation & Claims</span>
              </div>
              <div className="flex items-center gap-3">
                <UtilizationChart value={org.utilizationRate} mode="ring" size={44} strokeWidth={4} />
                <div className="flex flex-col justify-center">
                  <span className={cn("text-body font-semibold leading-tight", getUtilColor(org.utilizationRate))}>
                    {formatCurrency(org.totalWalletBalance)}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-micro text-faint font-medium tabular-nums">
                      / {formatCurrency(org.walletLimit)}
                    </span>
                    {org.claimsCount !== undefined && (
                      <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-semibold bg-muted/40 border-border/50 text-subtle tabular-nums">
                        {org.claimsCount} claims
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Policies (Full Width) */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-faint mb-3">
              <Shield size={14} weight="bold" />
              <span className="text-label font-semibold text-faint leading-none">Benefit policies</span>
              <span className="h-2 w-2 rounded-full bg-border flex items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {org.policies.length === 0 ? (
                <span className="text-label text-faint font-semibold italic">Unassigned</span>
              ) : (
                <>
                  {org.policies.slice(0, 3).map((policy, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-background/40 hover:bg-background/60 text-label font-medium px-2.5 py-0.5 border-border/60 h-6 transition-colors text-subtle"
                    >
                      {policy}
                    </Badge>
                  ))}
                  {org.policies.length > 3 && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-label text-subtle hover:text-primary font-semibold px-1.5 underline decoration-border underline-offset-4 transition-colors"
                        >
                          +{org.policies.length - 3} more
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="w-56 bg-popover rounded-lg border border-border shadow-2xl z-[200] p-1" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-1.5">
                          <label className="text-label font-medium text-subtle pl-1">Benefit ID</label>
                          <div className="max-h-[160px] overflow-y-auto px-1 space-y-1">
                            {org.policies.slice(3).map((policy, i) => (
                              <div key={i} className="text-label px-2 py-1.5 hover:bg-accent rounded-lg text-subtle transition-colors truncate font-medium">
                                {policy}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
