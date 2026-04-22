"use client";

import { IdentificationCard, TreeStructure, ShieldCheck } from "@phosphor-icons/react";
import { ActionPopover } from "@/components/shared/action-popover";
import { StatusBadge } from "@/components/shared/status-badge";
import { SharedDataTable, Column } from "@/components/shared/data-table";

interface AssignedPolicy {
  id: string;
  name: string;
  code: string;
  type: string;
  assignedTo: string; // "All Branches" or specific branch names
  status: "Active" | "Inactive" | "Published";
  employeeCount: number;
  lastUpdated: string;
}

interface AssignedPolicyListProps {
  policies: AssignedPolicy[];
  onUnlink: (policyId: string) => void;
  onView: (policyId: string) => void;
  onEdit: (policyId: string) => void;
}

export function AssignedPolicyList({ policies, onUnlink, onView, onEdit }: AssignedPolicyListProps) {
  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg border border-dashed border-border/60">
         <div className="w-16 h-16 rounded-lg bg-card border border-border flex items-center justify-center text-muted/30 mb-4 shadow-sm">
           <ShieldCheck size={32} weight="duotone" />
         </div>
         <p className="text-muted-foreground font-medium">No benefit policies assigned to this organization.</p>
         <p className="text-muted-foreground/40 text-nav mt-1">Assign a policy to start providing benefits to employees.</p>
      </div>
    );
  }

  const columns: Column<AssignedPolicy>[] = [
    {
      header: "Policy Name",
      render: (policy) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <IdentificationCard size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-body font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{policy.name}</p>
            <p className="text-caption font-mono text-muted-foreground/50 tracking-tight leading-none mt-0.5">{policy.code}</p>
          </div>
        </div>
      )
    },
    {
      header: "Scope",
      render: (policy) => (
        <div className="flex items-center gap-2">
          <TreeStructure size={14} className="text-muted-foreground/40" />
          <span className="text-nav font-medium text-muted-foreground">{policy.assignedTo}</span>
        </div>
      )
    },
    {
      header: "Employees",
      headerClassName: "text-center",
      render: (policy) => (
        <div className="text-center font-semibold text-nav text-foreground/80 tabular-nums">
          {policy.employeeCount.toLocaleString()}
        </div>
      )
    },
    {
      header: "Status",
      render: (policy) => (
        <StatusBadge 
          status={policy.status === "Published" ? "Active" : policy.status} 
          variant={policy.status === "Published" || policy.status === "Active" ? "emerald" : "zinc"} 
        />
      )
    },
    {
      header: "Last Updated",
      render: (policy) => <span className="text-nav text-muted-foreground/60 font-medium">{policy.lastUpdated}</span>
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      render: (policy) => (
        <div className="flex justify-end">
          <ActionPopover 
            actions={[
              { label: "View Policy", onClick: () => onView(policy.id) },
              { label: "Edit Policy", onClick: () => onEdit(policy.id) },
              { label: "Revoke / Unlink", isDanger: true, onClick: () => onUnlink(policy.id) }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <SharedDataTable 
      data={policies}
      columns={columns}
      onRowClick={(policy) => onView(policy.id)}
    />
  );
}
