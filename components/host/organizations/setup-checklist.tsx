"use client";

import { Shield, Users, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Organization } from "@/features/organizations/types";

interface SetupChecklistProps {
  organization: Organization;
  className?: string;
}

export function SetupChecklist({ organization, className }: SetupChecklistProps) {
  const hasCoverage = organization.employeeCount > 0 && (organization.employeesWithoutPolicy ?? 1) === 0;
  const items = [
    {
      label: "POL",
      isComplete: organization.policies.length > 0,
      icon: Shield,
      tooltip: organization.policies.length > 0 ? "Policies configured" : "No policies",
    },
    {
      label: "EMP",
      isComplete: organization.employeeCount > 0,
      icon: Users,
      tooltip: organization.employeeCount > 0 ? "Employees added" : "No employees",
    },
    {
      label: "COV",
      isComplete: hasCoverage,
      icon: CheckCircle,
      tooltip: hasCoverage ? "All employees covered" : "Employees without policy",
    },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md border transition-all relative group",
              item.isComplete
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 border-rose-500/20"
            )}
            title={item.tooltip}
          >
            <Icon size={14} weight={item.isComplete ? "fill" : "bold"} />
            <div
              className={cn(
                "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card",
                item.isComplete ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
