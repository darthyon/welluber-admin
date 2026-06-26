"use client";

import {
  CaretLeft,
  PencilSimpleLine,
  User,
  Shield,
  CreditCard,
  SealCheck,
  Ticket,
  Users,
} from "@phosphor-icons/react";

import { useQueryState } from "@/hooks/use-tab-persistence";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { EmployeeDetailsTab } from "./employee-details-tab";
import { EmployeePolicyTab } from "./employee-policy-tab";
import { EmployeeEntitlementsTab } from "./employee-entitlements-tab";
import { EmployeeClaimsTab } from "./employee-claims-tab";
import { EmployeeVouchersTab } from "./employee-vouchers-tab";
import type { EmployeeDetailRecord } from "@/features/employees/types";

const DETAIL_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "benefits", label: "Entitlement", icon: Shield },
  { id: "claims", label: "Claims", icon: SealCheck },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "dependents", label: "Dependents", icon: Users },
] as const;

const VALID_TABS = new Set<string>(DETAIL_TABS.map((t) => t.id));

interface EmployeeDetailProps {
  employee: EmployeeDetailRecord;
  onBack: () => void;
  onEdit: () => void;
  backLabel?: string;
}

export function EmployeeDetail({ employee, onBack, onEdit, backLabel = "Back" }: EmployeeDetailProps) {
  const [tab, setTab] = useQueryState("tab", "profile");
  const activeTab = VALID_TABS.has(tab || "") ? (tab as string) : "profile";

  const initials = (() => {
    const parts = employee.name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0]?.substring(0, 2).toUpperCase() || "?";
  })();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="group flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-primary"
        >
          <CaretLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-heading font-semibold text-primary shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-display font-semibold tracking-tight text-foreground">{employee.name}</h2>
                <StatusBadge status={employee.status} variant="emerald" />
              </div>
              <p className="mt-1 text-body font-medium text-muted-foreground">
                {[employee.designation, employee.department, employee.tier].filter(Boolean).join(" • ")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {employee.isProbation && <StatusBadge status="Probation" variant="amber" />}
                {employee.residencyStatus && <Badge variant="outline">{employee.residencyStatus}</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-10 px-4 font-semibold hover:bg-muted" onClick={onEdit}>
              <PencilSimpleLine size={18} weight="bold" className="mr-2" />
              Edit Employee
            </Button>
            <ActionPopover
              align="end"
              actions={[
                { label: "Reset Password", onClick: () => {} },
                { label: "Download Records", onClick: () => {} },
                { label: "Terminate Link", isDanger: true, onClick: () => {} },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <SegmentedTabs tabs={DETAIL_TABS} activeTab={activeTab} onChange={setTab} />

      {/* Tab content */}
      <div className="min-w-0">
        {activeTab === "profile" && (
          <EmployeeDetailsTab
            employee={{
              id: employee.id,
              name: employee.name,
              email: employee.email,
              empCode: employee.empCode,
              dateOfBirth: employee.dateOfBirth,
              idType: employee.idType,
              idNumber: employee.idNumber,
              mobile: employee.mobile,
              branch: employee.branch,
              joinDate: employee.joinDate,
              employmentType: employee.employmentType || "—",
              nationality: employee.nationality,
              department: employee.department || "—",
              designation: employee.designation,
              tier: employee.tier,
              status: employee.status,
              isProbation: employee.isProbation,
            }}
          />
        )}

        {activeTab === "benefits" && (
          <div className="space-y-10">
            <EmployeePolicyTab employeeId={employee.id} />
            <EmployeeEntitlementsTab employeeId={employee.id} />
          </div>
        )}

        {activeTab === "claims" && <EmployeeClaimsTab employeeId={employee.id} />}

        {activeTab === "vouchers" && <EmployeeVouchersTab employeeId={employee.id} />}

        {activeTab === "dependents" && (
          <DetailSection title="Dependents" icon={<Users size={18} weight="bold" className="text-primary" />}>
            {employee.dependents.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border/40 bg-muted text-faint">
                  <Users size={24} />
                </div>
                <h5 className="text-body font-semibold tracking-tight text-foreground">0 Dependents</h5>
                <p className="mt-1 max-w-[220px] text-label font-medium text-muted-foreground">
                  No dependents have been added to this employee profile yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {employee.dependents.map((dep) => (
                  <div key={dep.id} className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-label capitalize">{dep.relationship}</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-3">
                      <DetailField label="Full Name" value={dep.name} />
                      <DetailField label="Email" value={dep.email || "—"} />
                      <DetailField label="Phone" value={dep.phone} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        )}
      </div>
    </div>
  );
}
