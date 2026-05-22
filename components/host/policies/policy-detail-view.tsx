"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { SharedDataTable } from "@/components/shared/data-table"
import {
  ActionPopover,
  type ActionItem,
} from "@/components/shared/action-popover"
import { BenefitGroupSnapshot } from "@/components/host/policies/benefit-group-snapshot"
import {
  IdentificationCard,
  Gear,
  TreeStructure,
  Buildings,
  Users,
  ClockCounterClockwise,
  NotePencil,
  Plus,
  ArrowsDownUp,
  CaretLeft,
  Funnel,
  CaretDown,
  Barbell,
  Sparkle,
  FlowerLotus,
  Brain,
  HandHeart,
  Scissors,
  Leaf,
  Baby,
  PersonSimpleWalk,
} from "@phosphor-icons/react"
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import { SERVICES, getMainServiceName, resolveMainServiceId } from "@/lib/mock-data/service-catalog"
import { MOCK_ORGS } from "@/lib/mock-data"
import type { PolicyListItem } from "@/features/policies/types"
import type { EmployeeDirectoryItem } from "@/features/employees/types"

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

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: IdentificationCard },
  { id: "benefit-groups", label: "Benefit Groups", icon: TreeStructure },
  { id: "versions", label: "Versions", icon: TreeStructure },
  { id: "employees", label: "Assigned Employees", icon: Buildings },
  { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
] as const

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export type TabId = (typeof TABS)[number]["id"]

