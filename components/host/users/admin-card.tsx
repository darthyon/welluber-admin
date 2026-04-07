"use client";

import { Shield, Buildings, Storefront, DotsThreeVertical, EnvelopeSimple, Clock } from "@phosphor-icons/react";
import { Administrator } from "@/features/users/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  admin: Administrator;
}

export function AdminCard({ admin }: AdminCardProps) {
  const actions = [
    { label: "Edit permissions", onClick: () => console.log("Permissions") },
    { label: "View activity", onClick: () => console.log("Activity") },
    { label: "Reset password", onClick: () => console.log("Reset") },
    { label: "Revoke access", onClick: () => console.log("Revoke"), className: "text-rose-600" },
  ];

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "HostAdmin":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "OrgAdmin":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "SPAdmin":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HostAdmin": return "Host admin";
      case "OrgAdmin": return "Org admin";
      case "SPAdmin": return "SP admin";
      default: return role;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground/60 flex items-center justify-center border border-border">
            {admin.role === "HostAdmin" ? <Shield size={20} weight="fill" /> : 
             admin.role === "OrgAdmin" ? <Buildings size={20} weight="fill" /> : 
             <Storefront size={20} weight="fill" />}
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-[14px] text-foreground tracking-tight leading-tight">
              {admin.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <EnvelopeSimple size={12} />
              {admin.email}
            </div>
          </div>
        </div>
        <ActionPopover actions={actions} />
      </div>

      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/30">
            <Shield size={14} />
            <span className="text-[11px] font-semibold text-muted-foreground/60">Role</span>
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold border",
            getRoleStyle(admin.role)
          )}>
            {getRoleLabel(admin.role)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground/30">
            <Buildings size={14} />
            <span className="text-[11px] font-semibold text-muted-foreground/60">Entity</span>
          </div>
          <span className="text-[12px] font-bold text-foreground truncate max-w-[140px]">
            {admin.entity?.name || "Platform Core"}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/50 mt-2">
          <StatusBadge 
            status={admin.status} 
            variant={admin.status === "Active" ? "emerald" : "rose"} 
          />
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-medium">
            <Clock size={12} />
            {admin.lastLogin}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
