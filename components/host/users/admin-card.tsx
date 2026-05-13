"use client";

import { Shield, Buildings, Storefront, EnvelopeSimple, Clock } from "@phosphor-icons/react";
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
    { label: "Revoke access", onClick: () => console.log("Revoke"), className: "text-destructive" },
  ];

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "HostAdmin":
        return "bg-primary/10 text-primary border-primary/20";
      case "OrgAdmin":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20";
      case "SPAdmin":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HostAdmin": return "Superadmin";
      case "OrgAdmin": return "Admin";
      case "SPAdmin": return "SP admin";
      default: return role;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-muted border border-border/60 text-faint flex items-center justify-center">
            {admin.role === "HostAdmin" ? <Shield size={22} weight="fill" /> : 
             admin.role === "OrgAdmin" ? <Buildings size={22} weight="fill" /> : 
             <Storefront size={22} weight="fill" />}
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-body text-foreground tracking-tight leading-tight">
              {admin.name}
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge 
                status={admin.status} 
                variant={admin.status === "Active" ? "emerald" : "rose"} 
                className="px-1.5 py-0.5 rounded-md text-micro"
              />
              <span className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">Admin</span>
            </div>
          </div>
        </div>
        <ActionPopover actions={actions} />
      </div>

      {/* Main Content: Standardized Field Grid */}
      <div className="relative z-10 space-y-6">
        
        {/* Row 1: Email & User Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <EnvelopeSimple size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Email Address</span>
            </div>
            <span className="text-label font-semibold text-subtle block truncate font-mono" title={admin.email}>
              {admin.email}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <Shield size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">User Type</span>
            </div>
            <span className={cn(
              "inline-flex px-2 py-0.5 rounded-md text-label font-medium border mt-0.5",
              getRoleStyle(admin.role)
            )}>
              {getRoleLabel(admin.role)}
            </span>
          </div>
        </div>

        {/* Row 2: Entity & Last Active */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <Buildings size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Entity</span>
            </div>
            <span className="text-label font-semibold text-foreground truncate block" title={admin.entity?.name || "Platform Core"}>
              {admin.entity?.name || "Platform Core"}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <Clock size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Last Active</span>
            </div>
            <span className="text-label font-semibold text-subtle block">
              {admin.lastActive}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
