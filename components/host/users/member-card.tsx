"use client";

import { 
  Users, 
  Buildings, 
  TreeStructure, 
  DotsThreeVertical, 
  EnvelopeSimple,
  Clock,
  UserCircle
} from "@phosphor-icons/react";
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
    { label: "Policies", href: `/users/members/${member.id}/policies` },
  ];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-muted border border-border/60 text-muted-foreground/60 flex items-center justify-center">
            <Users size={22} weight="fill" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-body text-foreground tracking-tight leading-tight">
              {member.name}
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge 
                status={member.status} 
                variant={member.status === "Active" ? "emerald" : member.status === "Pending" ? "amber" : "rose"} 
                className="px-1.5 py-0.5 rounded-md text-micro"
              />
              <span className={cn(
                "px-2 py-0.5 rounded-md text-micro font-semibold border",
                member.type === "Employee" 
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                  : "bg-purple-500/10 text-purple-600 border-purple-500/20"
              )}>
                {member.type}
              </span>
            </div>
          </div>
        </div>
        <ActionPopover actions={actions} />
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* Row 1: Email & Organization */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <UserCircle size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Email</span>
            </div>
            <span className="text-label font-semibold text-foreground/80 block truncate font-mono" title={member.email}>
              {member.email}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <Buildings size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Organization</span>
            </div>
            <span className="text-label font-semibold text-foreground truncate block" title={member.organization.name}>
              {member.organization.name}
            </span>
          </div>
        </div>

        {/* Row 2: Branch & Last Active */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <TreeStructure size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Branch</span>
            </div>
            <span className="text-label font-semibold text-foreground truncate block font-mono" title={member.branch?.name || "-"}>
              {member.branch?.name || "-"}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <Clock size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Last Active</span>
            </div>
            <span className="text-label font-semibold text-foreground/80 block">
              {member.lastActive}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