function getMainServiceIcon(serviceId: string) {
  const category = SERVICES.find((s) => s.id === resolveMainServiceId(serviceId))?.category
  switch (category) {
    case "Fitness & Exercise":
      return <Barbell size={16} weight="duotone" className="text-faint" />
    case "Massage & Bodywork":
      return <HandHeart size={16} weight="duotone" className="text-faint" />
    case "Spa & Aesthetics":
      return <Sparkle size={16} weight="duotone" className="text-faint" />
    case "Beauty & Personal Care":
      return <Scissors size={16} weight="duotone" className="text-faint" />
    case "Mental Health & Mindfulness":
      return <Brain size={16} weight="duotone" className="text-faint" />
    case "Alternative & Holistic Therapies":
      return <Leaf size={16} weight="duotone" className="text-faint" />
    case "Maternal & Child Wellness":
      return <Baby size={16} weight="duotone" className="text-faint" />
    case "Senior & Geriatric Wellness":
      return (
        <PersonSimpleWalk size={16} weight="duotone" className="text-faint" />
      )
    default:
      return (
        <FlowerLotus size={16} weight="duotone" className="text-faint" />
      )
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDependentLabel(policy: BenefitPolicy): string {
  if (!policy.dependentCoverages?.length) return "Employee only"
  const typeMap: Record<string, string> = {
    spouse: "Spouse",
    child: "Child",
    mother: "Mother",
    father: "Father",
    sibling: "Sibling",
    inlaw: "In-law",
  }
  return policy.dependentCoverages
    .map((c) => typeMap[c.type] ?? c.type)
    .join(", ")
}

function formatEmploymentChip(policy: BenefitPolicy): string {
  const types = (policy.eligibleEmploymentTypes ?? []).map(
    (t) => EMPLOYMENT_TYPE_LABELS[t] ?? t
  )
  if (types.length === 0) return "No employment types"
  if (types.length === 1) return types[0]
  const joined = `${types[0]} + ${types[1]}`
  if (types.length === 2 && joined.length <= 24) return joined
  return `${types.length} employment types`
}

function formatRefreshChip(policy: BenefitPolicy): string {
  if (policy.refreshCycle !== "Yearly") return policy.refreshCycle
  return `Yearly · ${
    policy.refreshStartReference === "financial_year"
      ? "FY start"
      : "Calendar year"
  }`
}

function formatUtilisationChip(policy: BenefitPolicy): string {
  if (policy.utilisationMode === "Fixed") return "Fixed utilisation"
  return `Prorated ${(policy.prorateUnit ?? "Monthly").toLowerCase()}`
}

function formatCoverageChip(policy: BenefitPolicy): string {
  return (policy.dependentCoverages?.length ?? 0) > 0
    ? "Employee + dependents"
    : "Employee only"
}

function formatAmountChip(policy: BenefitPolicy): string {
  return typeof policy.totalCapAmount === "number"
    ? `RM ${policy.totalCapAmount.toLocaleString()}`
    : "Unlimited amount"
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

  const canCreateVersion = policy.status === "active" && !policy.parentPolicyId

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

// ─── Versions Tab ─────────────────────────────────────────────────────────

function VersionsTab({
  policy,
  versions,
  overrideCounts = {},
  onCreateVersion,
  onViewVersion,
  onEditVersion,
  onRemoveVersion,
}: {
  policy: BenefitPolicy
  versions: PolicyListItem[]
  overrideCounts: Record<string, number>
  onCreateVersion: () => void
  onViewVersion: (id: string) => void
  onEditVersion: (id: string) => void
  onRemoveVersion: (id: string) => void
}) {
  const canCreateVersion = policy.status === "active" && !policy.parentPolicyId

  const versionRows = useMemo(
    () => versions.map((v, i) => ({ ...v, _versionLabel: `1.${i + 1}` })),
    [versions]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            {versions.length > 0 ? `Versions (${versions.length})` : "Versions"}
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            Override benefit amounts for specific employee groups and
            individuals.
          </p>
        </div>
        {canCreateVersion && (
          <Button
            onClick={onCreateVersion}
            className="h-9 rounded-full px-5 text-body font-medium shadow-sm"
          >
            <Plus size={15} weight="bold" className="mr-1.5" />
            Create Version
          </Button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-500 dark:border-violet-500/20 dark:bg-violet-500/10">
            <TreeStructure size={28} weight="duotone" />
          </div>
          <p className="text-body font-semibold text-foreground">
            No versions yet
          </p>
          <p className="mt-1 max-w-sm text-label text-faint">
            Create a version to tailor benefit amounts for a specific tier,
            department, or individual employee without changing the base policy.
          </p>
          {canCreateVersion && (
            <Button
              onClick={onCreateVersion}
              size="sm"
              className="mt-6 text-label font-medium"
            >
              <Plus size={14} weight="bold" className="mr-1.5" />
              Create Version
            </Button>
          )}
          {!canCreateVersion && policy.parentPolicyId && (
            <p className="mt-4 text-label text-faint italic">
              Versions can only be created from parent policies.
            </p>
          )}
        </div>
      ) : (
        <SharedDataTable
          data={versionRows}
          columns={[
            {
              header: "Version",
              align: "center",
              render: (row) => (
                <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                  {(row as (typeof versionRows)[number])._versionLabel}
                </span>
              ),
            },
            {
              header: "Version Name",
              accessorKey: "name",
              render: (row) => (
                <div>
                  <p className="text-body font-semibold text-foreground">
                    {row.name}
                  </p>
                  {row.code && (
                    <p className="mt-0.5 font-mono text-label text-faint">
                      {row.code}
                    </p>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (row) => (
                <StatusBadge
                  status={row.status}
                  variant={
                    row.status === "active"
                      ? "emerald"
                      : row.status === "draft"
                        ? "amber"
                        : "rose"
                  }
                  dot
                />
              ),
            },
            {
              header: "Employees",
              align: "center",
              render: (row) => {
                const count = row.targetEmployeeIds?.length ?? 0
                return (
                  <span className="text-body font-medium text-subtle tabular-nums">
                    {count > 0 ? count : "—"}
                  </span>
                )
              },
            },
            {
              header: "Overrides",
              align: "center",
              render: (row) => {
                const oc = overrideCounts[row.id] ?? 0
                return oc > 0 ? (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                  >
                    <ArrowsDownUp size={10} weight="bold" />
                    {oc}
                  </Badge>
                ) : (
                  <span className="text-label text-faint">—</span>
                )
              },
            },
            {
              header: "Actions",
              headerClassName: "text-right",
              align: "right",
              render: (row) => {
                const actions: ActionItem[] = [
                  {
                    label: "View version details",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onViewVersion(row.id)
                    },
                  },
                  {
                    label: "Edit version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onEditVersion(row.id)
                    },
                  },
                  {
                    label: "Remove version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onRemoveVersion(row.id)
                    },
                    isDanger: true,
                  },
                ]
                return (
                  <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionPopover actions={actions} />
                  </div>
                )
              },
            },
          ]}
          onRowClick={(row) => onViewVersion(row.id)}
          rowsPerPage={10}
          ghost
        />
      )}
    </div>
  )
}

function OverviewTab(props: {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  onEdit: () => void
}) {
  const { policy } = props
  const refreshLabels: Record<string, string> = {
    financial_year: "Financial Year",
    calendar_year: "Calendar Year",
  }

  return (
    <div className="space-y-6">
      {/* Policy Overview */}
      <DetailSection
        title="Policy Overview"
        icon={<IdentificationCard size={18} weight="duotone" />}
        description="Basic information and configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Policy Name" value={policy.name} />
          <DetailField label="Policy Code" value={policy.code || "—"} />
          <DetailField
            label="Status"
            value={<span className="capitalize">{policy.status}</span>}
          />
          <DetailField label="Organisation" value={policy.organizationId} />
          <div className="col-span-2 md:col-span-4">
            <DetailField
              label="Description"
              value={policy.description || "—"}
            />
          </div>
          <div className="col-span-2 md:col-span-4">
            <DetailField
              label="Employment Types"
              value={policy.eligibleEmploymentTypes
                .map((t) =>
                  t
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                )
                .join(", ")}
            />
          </div>
        </div>
      </DetailSection>

      {/* Pool & Cycle */}
      <DetailSection
        title="Pool & Cycle"
        icon={<Gear size={18} weight="duotone" />}
        description="Fund allocation and refresh configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField
            label="Dependents"
            value={
              (policy.dependentCoverages?.length ?? 0) > 0
                ? "Covered"
                : "Employee Only"
            }
          />
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField
              label="Dependent Types"
              value={
                policy.dependentCoverages
                  ?.map((c) =>
                    c.type === "spouse"
                      ? "Spouse"
                      : c.type === "child"
                        ? "Child"
                        : c.type === "mother"
                          ? "Mother"
                          : c.type === "father"
                            ? "Father"
                            : c.type === "sibling"
                              ? "Sibling"
                              : "In-law"
                  )
                  .join(", ") || "—"
              }
            />
          )}
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField
              label="Dependents Pool Type"
              value={
                policy.dependentsPoolType === "SharedWithEmployee"
                  ? "Shared with Employee"
                  : policy.dependentsPoolType || "—"
              }
            />
          )}
          <DetailField
            label="Utilisation Mode"
            value={
              policy.utilisationMode === "Fixed"
                ? "Fixed Allocation"
                : "Prorated Allocation"
            }
          />
          {policy.utilisationMode === "Prorated" && (
            <DetailField
              label="Prorate Unit"
              value={policy.prorateUnit || "—"}
            />
          )}
          <DetailField label="Refresh Cycle" value={policy.refreshCycle} />
          <DetailField
            label="Start Reference"
            value={
              refreshLabels[policy.refreshStartReference] ||
              policy.refreshStartReference
            }
          />
          {policy.refreshStartMonth && (
            <DetailField
              label="Start Month"
              value={
                [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ][policy.refreshStartMonth - 1] ?? "—"
              }
            />
          )}
        </div>
      </DetailSection>

      {/* Eligibility */}
      {policy.eligibility && (
        <DetailSection
          title="Employee Eligibility"
          icon={<Users size={18} weight="duotone" />}
          description="Filter criteria for automatic employee assignment"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            <DetailField
              label="Age Range"
              value={
                policy.eligibility.minAge || policy.eligibility.maxAge
                  ? `${policy.eligibility.minAge || "Any"} — ${policy.eligibility.maxAge || "Any"}`
                  : "Any age"
              }
            />
            <DetailField
              label="Gender"
              value={
                <span className="capitalize">
                  {policy.eligibility.gender || "All"}
                </span>
              }
            />
            <DetailField
              label="Tier Restrictions"
              value={
                policy.eligibility.tierIds?.length
                  ? `${policy.eligibility.tierIds.length} tier(s)`
                  : "None"
              }
            />
          </div>
        </DetailSection>
      )}
    </div>
  )
}

