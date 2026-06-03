"use client"

import { Plus, Trash, TreeStructure } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { cn } from "@/lib/utils"
import type { BenefitGroupCoverageScope } from "@/types/policy"
import type { BenefitPolicyWizardCtx } from "../wizard-types"
import { BenefitGroupSnapshot } from "@/components/host/policies/benefit-group-snapshot"
import {
  PolicyDependentCoverageModal,
  PolicyGroupCoverageColumns,
  PolicyGroupServicesSection,
  PolicyGroupUtilisationSection,
} from "@/components/host/policies/policy-group-sections"

interface GroupsStepProps {
  ctx: BenefitPolicyWizardCtx
}

export function GroupsStep({ ctx }: GroupsStepProps) {
  const {
    policyData,
    setPolicyData,
    groups,
    benefits,
    validationErrors,
    isViewMode,
    depModalGroupId,
    setDepModalGroupId,
    addGroup,
    removeGroup,
    updateGroup,
    updateGroupCoPayment,
    updateDependentCoPayment,
    setGroupCoverageScope,
    toggleService,
    updateBenefit,
  } = ctx

  return (
    <DetailSection
      title="Benefit Groups"
      icon={<TreeStructure size={18} weight="duotone" />}
      description="Organize benefits into logical groups with budget controls"
      ghost
      action={
        !isViewMode ? (
          <Button onClick={addGroup} size="sm" className="flex h-8 items-center gap-2 rounded-full px-4 text-label">
            <Plus size={14} weight="bold" />
            Add Group
          </Button>
        ) : undefined
      }
    >
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
          <TreeStructure size={36} weight="duotone" className="mx-auto mb-3 text-faint" />
          <p className="text-body font-medium text-muted-foreground">
            {isViewMode ? "No benefit groups configured." : "No benefit groups yet."}
          </p>
          {!isViewMode && (
            <Button variant="ghost" onClick={addGroup} className="mt-2 text-body font-semibold text-primary">
              Create your first group
            </Button>
          )}
          {validationErrors.groups && (
            <p className="mt-2 text-label font-medium text-rose-600 dark:text-rose-400">
              {validationErrors.groups}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, groupIndex) => {
            const groupBenefits = benefits.filter((benefit) => benefit.groupId === group.id)
            const groupErrors = validationErrors

            return (
              <div
                key={group.id}
                className="animate-in overflow-hidden rounded-lg border border-border bg-card/40 duration-300 zoom-in-95 fade-in"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {isViewMode ? (
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-body font-semibold text-foreground">{group.name}</p>
                          {group.description && (
                            <p className="truncate text-label text-muted-foreground">{group.description}</p>
                          )}
                          <BenefitGroupSnapshot
                            policy={policyData}
                            group={group}
                            benefits={groupBenefits}
                            variant="inline"
                            className="mt-3"
                          />
                        </div>
                        <Badge variant="outline">
                          {groupBenefits.length} {groupBenefits.length === 1 ? "Service" : "Services"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                          value={group.name}
                          onChange={(event) => updateGroup(group.id, "name", event.target.value)}
                          placeholder="Group Name"
                        />
                        {groupErrors[`group_name_${group.id}`] && (
                          <p className="text-micro text-destructive">{groupErrors[`group_name_${group.id}`]}</p>
                        )}
                        <input
                          className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-label text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10"
                          value={group.description || ""}
                          onChange={(event) => updateGroup(group.id, "description", event.target.value)}
                          placeholder="Brief description..."
                        />
                      </div>
                    )}
                  </div>
                  {!isViewMode && (
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-5 p-4">
                  {!isViewMode && (
                    <div className="space-y-2">
                      <p className="text-label font-medium text-muted-foreground">Covers</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {(["Employee", "Dependent", "Both"] as BenefitGroupCoverageScope[]).map((scope) => {
                          const selected = (group.coverageScope ?? "Employee") === scope
                          return (
                            <button
                              key={scope}
                              type="button"
                              onClick={() => setGroupCoverageScope(group.id, scope)}
                              className={cn(
                                "rounded-4xl border px-3 py-1.5 text-label font-medium transition-colors",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30",
                              )}
                            >
                              {scope}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <PolicyGroupCoverageColumns
                    group={group}
                    groupErrors={groupErrors}
                    onOpenDependentCoverage={() => setDepModalGroupId(group.id)}
                    policyData={policyData}
                    updateDependentCoPayment={updateDependentCoPayment}
                    updateGroup={updateGroup}
                    updateGroupCoPayment={updateGroupCoPayment}
                  />

                  <PolicyDependentCoverageModal
                    depModalGroupId={depModalGroupId}
                    groupId={group.id}
                    onClose={() => setDepModalGroupId(null)}
                    policyData={policyData}
                    setPolicyData={setPolicyData}
                  />

                  <PolicyGroupUtilisationSection
                    group={group}
                    isViewMode={isViewMode}
                    policyData={policyData}
                    updateGroup={updateGroup}
                  />

                  <PolicyGroupServicesSection
                    coverageScope={group.coverageScope ?? "Employee"}
                    groupBenefits={groupBenefits}
                    groupErrors={groupErrors}
                    groupId={group.id}
                    groupIndex={groupIndex}
                    isViewMode={isViewMode}
                    onToggleService={(serviceId) => toggleService(group.id, serviceId)}
                    onUpdateBenefit={updateBenefit}
                    policyData={policyData}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DetailSection>
  )
}
