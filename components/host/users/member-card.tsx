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
      className="group relative bg-white border border-zinc-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
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
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Buildings size={14} />
            <span className="text-[11px] font-semibold text-zinc-500/80">Organization</span>
          </div>
          <span className="text-[12px] font-bold text-zinc-700">{member.organization.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <TreeStructure size={14} />
            <span className="text-[11px] font-semibold text-zinc-500/80">Branch</span>
          </div>
          <span className="text-[12px] font-medium text-zinc-600">{member.branch?.name || "-"}</span>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 mt-2">
          <div className="flex items-center gap-2">
            <StatusBadge 
              status={member.status} 
              variant={member.status === "Active" ? "emerald" : member.status === "Pending" ? "amber" : "rose"} 
            />
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold border",
              member.type === "Employee" 
                ? "bg-blue-50 text-blue-600 border-blue-100" 
                : "bg-purple-50 text-purple-600 border-purple-100"
            )}>
              {member.type}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">{member.joinedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
