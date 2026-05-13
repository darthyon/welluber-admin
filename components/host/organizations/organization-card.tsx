"use client";

import { Users, Shield, MapPin, Buildings, Wallet } from "@phosphor-icons/react";
import { Organization } from "@/features/organizations/types";
import { PulseStatus } from "@/components/shared/pulse-status";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Registry } from "@/lib/mock-data/registry";
import { formatStateCountry } from "@/lib/utils/location-codes";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const BRANCH_NAME_MAP: Record<string, string> = {
  "BR-20260115-0001": "Kuala Lumpur HQ",
  "BR-20260115-0002": "Subang Jaya",
  "BR-20260115-0003": "Penang Office",
  "BR-20260301-0001": "Petaling Jaya Branch",
  "BR-20260310-0001": "Singapore HQ",
  "BR-20260310-0002": "KL Office",
  "BR-20260401-0004": "Main Office",
  "BR-20260401-0005": "Logistics Hub",
  "BR-20260401-0006": "Energy Park",
  "BR-20260401-0007": "Medical Campus",
  "BR-20260401-0008": "Retail HQ",
  "BR-20260401-0009": "Construction Office",
  "BR-20260401-0010": "Education Centre",
};

function resolveBranchName(id: string): string {
  return BRANCH_NAME_MAP[id] ?? id;
}

function resolvePolicyName(id: string): string {
  return Registry.policies.get(id)?.name ?? id
}

interface OrganizationCardProps {
  org: Organization;
}

export function OrganizationCard({ org }: OrganizationCardProps) {
  const router = useRouter();

  const orgAccounts = [...Registry.accounts.values()].filter(a => a.orgId === org.id);
  const accountsCount = orgAccounts.length;
  const accountItems = orgAccounts.map(a => `${a.branchName} • ${a.name}`);

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
                <PulseStatus status={org.status as "active" | "pending" | "suspended" | "draft"} showLabel={true} className="px-1.5 py-0.5 rounded-md text-micro" />
                <span className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{org.id}</span>
              </div>
            </div>
          </div>

          <ActionPopover actions={actions} />
        </div>

        {/* Content Sections */}
        <div className="space-y-6 relative z-10">
          
          {/* Row 1: Workforce & Branches (Paired) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Workforce / Employees */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-faint">
                <Users size={14} weight="bold" />
                <span className="text-label font-semibold text-faint">Workforce</span>
              </div>
              <span className="text-body font-semibold text-foreground block">
                {org.employeeCount.toLocaleString()} <span className="text-label font-normal text-faint">pax</span>
              </span>
            </div>

            {/* Branches */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-faint">
                <Buildings size={14} weight="bold" />
                <span className="text-label font-semibold text-faint leading-none">Branches</span>
              </div>
              {org.branches.length > 0 ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-body font-semibold text-foreground block hover:text-primary transition-colors"
                    >
                      {org.branches.length.toLocaleString()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-56 bg-card rounded-lg border-border shadow-2xl z-[200] p-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-label font-medium text-subtle mb-1 px-1">Branches</span>
                      {org.branches.slice(0, 5).map((id, i) => (
                        <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
                          {resolveBranchName(id)}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-body font-semibold text-faint italic">0</span>
              )}
            </div>
          </div>

          {/* Row 2: Location & Accounts (Paired) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-faint">
                <MapPin size={14} weight="bold" />
                <span className="text-label font-semibold text-faint leading-none">Location</span>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-body font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {formatStateCountry(org.state, org.country)}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200] p-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-label font-medium text-subtle px-1">State</span>
                    <span className="text-label text-foreground font-medium px-1 pb-1">{org.state}</span>
                    <span className="text-label font-medium text-subtle px-1">Country</span>
                    <span className="text-label text-foreground font-medium px-1">{org.country}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Accounts */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-faint">
                <Wallet size={14} weight="bold" />
                <span className="text-label font-semibold text-faint leading-none">Accounts</span>
              </div>
              {accountsCount > 0 ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-body font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {accountsCount.toLocaleString()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-56 bg-card rounded-lg border-border shadow-2xl z-[200] p-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-label font-medium text-subtle mb-1 px-1">Accounts</span>
                      {accountItems.slice(0, 5).map((item, i) => (
                        <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
                          {item}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-body font-semibold text-faint italic">0</span>
              )}
            </div>
          </div>

          {/* Row 3: Active Policies (Full Width) */}
          <div>
            <div className="flex items-center gap-1.5 text-faint mb-3">
              <Shield size={14} weight="bold" />
              <span className="text-label font-semibold text-faint leading-none">Benefit policies</span>
              <span className="h-2 w-2 rounded-full bg-border flex items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              </span>
            </div>
            <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
              {org.policies.length === 0 ? (
                <span className="text-label text-faint font-semibold italic text-nowrap">Unassigned</span>
              ) : (
                <>
                  {org.policies.slice(0, 2).map((policy, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-background/40 hover:bg-background/60 text-label font-medium px-2 py-0.5 border-border/60 h-6 transition-colors text-subtle text-nowrap shrink-0"
                    >
                      {resolvePolicyName(policy)}
                    </Badge>
                  ))}
                  {org.policies.length > 2 && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-6 px-2 rounded-full bg-muted/40 border border-border/60 text-label font-semibold text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors shrink-0"
                        >
                          +{org.policies.length - 2}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        className="w-56 bg-popover rounded-lg border border-border shadow-2xl z-[200] p-1"
                        onClick={(e) => e.stopPropagation()}
                        side="bottom"
                        align="start"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label className="text-label font-medium text-subtle pl-1">All benefit policies</label>
                          <div className="max-h-[160px] overflow-y-auto px-1 space-y-1">
                            {org.policies.map((policy, i) => (
                              <div key={i} className="text-label px-2 py-1.5 hover:bg-accent rounded-lg text-subtle transition-colors truncate font-medium">
                                {resolvePolicyName(policy)}
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
