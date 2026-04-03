"use client";

import { IdentificationCard, TreeStructure, DotsThreeVertical, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActionPopover } from "@/components/shared/action-popover";
import { StatusBadge } from "@/components/shared/status-badge";

interface AssignedPolicy {
  id: string;
  name: string;
  code: string;
  type: string;
  assignedTo: string; // "All Branches" or specific branch names
  status: "Active" | "Inactive";
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
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
         <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
           <ShieldCheck size={32} weight="duotone" />
         </div>
         <p className="text-zinc-500 font-medium">No benefit policies assigned to this organization.</p>
         <p className="text-zinc-400 text-[13px] mt-1">Assign a policy to start providing benefits to employees.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/50 bg-muted/20">
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4">Policy Name</th>
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4">Scope</th>
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4 text-center">Employees</th>
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4">Status</th>
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4">Last Updated</th>
            <th className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {policies.map((policy) => (
            <tr key={policy.id} className="hover:bg-zinc-50/50 transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                    <IdentificationCard size={20} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-zinc-900 group-hover:text-primary transition-colors">{policy.name}</p>
                    <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">{policy.code}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <TreeStructure size={14} className="text-zinc-400" />
                  <span className="text-[13px] font-medium text-zinc-600">{policy.assignedTo}</span>
                </div>
              </td>
              <td className="p-4 text-center">
                <span className="text-[13px] font-bold text-zinc-700">{policy.employeeCount.toLocaleString()}</span>
              </td>
              <td className="p-4">
                <StatusBadge status={policy.status} variant={policy.status === "Active" ? "emerald" : "zinc"} />
              </td>
              <td className="p-4 text-[13px] text-zinc-500">
                {policy.lastUpdated}
              </td>
              <td className="p-4 text-right">
                <ActionPopover 
                  actions={[
                    { label: "View Policy", onClick: () => onView(policy.id) },
                    { label: "Edit Policy", onClick: () => onEdit(policy.id) },
                    { label: "Revoke / Unlink", isDanger: true, onClick: () => onUnlink(policy.id) }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
