"use client";

import { Users, Buildings, TreeStructure, DotsThreeVertical, EnvelopeSimple } from "@phosphor-icons/react";
import { Member } from "@/features/users/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const actions = [
    { label: "View profile", href: `/users/members/${member.id}` },
    { label: "Edit details", href: `/users/members/${member.id}/edit` },
    { label: "Policies", href: `/users/members/${member.id}/policies` },
    { label: "Suspend member", onClick: () => console.log("Suspend"), className: "text-rose-600" },
  ];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Users size={20} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-[14px] text-foreground tracking-tight leading-tight">
              {member.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <EnvelopeSimple size={12} />
              {member.email}
            </div>
          </div>
        </div>
        <ActionPopover actions={actions} />
      </div>

      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
            <Buildings size={14} />
            <span className="text-[11px] font-bold tracking-tight uppercase opacity-60">Organization</span>
          </div>
          <span className="text-[12px] font-bold text-foreground">{member.organization.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
            <TreeStructure size={14} />
            <span className="text-[11px] font-bold tracking-tight uppercase opacity-60">Branch</span>
          </div>
          <span className="text-[13px] font-semibold text-foreground/80">{member.branch?.name || "-"}</span>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-4 relative z-10">
          <div className="flex items-center gap-2">
            <StatusBadge 
              status={member.status} 
              variant={member.status === "Active" ? "emerald" : member.status === "Pending" ? "amber" : "rose"} 
            />
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-sm",
              member.type === "Employee" 
                ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
            )}>
              {member.type}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-bold tracking-tight">{member.joinedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
