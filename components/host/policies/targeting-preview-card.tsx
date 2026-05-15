"use client";

import { useMemo } from "react";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";

const normEmpType = (s?: string) => (s ?? "").replace(/-/g, "_");

interface TargetingPreviewCardProps {
  organizationId?: string;
  employmentTypes: string[];
  tierIds: string[];
  departmentIds: string[];
}

export function getMatchedEmployeeCount({
  organizationId,
  employmentTypes,
  tierIds,
  departmentIds,
}: {
  organizationId?: string;
  employmentTypes: string[];
  tierIds: string[];
  departmentIds: string[];
}): number {
  if (!organizationId) return 0;
  const empTypes = employmentTypes.map(normEmpType);
  return MOCK_EMPLOYEES.filter((e) => {
    if (e.orgId !== organizationId) return false;
    if (empTypes.length > 0 && !empTypes.includes(normEmpType(e.employmentType))) return false;
    if (tierIds.length > 0 && (!e.tierId || !tierIds.includes(e.tierId))) return false;
    if (departmentIds.length > 0 && (!e.departmentId || !departmentIds.includes(e.departmentId))) return false;
    return true;
  }).length;
}

export function TargetingPreviewCard({
  organizationId,
  employmentTypes,
  tierIds,
  departmentIds,
}: TargetingPreviewCardProps) {
  const matchedCount = useMemo(
    () => getMatchedEmployeeCount({ organizationId, employmentTypes, tierIds, departmentIds }),
    [organizationId, employmentTypes, tierIds, departmentIds]
  );

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <p className="text-micro text-muted-foreground">Pick an organisation to preview targeting.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-label font-semibold text-foreground tabular-nums">
        {matchedCount} match{matchedCount === 1 ? "" : "es"}
      </p>
    </div>
  );
}
