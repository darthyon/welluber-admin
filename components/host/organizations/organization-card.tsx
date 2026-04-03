"use client";

import { Buildings, DotsThreeVertical, Users, Shield, ChartPieSlice } from "@phosphor-icons/react";
import { Organization } from "@/features/organizations/types";
import { PulseStatus } from "@/components/shared/pulse-status";
import { StackedAvatars } from "@/components/shared/stacked-avatars";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActionPopover } from "@/components/shared/action-popover";
import { UtilizationChart } from "./utilization-chart";

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
      label: "Organization settings", 
      isSectionTitle: true 
    },
    { 
      label: "Manage benefit policies", 
      href: `/organizations/${org.id}?tab=policies`,
      className: "text-indigo-600 font-semibold"
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        onClick={() => router.push(`/organizations/${org.id}`)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Bento-style Decorative Accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />


        {/* Top Section: Header & Actions */}
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100/80 border border-zinc-200/60 text-zinc-500 flex items-center justify-center transition-all duration-300">
              <Buildings size={24} weight="fill" />
            </div>

            <div className="space-y-1.5">
              <Link 
                href={`/organizations/${org.id}`}
                className="font-bold text-[16px] text-foreground hover:text-zinc-900 transition-colors block leading-tight tracking-tight"
              >
                {org.name}
              </Link>
              <div className="flex items-center gap-2">
                <PulseStatus status={org.status as any} showLabel={true} className="px-1.5 py-0.5 rounded-md text-[10px]" />
                <span className="text-[10px] text-zinc-400 font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 uppercase tracking-widest">{org.id}</span>
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
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Users size={14} weight="bold" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Workforce</span>
              </div>
              <div className="space-y-2">
                <span className="text-[14px] font-bold text-zinc-800 block">
                  {org.employeeCount.toLocaleString()} <span className="text-[11px] font-normal text-zinc-400">pax</span>
                </span>
                <StackedAvatars count={org.employeeCount} className="mt-1" />
              </div>
            </div>

            {/* Utilization */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ChartPieSlice size={14} weight="bold" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Utilization</span>
              </div>
              <div className="flex items-center gap-3">
                <UtilizationChart value={org.utilizationRate} mode="ring" size={44} strokeWidth={4} />
                <div className="flex flex-col justify-center">
                  <span className={cn("text-[14px] font-bold leading-tight", getUtilColor(org.utilizationRate))}>
                    {formatCurrency(org.totalWalletBalance)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium tabular-nums mt-0.5">
                    / {formatCurrency(org.walletLimit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Policies (Full Width) */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-zinc-400 mb-3">
              <Shield size={14} weight="bold" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Benefit Policies</span>
              <span className="h-2 w-2 rounded-full bg-zinc-200 flex items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-zinc-400" />
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {org.policies.length === 0 ? (
                <span className="text-[11px] text-zinc-400 font-medium italic">Unassigned</span>
              ) : (
                <>
                  {org.policies.slice(0, 3).map((policy, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-white hover:bg-zinc-50 text-[11px] font-medium px-2.5 py-0.5 border-zinc-200 h-6 transition-colors text-zinc-600"
                    >
                      {policy}
                    </Badge>
                  ))}
                  {org.policies.length > 3 && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-zinc-500 hover:text-zinc-900 font-bold px-1.5 underline decoration-zinc-200 underline-offset-4 transition-colors"
                        >
                          +{org.policies.length - 3} more
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="w-56 bg-white rounded-2xl border-zinc-200 shadow-2xl z-[200]" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 opacity-50">Benefit Policies</span>
                          <div className="max-h-[160px] overflow-y-auto px-1 space-y-1">
                            {org.policies.slice(3).map((policy, i) => (
                              <div key={i} className="text-[12px] px-2 py-1.5 hover:bg-zinc-50 rounded-lg text-zinc-700 transition-colors truncate font-medium">
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
