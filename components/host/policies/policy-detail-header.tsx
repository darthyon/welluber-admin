"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn, formatDate } from "@/lib/utils"
import {
  CaretLeft,
  IdentificationCard,
  NotePencil,
  TreeStructure,
} from "@phosphor-icons/react"
import { TABS, type TabId } from "./detail-tabs/policy-detail-helpers"

interface PolicyDetailHeaderProps {
  activeTab: TabId
  availableTabs: readonly (typeof TABS)[number][]
  amountChip: string
  canEdit: boolean
  coverageChip: string
  dependentsLabel: string
  employmentList: string[]
  hasDependents: boolean
  headerVariant: "standalone" | "embedded"
  isVersion: boolean
  onEdit: () => void
  onGoToParent: () => void
  onSelectTab: (tabId: TabId) => void
  parentLabel?: string
  policyCode?: string
  policyCreatedAt?: string
  policyGroupCount: number
  policyName: string
  policyOrgName: string
  policyStatus: string
  policyVersion?: string
  refreshChip: string
  statusVariant: "emerald" | "amber" | "rose"
  utilisationChip: string
}

export function PolicyDetailHeader({
  activeTab,
  availableTabs,
  amountChip,
  canEdit,
  coverageChip,
  dependentsLabel,
  employmentList,
  hasDependents,
  headerVariant,
  isVersion,
  onEdit,
  onGoToParent,
  onSelectTab,
  parentLabel,
  policyCode,
  policyCreatedAt,
  policyGroupCount,
  policyName,
  policyOrgName,
  policyStatus,
  policyVersion,
  refreshChip,
  statusVariant,
  utilisationChip,
}: PolicyDetailHeaderProps) {
  const identityMeta = [
    policyVersion ? `Version ${policyVersion}` : null,
    policyOrgName,
    policyCreatedAt ? `Created ${formatDate(policyCreatedAt)}` : null,
    `${policyGroupCount} ${policyGroupCount === 1 ? "Group" : "Groups"}`,
  ].filter(Boolean)

  const inheritedRulesButton = (size: "sm" | "lg") => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-testid="inherited-rules-trigger"
          variant="outline"
          size={size}
          className="rounded-4xl text-body font-medium"
        >
          View Inherited Rules
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-testid="inherited-rules-popover"
        align="end"
        className="w-[460px] rounded-lg border border-border bg-card p-0 shadow-2xl"
      >
        <div>
          <div className="border-b border-border bg-muted/30 p-4">
            <p className="text-lead font-semibold text-foreground">
              Inherited Rules
            </p>
            <p className="mt-0.5 text-label text-muted-foreground">
              Defaults that apply before benefit group overrides.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <HeaderInfoBlock
                label="Applies To"
                value={
                  employmentList.length
                    ? employmentList.join(", ")
                    : "Not Restricted"
                }
              />
              <HeaderInfoBlock
                label="Refresh"
                value={refreshChip}
                helper={
                  refreshChip === "Yearly" ? "FY start or calendar year" : ""
                }
              />
              <HeaderInfoBlock
                label="Utilisation"
                value={
                  utilisationChip === "Fixed"
                    ? "Fixed Allocation"
                    : utilisationChip
                }
              />
              <HeaderInfoBlock
                label="Coverage"
                value={coverageChip}
                helper={
                  hasDependents ? dependentsLabel : "No dependents covered"
                }
              />
              <HeaderInfoBlock label="Policy Amount" value={amountChip} />
              <HeaderInfoBlock
                label="Benefit Groups"
                value={`${policyGroupCount} ${policyGroupCount === 1 ? "Group" : "Groups"}`}
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-label font-medium text-muted-foreground">
                Group Overrides
              </p>
              <p className="mt-1 text-body font-medium text-foreground">
                Benefit groups can set coverage scope, distribution type,
                service amounts, usage caps, dependent caps, and co-pay rules.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  const tabBar = (
    <div
      className={cn(
        "flex items-center gap-6 border-b border-border",
        headerVariant === "standalone" && "mt-8"
      )}
    >
      {availableTabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 text-body font-medium transition-all duration-300",
              headerVariant === "standalone" ? "py-3" : "py-2",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Icon
              size={headerVariant === "standalone" ? 16 : 14}
              weight={isActive ? "fill" : "regular"}
              className={cn("transition-colors", isActive && "text-primary")}
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  if (headerVariant === "embedded") {
    return (
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate text-heading font-semibold text-foreground">
                {policyName}
              </h2>
              <StatusBadge status={policyStatus} variant={statusVariant} dot />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-label text-muted-foreground">
              <span className="rounded border border-border bg-muted/20 px-2 py-0.5 font-mono tracking-widest text-faint uppercase">
                {policyCode || "NO-CODE"}
              </span>
              <span className="text-muted-foreground">
                {identityMeta.join(" · ")}
              </span>
            </div>
            {isVersion && parentLabel ? (
              <div className="flex items-center gap-1.5 text-label text-faint">
                <TreeStructure size={12} />
                <span>
                  Derived from{" "}
                  <span className="font-semibold text-foreground">
                    {parentLabel}
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {inheritedRulesButton("sm")}
            {isVersion ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToParent}
                className="rounded-4xl text-body font-medium"
              >
                <CaretLeft size={14} weight="bold" className="mr-1.5" />
                Parent Policy
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
                className="rounded-4xl text-body font-medium"
              >
                <NotePencil size={14} weight="bold" className="mr-1.5" />
                Edit
              </Button>
            ) : null}
          </div>
        </div>
        {tabBar}
      </div>
    )
  }

  return (
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
                  {policyName}
                </h1>
                <StatusBadge
                  status={policyStatus}
                  variant={statusVariant}
                  dot
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-body text-subtle">
                <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
                  {policyCode || "NO-CODE"}
                </span>
                <span className="text-label text-muted-foreground">
                  {identityMeta.join(" · ")}
                </span>
              </div>
              {isVersion && parentLabel ? (
                <div className="mt-1 flex items-center gap-1.5 text-label text-faint">
                  <TreeStructure size={12} />
                  <span>
                    Derived from{" "}
                    <span className="font-semibold text-foreground">
                      {parentLabel}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inheritedRulesButton("lg")}
            {isVersion ? (
              <Button
                variant="outline"
                size="lg"
                onClick={onGoToParent}
                className="rounded-4xl text-body font-medium transition-all"
              >
                <CaretLeft size={16} weight="bold" className="mr-1.5" />
                Back to Parent Policy
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={onEdit}
                className="rounded-4xl text-body font-medium transition-all"
              >
                <NotePencil size={16} weight="bold" className="mr-1.5" />
                Edit Policy
              </Button>
            ) : null}
          </div>
        </div>

        {tabBar}
      </div>
    </div>
  )
}

function HeaderInfoBlock({
  helper,
  label,
  value,
}: {
  helper?: string
  label: string
  value?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      {value ? (
        <p className="text-body font-medium text-foreground">{value}</p>
      ) : null}
      {helper ? <p className="text-label text-faint">{helper}</p> : null}
    </div>
  )
}
