"use client"

import { CaretDown, Plus, Trash, TreeStructure } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { BenefitGroupCoverageScope } from "@/types/policy"
import { SectionHeader, ErrorText } from "../wizard-shared-ui"
import type { PolicyWizardCtx } from "../wizard-section-types"
import {
  PolicyDependentCoverageModal,
  PolicyGroupCoverageColumns,
  PolicyGroupServicesSection,
  PolicyGroupUtilisationSection,
} from "@/components/host/policies/policy-group-sections"

interface GroupsSectionProps {
  ctx: PolicyWizardCtx
}

export function GroupsSection({ ctx }: GroupsSectionProps) {
  const {
    policyData,
    setPolicyData,
    groups,
    benefits,
    validationErrors,
    depModalGroupId,
    setDepModalGroupId,
    addGroup,
    removeGroup,
    updateGroup,
    updateGroupCoPayment,
    updateDependentCoPayment,
    toggleService,
    updateBenefit,
    setGroupCoverageScope,
    blurGroupCopayValue,
  } = ctx

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader
          icon={TreeStructure}
          title="Benefit Groups"
          description="Organise benefits into logical groups with budget controls"
        />
        <Button onClick={addGroup} size="sm" className="flex h-8 items-center gap-2 rounded-full px-4 text-label">
          <Plus size={14} weight="bold" />
          Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
          <TreeStructure size={36} weight="duotone" className="mb-3 text-faint" />
          <p className="text-body font-medium text-muted-foreground">No benefit groups yet.</p>
          <Button variant="ghost" onClick={addGroup} className="mt-2 text-body font-semibold text-primary">
            Create your first group
          </Button>
          {validationErrors.groups && <ErrorText>{validationErrors.groups}</ErrorText>}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group, groupIndex) => {
            const groupBenefits = benefits.filter((benefit) => benefit.groupId === group.id)
            const groupError = validationErrors[`group_${groupIndex}`]

            return (
              <div
                key={group.id}
                id={`group-${group.id}`}
                className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TreeStructure size={18} weight="duotone" />
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                        value={group.name}
                        onChange={(event) => updateGroup(group.id, "name", event.target.value)}
                        placeholder="Group Name"
                      />
                      {validationErrors[`group_name_${group.id}`] && (
                        <ErrorText>{validationErrors[`group_name_${group.id}`]}</ErrorText>
                      )}
                      <input
                        className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-label text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10"
                        value={group.description || ""}
                        onChange={(event) => updateGroup(group.id, "description", event.target.value)}
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-destructive"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <div className="space-y-5 p-4">
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
                    <p className="text-micro text-faint">Controls which caps and service fields appear for this group.</p>
                  </div>

                  <PolicyGroupCoverageColumns
                    blurGroupCopayValue={blurGroupCopayValue}
                    group={group}
                    groupErrors={validationErrors}
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
                    policyData={policyData}
                    updateGroup={updateGroup}
                  />

                  <div className="space-y-3 border-t border-border/60 pt-2">
                    <Collapsible defaultOpen={groupIndex === 0}>
                      <CollapsibleTrigger className="group flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-label font-semibold text-foreground">Services</p>
                          {groupBenefits.length > 0 && (
                            <span className="rounded bg-primary/10 px-1.5 text-micro font-medium text-primary">
                              {groupBenefits.length}
                            </span>
                          )}
                          {groupError && <ErrorText>{groupError}</ErrorText>}
                        </div>
                        <CaretDown
                          size={13}
                          weight="bold"
                          className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <PolicyGroupServicesSection
                          coverageScope={group.coverageScope ?? "Employee"}
                          groupBenefits={groupBenefits}
                          groupErrors={validationErrors}
                          groupId={group.id}
                          groupIndex={groupIndex}
                          isViewMode={false}
                          onToggleService={(serviceId) => toggleService(group.id, serviceId)}
                          onUpdateBenefit={updateBenefit}
                          policyData={policyData}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
