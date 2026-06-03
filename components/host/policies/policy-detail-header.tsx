"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { CaretLeft, IdentificationCard, NotePencil, TreeStructure } from "@phosphor-icons/react"
import { TABS, type TabId } from "./detail-tabs/policy-detail-helpers"

interface PolicyDetailHeaderProps {
  activeTab: TabId
  availableTabs: readonly (typeof TABS)[number][]
  amountChip: string
  canEdit: boolean
  coverageChip: string
  dependentsLabel: string
  employmentChip: string
  employmentList: string[]
  hasDependents: boolean
  headerVariant: "standalone" | "embedded"
  isVersion: boolean
  onEdit: () => void
  onGoToParent: () => void
  onSelectTab: (tabId: TabId) => void
  parentLabel?: string
  policyCode?: string
  policyName: string
  policyStatus: string
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
  employmentChip,
  employmentList,
  hasDependents,
  headerVariant,
  isVersion,
  onEdit,
  onGoToParent,
  onSelectTab,
  parentLabel,
  policyCode,
  policyName,
  policyStatus,
  refreshChip,
  statusVariant,
  utilisationChip,
}: PolicyDetailHeaderProps) {
  const headerChips = (
    <div className="flex flex-wrap items-center gap-2">
      <div data-testid="policy-header-chips" className="flex flex-wrap items-center gap-2">
        {[employmentChip, refreshChip, utilisationChip, coverageChip].map((chipLabel) => (
          <Badge
            key={chipLabel}
            variant="outline"
            className="rounded-4xl border-border bg-muted/20 text-body font-medium text-muted-foreground"
          >
            {chipLabel}
          </Badge>
        ))}
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
            View Inherited Rules
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-testid="inherited-rules-popover"
          align="start"
          className="w-[420px] rounded-lg border border-border bg-card p-4 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <p className="text-lead font-semibold text-foreground">Inherited Rules</p>
              <p className="mt-0.5 text-label text-muted-foreground">
                Policy defaults that benefit groups inherit.
              </p>
            </div>

            <div className="space-y-3">
              <HeaderInfoBlock
                label="Eligibility"
                value={`${employmentList.length} employment type${employmentList.length === 1 ? "" : "s"}`}
                helper={employmentList.join(", ") || "—"}
              />
              <HeaderInfoBlock
                label="Cadence"
                value={`Refresh Cycle: ${refreshChip}`}
                helper={refreshChip === "Yearly" ? "FY start or calendar year" : "—"}
              />
              <HeaderInfoBlock
                label="Utilisation"
                value={utilisationChip === "Fixed" ? "Fixed utilisation" : utilisationChip}
              />
              <HeaderInfoBlock
                label="Coverage"
                value={coverageChip}
                helper={hasDependents ? dependentsLabel : "No dependents covered"}
              />
              <HeaderInfoBlock label="Policy Amount" value={amountChip} />
              <HeaderInfoBlock
                label="Configurable In Benefit Groups"
                helper="Coverage scope · Distribution type · Benefit amount · Usage caps · Dependent caps · Co-pay rules"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  const tabBar = (
    <div className={cn("flex items-center gap-6 border-b border-border", headerVariant === "standalone" && "mt-8")}>
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
              <h2 className="min-w-0 truncate text-heading font-semibold text-foreground">{policyName}</h2>
              <StatusBadge status={policyStatus} variant={statusVariant} dot />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-label text-muted-foreground">
              <span className="rounded border border-border bg-muted/20 px-2 py-0.5 font-mono tracking-widest text-faint uppercase">
                {policyCode || "NO-CODE"}
              </span>
              {headerChips}
            </div>
            {isVersion && parentLabel ? (
              <div className="flex items-center gap-1.5 text-label text-faint">
                <TreeStructure size={12} />
                <span>
                  Derived from <span className="font-semibold text-foreground">{parentLabel}</span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isVersion ? (
              <Button variant="outline" size="sm" onClick={onGoToParent} className="rounded-4xl text-body font-medium">
                <CaretLeft size={14} weight="bold" className="mr-1.5" />
                Parent Policy
              </Button>
            ) : null}
            {canEdit ? (
              <Button variant="secondary" size="sm" onClick={onEdit} className="rounded-4xl text-body font-medium">
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
                <h1 className="text-display font-semibold tracking-tight text-foreground">{policyName}</h1>
                <StatusBadge status={policyStatus} variant={statusVariant} dot />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-body text-subtle">
                <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
                  {policyCode || "NO-CODE"}
                </span>
                {headerChips}
              </div>
              {isVersion && parentLabel ? (
                <div className="mt-1 flex items-center gap-1.5 text-label text-faint">
                  <TreeStructure size={12} />
                  <span>
                    Derived from <span className="font-semibold text-foreground">{parentLabel}</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isVersion ? (
              <Button variant="outline" size="lg" onClick={onGoToParent} className="rounded-4xl text-body font-medium transition-all">
                <CaretLeft size={16} weight="bold" className="mr-1.5" />
                Back to Parent Policy
              </Button>
            ) : null}
            {canEdit ? (
              <Button variant="secondary" size="lg" onClick={onEdit} className="rounded-4xl text-body font-medium transition-all">
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
      {value ? <p className="text-body font-medium text-foreground">{value}</p> : null}
      {helper ? <p className="text-label text-faint">{helper}</p> : null}
    </div>
  )
}
