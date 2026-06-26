"use client";

import { useState } from "react";
import { Shield, ArrowSquareOut, Warning, TreeStructure } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AssignPolicyModal } from "./assign-policy-modal";
import { UnassignPolicyModal } from "./unassign-policy-modal";
import { getEmployeeEntitlement } from "./employee-entitlements-mock";

interface EmployeePolicyTabProps {
  employeeId: string;
}

const POOL_LABEL: Record<string, string> = {
  SharedWithEmployee: "Combined",
  Shared: "Shared Dependent",
  Individual: "Dedicated",
};

export function EmployeePolicyTab({ employeeId }: EmployeePolicyTabProps) {
  const [hasPolicy, setHasPolicy] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const employeeName = "Robert Fox";

  // Summary reads the same source as the Usage section so the two never drift.
  const { policy, groups } = getEmployeeEntitlement(employeeId);
  const poolLabel = policy.dependentsPoolType
    ? POOL_LABEL[policy.dependentsPoolType]
    : policy.benefitPoolType;
  const summary = {
    name: policy.name,
    code: policy.code ?? policy.id,
    orgName: "Acme Corporation Sdn Bhd",
    version: policy.version ?? "V1.0",
    status: "Active",
    refreshCycle: policy.refreshCycle,
    poolType: poolLabel,
    groupCount: groups.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title font-semibold text-foreground">Entitlement</h2>
          <p className="mt-1 text-body text-muted-foreground">
            View assigned benefit policy, policy details, entitlement, and pool management.
          </p>
        </div>
        {hasPolicy && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-2 font-medium"
              onClick={() => setShowAssignModal(true)}
            >
              Change Policy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-destructive/30 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowUnassignModal(true)}
            >
              <Warning size={14} weight="bold" />
              Unassign Policy
            </Button>
          </div>
        )}
      </div>

      {hasPolicy ? (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-heading font-semibold text-foreground">
                  {summary.name}
                </h3>
                <div className="flex items-center gap-2 text-label font-medium text-muted-foreground">
                  <StatusBadge status={summary.status} variant="emerald" />
                  <span>·</span>
                  <span>{summary.version}</span>
                  <span>·</span>
                  <span>{summary.refreshCycle}</span>
                  <span>·</span>
                  <span>{summary.poolType} Pool</span>
                </div>
                <p className="text-label font-medium text-subtle">
                  {summary.orgName} · {summary.code} · {summary.groupCount} benefit{" "}
                  {summary.groupCount === 1 ? "group" : "groups"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 font-medium text-primary hover:text-primary"
                onClick={() => setShowPolicyModal(true)}
              >
                View Policy Details
                <ArrowSquareOut size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/50 text-faint">
              <Shield size={32} />
            </div>
            <h3 className="mt-6 text-heading font-semibold text-foreground">No Policy Assigned</h3>
            <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
              This employee doesn&apos;t have a benefit policy assigned yet. Assign a policy to
              provide benefits.
            </p>
            <Button className="mt-6 gap-2" onClick={() => setShowAssignModal(true)}>
              <Shield size={18} />
              Assign Benefit Policy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Policy summary modal */}
      <Dialog open={showPolicyModal} onOpenChange={setShowPolicyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{summary.name}</DialogTitle>
            <div className="mt-1 flex items-center gap-2 text-label font-medium text-muted-foreground">
              <StatusBadge status={summary.status} variant="emerald" />
              <span>·</span>
              <span>{summary.version}</span>
              <span>·</span>
              <span>{summary.refreshCycle}</span>
              <span>·</span>
              <span>{summary.poolType} Pool</span>
            </div>
            <p className="mt-0.5 text-label text-subtle">
              {summary.orgName} · {summary.code}
            </p>
          </DialogHeader>

          {/* Employee pool */}
          <div>
            <p className="mb-2 text-label font-semibold text-muted-foreground">Employee Pool</p>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-micro font-medium text-muted-foreground">Pool Type</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">
                  {policy.benefitPoolType ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-micro font-medium text-muted-foreground">Utilisation Mode</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">
                  {policy.utilisationMode === "Prorated" ? "Prorated" : "Fixed"}
                </p>
              </div>
              <div>
                <p className="text-micro font-medium text-muted-foreground">Refresh Cycle</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">{policy.refreshCycle ?? "—"}</p>
              </div>
              <div>
                <p className="text-micro font-medium text-muted-foreground">Employee Cap</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">
                  {policy.totalCapAmount != null ? `RM ${policy.totalCapAmount.toLocaleString()} / Cycle` : "Not Set"}
                </p>
              </div>
            </div>
          </div>

          {/* Dependent coverage */}
          <div>
            <p className="mb-2 text-label font-semibold text-muted-foreground">Dependent Coverage</p>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-micro font-medium text-muted-foreground">Covered Types</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">
                  {(policy.dependentCoverages?.length ?? 0) > 0
                    ? policy.dependentCoverages!.map((c) => c.type.charAt(0).toUpperCase() + c.type.slice(1)).join(", ")
                    : "Employee Only"}
                </p>
              </div>
              <div>
                <p className="text-micro font-medium text-muted-foreground">Dependents Pool Type</p>
                <p className="mt-0.5 text-label font-semibold text-foreground">
                  {(policy.dependentCoverages?.length ?? 0) > 0
                    ? (POOL_LABEL[policy.dependentsPoolType ?? ""] ?? "—")
                    : "Not Applicable"}
                </p>
              </div>
              {policy.dependentCapAmount != null && (
                <div>
                  <p className="text-micro font-medium text-muted-foreground">Dependent Cap</p>
                  <p className="mt-0.5 text-label font-semibold text-foreground">
                    RM {policy.dependentCapAmount.toLocaleString()} / Cycle
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Benefit groups */}
          <div>
            <p className="mb-2 text-label font-semibold text-muted-foreground">
              Benefit Groups · {groups.length}
            </p>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <TreeStructure size={14} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-semibold text-foreground">{g.name}</p>
                    <p className="text-micro text-muted-foreground">
                      {g.coverageScope ?? "Employee"} · {g.distributionType === "SharedAmount" ? "Shared Amount" : "Individual Amount"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button asChild className="gap-2">
              <a href={`/policies/${policy.id}`}>
                Open Full Policy
                <ArrowSquareOut size={14} />
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignPolicyModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        employeeId={employeeId}
        employeeName={employeeName}
        onAssign={() => setHasPolicy(true)}
      />
      <UnassignPolicyModal
        open={showUnassignModal}
        onOpenChange={setShowUnassignModal}
        employeeId={employeeId}
        employeeName={employeeName}
        policyName={summary.name}
        hasActiveClaims={false}
        onUnassign={() => {
          setHasPolicy(false);
          setShowUnassignModal(false);
        }}
      />
    </div>
  );
}
