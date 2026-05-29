"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  IdentificationCard,
  TreeStructure,
  NotePencil,
  CaretLeft,
} from "@phosphor-icons/react"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyListItem } from "@/features/policies/types"
import type { EmployeeDirectoryItem } from "@/features/employees/types"
import {
  TABS,
  EMPLOYMENT_TYPE_LABELS,
  formatDependentLabel,
  formatEmploymentChip,
  formatRefreshChip,
  formatUtilisationChip,
  formatCoverageChip,
  formatAmountChip,
} from "./detail-tabs/policy-detail-helpers"
export type { TabId } from "./detail-tabs/policy-detail-helpers"
import type { TabId } from "./detail-tabs/policy-detail-helpers"
import { OverviewTab } from "./detail-tabs/overview-tab"
import { VersionOverviewTab } from "./detail-tabs/version-overview-tab"
import { VersionsTab } from "./detail-tabs/versions-tab"
import { BenefitGroupsTab } from "./detail-tabs/benefit-groups-tab"
import { AssignedEmployeesTab } from "./detail-tabs/assigned-employees-tab"
import { AuditLogTab } from "./detail-tabs/audit-log-tab"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyDetailViewProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  versions?: PolicyListItem[]
  versionOverrideCounts?: Record<string, number>
  parentPolicyName?: string
  parentBenefits?: Benefit[]
  employees?: EmployeeDirectoryItem[]
  initialTab?: TabId
  /**
   * Visual density for the header/tabs.
   * - `standalone`: full-page policy detail (global Policies).
   * - `embedded`: compact header for org-scoped policy viewing.
   */
  headerVariant?: "standalone" | "embedded"
  onEdit: () => void
  onClone: () => void
  onDeactivate: () => void
  onDelete: () => void
  onEditVersion?: (id: string) => void
  onRemoveVersion?: (id: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PolicyDetailView({
  policy,
  groups,
  benefits,
  versions = [],
  versionOverrideCounts = {},
  parentPolicyName,
  parentBenefits,
  employees,
  initialTab,
  headerVariant = "standalone",
  onEdit,
  onClone,
  onDeactivate,
  onDelete,
  onEditVersion,
  onRemoveVersion,
}: PolicyDetailViewProps) {
  void onClone
  void onDeactivate
  void onDelete
  const router = useRouter()
  const isVersion = Boolean(policy.parentPolicyId)
  const availableTabs = useMemo(
    () => (isVersion ? TABS.filter((tab) => tab.id !== "versions") : TABS),
    [isVersion]
  )
  const [selectedTab, setSelectedTab] = useState<TabId>(
    initialTab ?? "overview"
  )
  const activeTab = availableTabs.some((tab) => tab.id === selectedTab)
    ? selectedTab
    : "overview"

  const statusVariant =
    policy.status === "active"
      ? "emerald"
      : policy.status === "draft"
        ? "amber"
        : "rose"
  const canEdit = policy.status !== "deactivated"

  const employmentChip = formatEmploymentChip(policy)
  const refreshChip = formatRefreshChip(policy)
  const utilisationChip = formatUtilisationChip(policy)
  const coverageChip = formatCoverageChip(policy)
  const amountChip = formatAmountChip(policy)

  const employmentList = (policy.eligibleEmploymentTypes ?? []).map(
    (t) => EMPLOYMENT_TYPE_LABELS[t] ?? t
  )
  const dependentsLabel = formatDependentLabel(policy)
  const hasDependents = (policy.dependentCoverages?.length ?? 0) > 0

  const headerChips = (
    <div className="flex flex-wrap items-center gap-2">
      <div data-testid="policy-header-chips" className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
        >
          {employmentChip}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
        >
          {refreshChip}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
        >
          {utilisationChip}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
        >
          {coverageChip}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
        >
          <span className="font-mono tabular-nums">{amountChip}</span>
        </Badge>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            data-testid="inherited-rules-trigger"
            variant="ghost"
            size="sm"
            className="h-7 rounded-4xl px-3 text-body font-medium text-primary hover:bg-primary/10 hover:text-primary"
          >
            View inherited rules
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-testid="inherited-rules-popover"
          align="start"
          className="w-[420px] rounded-lg border border-border bg-card p-4 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <p className="text-lead font-semibold text-foreground">
                Inherited Rules
              </p>
              <p className="mt-0.5 text-label text-muted-foreground">
                Policy defaults that benefit groups inherit.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">
                  Eligibility
                </p>
                <p className="text-body font-medium text-foreground">
                  {employmentList.length} employment type
                  {employmentList.length === 1 ? "" : "s"}
                </p>
                <p className="text-label text-faint">
                  {employmentList.join(", ") || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">
                  Cadence
                </p>
                <p className="text-body font-medium text-foreground">
                  Refresh Cycle: {policy.refreshCycle}
                </p>
                <p className="text-label text-faint">
                  {policy.refreshCycle === "Yearly"
                    ? policy.refreshStartReference === "financial_year"
                      ? "FY start"
                      : "Calendar year"
                    : "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">
                  Utilisation
                </p>
                <p className="text-body font-medium text-foreground">
                  {policy.utilisationMode === "Fixed"
                    ? "Fixed utilisation"
                    : `Prorated (${policy.prorateUnit || "Monthly"})`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">
                  Coverage
                </p>
                <p className="text-body font-medium text-foreground">
                  {coverageChip}
                </p>
                <p className="text-label text-faint">
                  {hasDependents ? dependentsLabel : "No dependents covered"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">
                  Policy amount
                </p>
                <p className="text-body font-medium text-foreground">
                  {amountChip}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-label font-medium text-muted-foreground">
                  Configurable in benefit groups
                </p>
                <p className="text-label text-faint">
                  Coverage scope · Distribution type · Benefit amount · Usage
                  caps · Dependent caps · Co-pay rules
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-transparent">
      {headerVariant === "standalone" ? (
        <div className="relative z-30 -mx-6 -mt-6 border-b border-border bg-card px-6 pt-6">
          <div className="py-6 lg:px-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <IdentificationCard size={28} weight="duotone" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="tracking-tight text-display font-semibold text-foreground">
                      {policy.name}
                    </h1>
                    <StatusBadge
                      status={policy.status}
                      variant={statusVariant}
                      dot
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-body text-subtle">
                    <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
                      {policy.code || "NO-CODE"}
                    </span>
                    {headerChips}
                  </div>
                  {policy.parentPolicyId && (
                    <div className="mt-1 flex items-center gap-1.5 text-label text-faint">
                      <TreeStructure size={12} />
                      <span>
                        Derived from{" "}
                        <span className="font-semibold text-foreground">
                          {parentPolicyName || policy.parentPolicyId}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {policy.parentPolicyId && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      router.push(
                        `/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`
                      )
                    }
                    className="rounded-full text-body font-medium transition-all"
                  >
                    <CaretLeft size={16} weight="bold" className="mr-1.5" />
                    Back to Parent Policy
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onEdit}
                    className="rounded-full text-body font-medium transition-all"
                  >
                    <NotePencil size={16} weight="bold" className="mr-1.5" />
                    Edit Policy
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6 border-b border-border">
              {availableTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 py-3 text-body font-medium transition-all duration-300",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <Icon
                      size={16}
                      weight={isActive ? "fill" : "regular"}
                      className={cn("transition-colors", isActive && "text-primary")}
                    />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate text-heading font-semibold text-foreground">
                  {policy.name}
                </h2>
                <StatusBadge status={policy.status} variant={statusVariant} dot />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-label text-muted-foreground">
                <span className="rounded border border-border bg-muted/20 px-2 py-0.5 font-mono tracking-widest text-faint uppercase">
                  {policy.code || "NO-CODE"}
                </span>
                {headerChips}
              </div>
              {policy.parentPolicyId && (
                <div className="flex items-center gap-1.5 text-label text-faint">
                  <TreeStructure size={12} />
                  <span>
                    Derived from{" "}
                    <span className="font-semibold text-foreground">
                      {parentPolicyName || policy.parentPolicyId}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {policy.parentPolicyId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`
                    )
                  }
                  className="rounded-4xl text-body font-medium"
                >
                  <CaretLeft size={14} weight="bold" className="mr-1.5" />
                  Parent Policy
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEdit}
                  className="rounded-4xl text-body font-medium"
                >
                  <NotePencil size={14} weight="bold" className="mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-border">
            {availableTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 py-2 text-body font-medium transition-all duration-300",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <Icon
                    size={14}
                    weight={isActive ? "fill" : "regular"}
                    className={cn("transition-colors", isActive && "text-primary")}
                  />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-x-hidden overflow-y-auto",
        headerVariant === "standalone" ? "pt-6" : "pt-4"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "overview" &&
              (isVersion ? (
                <VersionOverviewTab
                  policy={policy}
                  groups={groups}
                  benefits={benefits}
                  parentBenefits={parentBenefits}
                  parentPolicyName={parentPolicyName}
                />
              ) : (
                <OverviewTab
                  policy={policy}
                  groups={groups}
                  benefits={benefits}
                  onEdit={onEdit}
                />
              ))}
            {activeTab === "benefit-groups" && (
              <BenefitGroupsTab
                policy={policy}
                groups={groups}
                benefits={benefits}
              />
            )}
            {!isVersion && activeTab === "versions" && (
              <VersionsTab
                policy={policy}
                versions={versions}
                overrideCounts={versionOverrideCounts}
                onCreateVersion={() =>
                  router.push(`/policies/${policy.id}/versions/new`)
                }
                onViewVersion={(id) =>
                  router.push(`/policies?policyId=${id}&mode=view&wizard=open`)
                }
                onEditVersion={
                  onEditVersion ?? ((id) => router.push(`/policies/${id}/edit`))
                }
                onRemoveVersion={onRemoveVersion ?? (() => {})}
              />
            )}
            {activeTab === "employees" && (
              <AssignedEmployeesTab policy={policy} employees={employees} />
            )}
            {activeTab === "audit" && <AuditLogTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
