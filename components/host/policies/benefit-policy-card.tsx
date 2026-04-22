"use client";

import { IdentificationCard } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BenefitPolicy {
  id: string;
  name: string;
  code: string;
  description?: string;
  utilisationMode: string;
  status: string;
}

interface BenefitPolicyCardProps {
  policy: BenefitPolicy;
  onView: (id: string) => void;
  onClone: (e: React.MouseEvent, policy: BenefitPolicy) => void;
}

export function BenefitPolicyCard({ policy, onView, onClone }: BenefitPolicyCardProps) {
  const actions = [
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
    {
      label: "Management",
      isSectionTitle: true
    },
    {
      label: "Archived policy",
      onClick: () => console.log("Archive"),
      isDanger: true
    }
  ];

  return (
    <motion.div
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onView(policy.id)}
      className="group relative glass-card p-5 rounded-lg cursor-pointer overflow-hidden"
    >
      {/* Bento-style Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      {/* Top Section: Header & Actions */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-muted border border-border/60 text-muted-foreground flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary/20">
            <IdentificationCard size={24} weight="fill" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-body text-foreground block leading-tight tracking-tight group-hover:text-primary transition-colors">
              {policy.name}
            </h4>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={policy.status}
                variant={policy.status === "Published" ? "emerald" : "amber"}
              />
              <span className="text-micro text-muted-foreground/60 font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">
                {policy.code}
              </span>
            </div>
          </div>
        </div>

        <ActionPopover actions={actions} />
      </div>

      {/* Content Section */}
      <div className="relative z-10">
        <p className="text-nav text-muted-foreground/80 line-clamp-2 leading-relaxed font-normal opacity-95">
          {policy.description || "No description provided."}
        </p>

        <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-micro font-semibold text-muted-foreground/60 overflow-hidden shadow-sm ring-1 ring-border/40"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${parseInt(policy.id) + i + 10}`}
                  alt="User"
                />
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-micro font-semibold text-muted-foreground/60 shadow-sm ring-1 ring-border/40">
              +12
            </div>
          </div>
          <div className="text-right">
            <p className="text-body font-semibold text-foreground tracking-tight">
              RM {policy.utilisationMode === "Fixed" ? "2,400.00" : "Prorated"}
            </p>
            <p className="text-micro text-muted-foreground/60 font-semibold tracking-tight">
              Budget pool
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
