"use client";

import { IdentificationCard } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover, type ActionItem } from "@/components/shared/action-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BenefitPolicyCardItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  utilisationMode?: string;
  status: "draft" | "active" | "deactivated";
  groupCount?: number;
  orgName?: string;
}

interface BenefitPolicyCardProps {
  policy: BenefitPolicyCardItem;
  onView: (id: string) => void;
  onClone: (e: React.MouseEvent, policy: BenefitPolicyCardItem) => void;
  onDeactivate?: (e: React.MouseEvent, policy: BenefitPolicyCardItem) => void;
  onDelete?: (e: React.MouseEvent, policy: BenefitPolicyCardItem) => void;
}

const statusVariantMap: Record<string, "emerald" | "amber" | "rose"> = {
  active: "emerald",
  draft: "amber",
  deactivated: "rose",
};

export function BenefitPolicyCard({ policy, onView, onClone, onDeactivate, onDelete }: BenefitPolicyCardProps) {
  const actions: ActionItem[] = [
    {
      label: "View policy details",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onView(policy.id);
      }
    },
    {
      label: "Clone policy",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onClone(e, policy);
      },
      className: "text-primary font-semibold"
    },
  ];

  if (policy.status === "active" && onDeactivate) {
    actions.push(
      { label: "Management", isSectionTitle: true },
      {
        label: "Deactivate policy",
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onDeactivate(e, policy);
        },
        isDanger: true
      }
    );
  }

  if ((policy.status === "draft" || policy.status === "deactivated") && onDelete) {
    actions.push(
      { label: "Management", isSectionTitle: true },
      {
        label: "Delete policy",
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onDelete(e, policy);
        },
        isDanger: true
      }
    );
  }

  return (
    <motion.div
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onView(policy.id)}
      className="group relative glass-card p-5 rounded-lg cursor-pointer overflow-hidden"
    >
      {/* Bento-style Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      {/* Top Section: Header & Actions */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-muted border border-border/60 text-muted-foreground flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/20">
            <IdentificationCard size={24} weight="fill" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-body text-foreground block leading-tight tracking-tight group-hover:text-primary transition-colors">
              {policy.name}
            </h4>
            <div className="flex items-center gap-2">
            <StatusBadge
              status={policy.status}
              variant={statusVariantMap[policy.status] || "zinc"}
            />
              <span className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">
                {policy.code}
              </span>
            </div>
          </div>
        </div>

        <ActionPopover actions={actions} />
      </div>

      {/* Content Section */}
      <div className="relative z-10">
        <p className="text-body text-subtle line-clamp-2 leading-relaxed font-normal">
          {policy.description || "No description provided."}
        </p>

        <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3 text-faint">
            <span className="text-label font-medium">{policy.groupCount ?? 0} groups</span>
            <span className="w-1 h-1 rounded-full bg-muted" />
            <span className="text-label font-medium">{policy.orgName || "Unassigned"}</span>
          </div>
          <div className="text-right">
            <p className="text-body font-semibold text-foreground">
              {policy.utilisationMode === "Fixed" ? "Fixed" : "Prorated"}
            </p>
            <p className="text-label text-faint font-medium">
              Allocation
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