// ─── Benefit Groups Tab ───────────────────────────────────────────────────────

function BenefitGroupsTab({
  policy,
  groups,
  benefits,
}: {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
}) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Benefits and amounts configured per group"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem(
                  `policy-groups-draft-${policy.id}`,
                  JSON.stringify({ policy, groups, benefits })
                )
              }
              router.push(`/policies/${policy.id}/groups/edit`)
            }}
            className="flex h-8 items-center gap-2 text-label font-medium"
          >
            <NotePencil size={14} weight="bold" />
            Edit Groups
          </Button>
        }
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-16">
            <TreeStructure
              size={36}
              weight="duotone"
              className="mb-3 text-faint"
            />
            <p className="text-body font-medium text-muted-foreground">
              No benefit groups configured.
            </p>
            <p className="mt-1 text-label text-faint">
              Add groups to define which benefits are available.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    `policy-groups-draft-${policy.id}`,
                    JSON.stringify({ policy, groups, benefits })
                  )
                }
                router.push(`/policies/${policy.id}/groups/edit`)
              }}
              className="mt-3 font-semibold text-primary"
            >
              <NotePencil size={14} weight="bold" className="mr-1.5" />
              Add Groups
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const groupBenefits = benefits.filter(
                (b) => b.groupId === group.id
              )
              const coverageScope = group.coverageScope ?? "Employee"
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="border-b border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-body font-semibold text-foreground">
                              {group.name}
                            </p>
                          </div>
                          {group.description && (
                            <p className="truncate text-label text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                          <BenefitGroupSnapshot
                            policy={policy}
                            group={group}
                            benefits={groupBenefits}
                            variant="inline"
                            className="mt-3"
                          />
                        </div>
                      </div>

                      <Badge variant="outline">
                        {groupBenefits.length}{" "}
                        {groupBenefits.length === 1 ? "Service" : "Services"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    {groupBenefits.map((benefit) => {
                      const employeeCoPay =
                        group.distributionType === "SharedAmount"
                          ? group.coPayment
                          : benefit.coPayment
                      const dependentCoPay =
                        group.distributionType === "SharedAmount"
                          ? group.dependentCoPayment
                          : benefit.dependentCoPayment
                      const employeeAmount =
                        typeof benefit.employeeAmount === "number"
                          ? benefit.employeeAmount
                          : benefit.amount
                      const dependentAmount =
                        typeof benefit.dependantAmount === "number"
                          ? benefit.dependantAmount
                          : benefit.amount
                      return (
                        <div
                          key={benefit.id}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            {getMainServiceIcon(benefit.serviceId)}
                            <span className="text-body font-medium text-foreground">
                              {getMainServiceName(benefit.serviceId)}
                            </span>
                            {coverageScope !== "Dependent" &&
                              employeeCoPay?.required && (
                                <Badge variant="secondary">
                                  Employee Co-pay{" "}
                                  {employeeCoPay.type === "Percentage"
                                    ? `${employeeCoPay.value}%`
                                    : `RM ${employeeCoPay.value}`}
                                </Badge>
                              )}
                            {coverageScope !== "Employee" &&
                              dependentCoPay?.required && (
                                <Badge variant="secondary">
                                  Dependent Co-pay{" "}
                                  {dependentCoPay.type === "Percentage"
                                    ? `${dependentCoPay.value}%`
                                    : `RM ${dependentCoPay.value}`}
                                </Badge>
                              )}
                          </div>
                          {coverageScope === "Both" ? (
                            <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                              RM {employeeAmount.toFixed(2)} / RM{" "}
                              {dependentAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                              RM{" "}
                              {(coverageScope === "Dependent"
                                ? dependentAmount
                                : employeeAmount
                              ).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                    {groupBenefits.length === 0 && (
                      <p className="py-4 text-center text-label text-faint italic">
                        No benefits configured for this group.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DetailSection>
    </div>
  )
}

// ─── Version Overview Tab ─────────────────────────────────────────────────────

function VersionOverviewTab({
  policy,
  groups,
  benefits,
  parentBenefits,
  parentPolicyName,
}: {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  parentBenefits?: Benefit[]
  parentPolicyName?: string
}) {
  const router = useRouter()

  function formatRM(amount: number): string {
    return `RM ${amount.toFixed(2)}`
  }

  function getServiceName(serviceId: string): string {
    return SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId
  }

  const tierOptions = useMemo(() => {
    const org = MOCK_ORGS.find((o) => o.id === policy.organizationId)
    return (org?.tierConfigs ?? []).map((t) => ({
      value: t.id,
      label: t.code ? `${t.code} - ${t.name}` : t.name,
    }))
  }, [policy.organizationId])

  const departmentOptions = useMemo(() => {
    const org = MOCK_ORGS.find((o) => o.id === policy.organizationId)
    return (org?.departmentConfigs ?? []).map((d) => ({
      value: d.id,
      label: d.code ? `${d.code} - ${d.name}` : d.name,
    }))
  }, [policy.organizationId])

  const diffEntries = useMemo(() => {
    if (!parentBenefits || parentBenefits.length === 0) return []
    return benefits
      .filter((vb) => {
        const parent = parentBenefits.find(
          (pb) => pb.serviceId === vb.serviceId
        )
        return parent && parent.amount !== vb.amount
      })
      .map((vb) => {
        const parent = parentBenefits.find(
          (pb) => pb.serviceId === vb.serviceId
        )!
        const group = groups.find((g) => g.id === vb.groupId)
        return {
          benefit: vb,
          parentAmount: parent.amount,
          groupName: group?.name ?? "—",
        }
      })
  }, [benefits, parentBenefits, groups])

  const groupedDiffs = useMemo(() => {
    const map = new Map<string, typeof diffEntries>()
    diffEntries.forEach((entry) => {
      const existing = map.get(entry.groupName) ?? []
      existing.push(entry)
      map.set(entry.groupName, existing)
    })
    return Array.from(map.entries())
  }, [diffEntries])

  const hasOverrides = diffEntries.length > 0

  const eligibleEmpLabels = (policy.eligibleEmploymentTypes ?? []).map(
    (et) => EMPLOYMENT_TYPE_LABELS[et] ?? et
  )
  const tierLabels = (policy.eligibility?.tierIds ?? []).map(
    (id) => tierOptions.find((t) => t.value === id)?.label ?? id
  )
  const deptLabels = (policy.eligibility?.departmentIds ?? []).map(
    (id) => departmentOptions.find((d) => d.value === id)?.label ?? id
  )

  return (
    <div className="space-y-6">
      {/* Version Summary */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
            <TreeStructure size={20} weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="truncate text-lead font-semibold text-foreground">
                {policy.name}
              </h3>
              <StatusBadge
                status={policy.status}
                variant={
                  policy.status === "active"
                    ? "emerald"
                    : policy.status === "draft"
                      ? "amber"
                      : "rose"
                }
                dot
              />
            </div>
            {policy.code && (
              <p className="mt-0.5 font-mono text-label text-faint">
                {policy.code}
              </p>
            )}
            {policy.description && (
              <p className="mt-2 text-body text-subtle">{policy.description}</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-label text-faint">
              <TreeStructure size={12} />
              <span>
                Derived from{" "}
                <button
                  onClick={() =>
                    router.push(
                      `/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`
                    )
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  {parentPolicyName || policy.parentPolicyId}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Targeting - Collapsible accordion */}
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Funnel size={14} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-body font-semibold text-foreground">
                Targeting
              </p>
              <p className="truncate text-label text-muted-foreground">
                {eligibleEmpLabels.length} employment type
                {eligibleEmpLabels.length !== 1 ? "s" : ""}
                {" · "}
                {tierLabels.length} tier{tierLabels.length !== 1 ? "s" : ""}
                {" · "}
                {deptLabels.length} department
                {deptLabels.length !== 1 ? "s" : ""}
              </p>
            </div>
            <CaretDown
              size={14}
              weight="bold"
              className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-4 pb-4">
            {eligibleEmpLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">
                  Employment Types
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {eligibleEmpLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {tierLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">
                  Tiers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tierLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {deptLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">
                  Departments
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {deptLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {eligibleEmpLabels.length === 0 &&
              tierLabels.length === 0 &&
              deptLabels.length === 0 && (
                <p className="text-label text-faint italic">
                  No targeting filters applied.
                </p>
              )}
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Benefit Amount Changes */}
      {parentBenefits && parentBenefits.length > 0 ? (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ArrowsDownUp size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">
                Benefit Amount Changes
              </h3>
              <p className="mt-0.5 text-label text-muted-foreground">
                {hasOverrides
                  ? "Overridden amounts relative to the parent policy"
                  : "All amounts match the parent policy"}
              </p>
            </div>
          </div>
          {hasOverrides ? (
            <div className="space-y-3">
              {groupedDiffs.map(([groupName, entries]) => (
                <div
                  key={groupName}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">
                      {groupName}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {entries.map(({ benefit, parentAmount }) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-body font-medium text-foreground">
                          {getServiceName(benefit.serviceId)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-body text-faint tabular-nums line-through">
                            {formatRM(parentAmount)}
                          </span>
                          <span className="font-mono text-body font-semibold text-primary tabular-nums">
                            {formatRM(benefit.amount)}
                          </span>
                          <Badge variant="secondary" className="tabular-nums">
                            +{formatRM(benefit.amount - parentAmount)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-12 text-center">
              <ArrowsDownUp
                size={32}
                weight="duotone"
                className="mb-3 text-faint"
              />
              <p className="text-body font-medium text-muted-foreground">
                No benefit changes detected.
              </p>
              <p className="mt-1 text-label text-faint">
                All benefit amounts in this version match the parent policy.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <TreeStructure size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">
                Benefit Amounts
              </h3>
              <p className="mt-0.5 text-label text-muted-foreground">
                Configured benefits for this version
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {groups.map((group) => {
              const groupBenefits = benefits.filter(
                (b) => b.groupId === group.id
              )
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">
                      {group.name}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {groupBenefits.map((benefit) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-body font-medium text-foreground">
                          {getServiceName(benefit.serviceId)}
                        </span>
                        <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                          {formatRM(benefit.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Assigned Employees Tab ──────────────────────────────────────────────────

function AssignedEmployeesTab({
  employees,
}: {
  policy: BenefitPolicy
  employees?: EmployeeDirectoryItem[]
}) {
  const employeeList = employees ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            Assigned Employees
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            {employeeList.length} employee{employeeList.length !== 1 ? "s" : ""}{" "}
            currently assigned.
          </p>
        </div>
      </div>

      {employeeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20 text-center">
          <Users size={36} weight="duotone" className="mb-3 text-faint" />
          <p className="text-body font-medium text-muted-foreground">
            No assigned employees
          </p>
          <p className="mt-1 max-w-xs text-label text-faint">
            Employees matching the policy eligibility criteria will appear here
            once assigned.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="grid grid-cols-12 text-label font-semibold text-muted-foreground">
              <span className="col-span-3">Employee</span>
              <span className="col-span-3">Department</span>
              <span className="col-span-2">Tier</span>
              <span className="col-span-2">Join Date</span>
              <span className="col-span-2">Status</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {employeeList.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="col-span-3">
                  <p className="text-body font-semibold text-foreground">
                    {emp.name}
                  </p>
                  <p className="font-mono text-label text-faint">
                    {emp.empCode}
                  </p>
                </div>
                <div className="col-span-3">
                  <span className="text-body text-subtle">
                    {emp.department}
                  </span>
                </div>
                <div className="col-span-2">
                  <Badge variant="secondary">{emp.tier}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-body text-subtle">{emp.joinDate}</span>
                </div>
                <div className="col-span-2">
                  <StatusBadge
                    status={
                      emp.status === "active"
                        ? "Active"
                        : emp.status === "on-leave"
                          ? "On Leave"
                          : "Inactive"
                    }
                    variant={
                      emp.status === "active"
                        ? "emerald"
                        : emp.status === "on-leave"
                          ? "amber"
                          : "zinc"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Audit Log Tab (Placeholder) ─────────────────────────────────────────────

type PolicyAuditEvent = {
  id: string
  at: string
  actor: string
  action: string
  summary: string
  meta?: { label: string; value: string }[]
}

const MOCK_POLICY_AUDIT_EVENTS: PolicyAuditEvent[] = [
  {
    id: "AUD-20260521-0001",
    at: "21 May 2026 · 10:12 AM",
    actor: "Aina (Host Admin)",
    action: "Created",
    summary: "Policy created from template “Standard Health”.",
    meta: [
      { label: "Template", value: "standard-health" },
      { label: "Refresh Cycle", value: "Yearly" },
    ],
  },
  {
    id: "AUD-20260521-0002",
    at: "21 May 2026 · 10:18 AM",
    actor: "Aina (Host Admin)",
    action: "Updated",
    summary: "Employment types updated.",
    meta: [{ label: "Employment Types", value: "Full-time, Part-time" }],
  },
  {
    id: "AUD-20260521-0003",
    at: "21 May 2026 · 10:26 AM",
    actor: "Irfan (Benefits Manager)",
    action: "Updated",
    summary: "Employee policy amount set.",
    meta: [{ label: "Employee Policy Amount", value: "RM 3,000" }],
  },
  {
    id: "AUD-20260521-0004",
    at: "21 May 2026 · 10:33 AM",
    actor: "Irfan (Benefits Manager)",
    action: "Edited Groups",
    summary: "Added 2 benefits under “Physical Wellbeing”.",
    meta: [
      { label: "Group", value: "Physical Wellbeing" },
      { label: "Services", value: "Gym Access, Fitness Classes" },
    ],
  },
  {
    id: "AUD-20260521-0005",
    at: "21 May 2026 · 10:47 AM",
    actor: "System",
    action: "Assigned",
    summary: "Policy assigned to organisation.",
    meta: [{ label: "Organisation", value: "Acme Corporation Sdn Bhd" }],
  },
]

function AuditLogTab() {
  const events = MOCK_POLICY_AUDIT_EVENTS
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading font-semibold text-foreground">
          Audit Log
        </h3>
        <p className="mt-1 text-body text-muted-foreground">
          Track changes to this policy over time.
        </p>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-card text-muted/30">
            <ClockCounterClockwise size={32} weight="duotone" />
          </div>
          <p className="text-body font-medium text-muted-foreground">
            No audit events yet.
          </p>
          <p className="mt-1 text-label text-faint">
            Policy changes will be logged here once activity begins.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border/60">
            {events.map((e) => (
              <div key={e.id} className="p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-4xl border-border bg-muted/30 text-label font-medium text-muted-foreground"
                      >
                        {e.action}
                      </Badge>
                      <p className="text-body font-medium text-foreground">
                        {e.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-label text-faint">
                      <span className="font-medium text-muted-foreground">
                        {e.actor}
                      </span>
                      <span className="text-faint">·</span>
                      <span>{e.at}</span>
                      <span className="text-faint">·</span>
                      <span className="font-mono tracking-widest uppercase">
                        {e.id}
                      </span>
                    </div>
                  </div>
                  {e.meta && e.meta.length > 0 && (
                    <div className="flex max-w-full flex-wrap items-center justify-start gap-2 sm:justify-end">
                      {e.meta.map((m) => (
                        <Badge
                          key={`${e.id}-${m.label}`}
                          variant="outline"
                          className="h-8 gap-2 rounded-4xl border-border bg-card/40 px-3 text-body font-medium text-foreground"
                        >
                          <span className="text-body font-medium text-muted-foreground">
                            {m.label}:
                          </span>
                          <span className="max-w-[34ch] truncate font-mono tabular-nums">
                            {m.value}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
