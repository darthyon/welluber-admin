"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";
import type { EmployeeDirectoryItem } from "@/features/employees/types";
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy";

interface PolicyLaunchConfirmModalProps {
  policy: Partial<BenefitPolicy>;
  assignedEmployeeIds: string[];
  groups: BenefitGroup[];
  benefits: Benefit[];
  onConfirm: () => void;
  onCancel: () => void;
}

function isEmployeeEligible(employee: EmployeeDirectoryItem, policy: Partial<BenefitPolicy>) {
  if (policy.eligibleEmploymentTypes?.length && employee.employmentType && !policy.eligibleEmploymentTypes.includes(employee.employmentType)) {
    return false;
  }

  const tierIds = policy.eligibility?.tierIds;
  if (tierIds?.length && employee.tier && !tierIds.includes(employee.tier)) {
    return false;
  }

  return true;
}

export function PolicyLaunchConfirmModal({
  policy,
  assignedEmployeeIds,
  groups,
  benefits,
  onConfirm,
  onCancel,
}: PolicyLaunchConfirmModalProps) {
  const orgEmployees = policy.organizationId
    ? MOCK_EMPLOYEES.filter((employee) => employee.orgId === policy.organizationId)
    : [];
  const eligibleEmployees = orgEmployees.filter((employee) => isEmployeeEligible(employee, policy));
  const excludedCount = Math.max(orgEmployees.length - eligibleEmployees.length, 0);

  const targetEmployees = assignedEmployeeIds.length > 0
    ? MOCK_EMPLOYEES.filter((employee) => assignedEmployeeIds.includes(employee.id))
    : eligibleEmployees;

  const reassigned = targetEmployees.filter((employee) => (employee.benefitPolicies?.length ?? 0) > 0);
  const uniquePolicyNames = Array.from(new Set(reassigned.flatMap((employee) => employee.benefitPolicies.map((item) => item.policyName))));
  const reassignmentSummary = uniquePolicyNames.length > 0 ? uniquePolicyNames.join(", ") : "None";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl">
        <div className="border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <WarningCircle size={16} weight="fill" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Confirm Policy Launch</h3>
              <p className="text-label text-muted-foreground">Review impact before launching this policy.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-body font-medium text-foreground">
              Covers {eligibleEmployees.length} employee{eligibleEmployees.length !== 1 ? "s" : ""} · excludes {excludedCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-body font-medium text-foreground">
              Will reassign {reassigned.length} employee{reassigned.length !== 1 ? "s" : ""} from {reassignmentSummary}
            </p>
          </div>

          <p className="text-micro text-faint">
            {groups.length} group{groups.length !== 1 ? "s" : ""} · {benefits.length} benefit{benefits.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-5">
          <Button variant="ghost" onClick={onCancel} className="rounded-4xl px-5">Cancel</Button>
          <Button onClick={onConfirm} className="rounded-4xl px-5">Confirm Launch</Button>
        </div>
      </div>
    </div>
  );
}
