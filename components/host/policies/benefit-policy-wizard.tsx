"use client"

import {
  ShieldCheck,
  CaretLeft,
  CaretRight,
  Receipt,
  NotePencil,
  Check,
  Warning,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { PolicyLaunchConfirmModal } from "@/components/host/policies/policy-launch-confirm-modal"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { type BenefitPolicy, type BenefitGroup, type Benefit, type PolicyStatus } from "@/types/policy"
import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"
import { useBenefitPolicyWizard } from "@/hooks/use-benefit-policy-wizard"
import { CONTENT_TABS, CREATE_STEPS } from "./wizard-constants"
import { STATUS_CONFIG, StatusPicker } from "./wizard-shared-ui"
import { BasicsStep } from "./wizard-steps/basics-step"
import { PoolStep } from "./wizard-steps/pool-step"
import { GroupsStep } from "./wizard-steps/groups-step"
import { AssignStep } from "./wizard-steps/assign-step"
import { ReviewStep } from "./wizard-steps/review-step"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BenefitPolicyWizardProps {
  onCancel: () => void
  onSuccess: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
    assignedEmployeeIds?: string[]
  }) => void
  onSaveDraft?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onEdit?: () => void
  mode?: "create" | "edit" | "view"
  orgId?: string
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BenefitPolicyWizard({
  onCancel,
  onSuccess,
  onSaveDraft,
  onEdit,
  mode = "create",
  orgId,
  initialData,
}: BenefitPolicyWizardProps) {
  const isViewMode = mode === "view"

  const wiz = useBenefitPolicyWizard({ mode, orgId, initialData, onSuccess, onSaveDraft })

  // Build ctx object for step components
  const ctx = {
    policyData: wiz.policyData,
    setPolicyData: wiz.setPolicyData,
    groups: wiz.groups,
    benefits: wiz.benefits,
    validationErrors: wiz.validationErrors,
    depModalGroupId: wiz.depModalGroupId,
    setDepModalGroupId: wiz.setDepModalGroupId,
    assignedEmployeeIds: wiz.assignedEmployeeIds,
    setAssignedEmployeeIds: wiz.setAssignedEmployeeIds,
    assignmentOrgId: wiz.assignmentOrgId,
    setAssignmentOrgId: wiz.setAssignmentOrgId,
    showCustomizeAssignment: wiz.showCustomizeAssignment,
    setShowCustomizeAssignment: wiz.setShowCustomizeAssignment,
    groupIdRef: wiz.groupIdRef,
    benefitIdRef: wiz.benefitIdRef,
    isViewMode,
    orgId,
    toggleEmploymentType: wiz.toggleEmploymentType,
    addGroup: wiz.addGroup,
    removeGroup: wiz.removeGroup,
    updateGroup: wiz.updateGroup,
    updateGroupCoPayment: wiz.updateGroupCoPayment,
    updateDependentCoPayment: wiz.updateDependentCoPayment,
    toggleService: wiz.toggleService,
    updateBenefit: wiz.updateBenefit,
    setGroupCoverageScope: wiz.setGroupCoverageScope,
    nextStep: wiz.nextStep,
  } as const

  // ── Success screen ──────────────────────────────────────────────────────────
  if (wiz.isSuccess) {
    return (
      <div className="py-12">
        <SuccessCelebration
          title={mode === "edit" ? "Policy Updated!" : "Benefit Policy Created!"}
          message="The policy details have been saved and applied."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Sticky header + nav */}
      <div className="sticky top-0 z-10 border-none bg-background/80 px-6 shadow-none backdrop-blur-md transition-all">
        {/* Title + actions row */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 shadow-none transition-all hover:bg-muted/50"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <h2 className="text-heading font-semibold text-balance text-foreground">
              {isViewMode
                ? "View Benefit Policy"
                : mode === "edit"
                  ? "Edit Benefit Policy"
                  : "Add Benefit Policy"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isViewMode ? (
              onEdit && (
                <Button
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-none"
                >
                  <NotePencil size={16} weight="bold" />
                  Edit Policy
                </Button>
              )
            ) : (
              <>
                <button
                  onClick={wiz.handleSaveDraft}
                  className="rounded-full px-4 py-2 text-body font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Save as Draft
                </button>
                {mode === "create" && wiz.currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={wiz.prevStep}
                    className="rounded-full px-6"
                  >
                    Back
                  </Button>
                )}
                {mode === "create" && wiz.currentStep < 5 ? (
                  <Button
                    onClick={() => void wiz.nextStep()}
                    className="rounded-full bg-primary px-8 text-primary-foreground shadow-none"
                  >
                    Next Step
                    <CaretRight size={16} weight="bold" className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={mode === "create" ? wiz.handleLaunchClick : () => void wiz.handleSubmit()}
                    disabled={wiz.isSubmitting}
                    className="min-w-[140px] rounded-full bg-primary px-8 text-primary-foreground shadow-none"
                  >
                    {wiz.isSubmitting
                      ? "Finalizing..."
                      : mode === "edit"
                        ? "Save Changes"
                        : "Launch Policy"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active policy edit banner */}
        {mode === "edit" && wiz.policyData.status === "active" && wiz.policyData.organizationId && (
          <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <Warning size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-label font-medium text-amber-700 dark:text-amber-300">
              Changes apply to future assignments only. Existing employee assignments are unaffected.
            </p>
          </div>
        )}

        {/* Underline tabs — view & edit */}
        {(isViewMode || mode === "edit") && (
          <div className="flex">
            {CONTENT_TABS.filter((t) => !("viewOnly" in t) || isViewMode).map((tab) => (
              <button
                key={tab.id}
                onClick={() => wiz.goToStep(tab.id)}
                className={cn(
                  "-mb-px border-b-2 px-5 py-3 text-body font-semibold transition-all",
                  wiz.currentStep === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Numbered stepper — create only */}
        {mode === "create" && (
          <div className="flex items-center gap-2 pb-5">
            {CREATE_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => wiz.goToStep(step.id)}
                className={cn(
                  "group flex shrink-0 cursor-pointer items-center gap-2 transition-all",
                  wiz.currentStep === step.id ? "opacity-100" : "opacity-40 hover:opacity-100"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-label font-semibold shadow-sm transition-all",
                    wiz.currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/50"
                  )}
                >
                  {wiz.currentStep > step.id ? (
                    <Check size={14} weight="bold" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-body font-semibold whitespace-nowrap transition-colors",
                    wiz.currentStep === step.id
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {step.title}
                </span>
                {idx < CREATE_STEPS.length - 1 && (
                  <div className="mx-1 h-[2px] w-8 rounded-full bg-muted" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 pt-8 pb-12">
        {mode === "create" && wiz.hasDraft && !wiz.draftRestored && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="text-label font-medium text-amber-700 dark:text-amber-300">
              Draft available
              {wiz.draftSavedAt
                ? ` · saved ${new Date(wiz.draftSavedAt).toLocaleString()}`
                : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={wiz.clearDraft} className="rounded-4xl px-4">
                Discard
              </Button>
              <Button size="sm" onClick={wiz.handleRestoreDraft} className="rounded-4xl px-4">
                Resume
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={wiz.currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {wiz.currentStep === 1 && (
              <>
                <BasicsStep ctx={ctx} mode={mode} />
                {(isViewMode || mode === "edit") && (
                  <div className="mt-10 border-t border-border pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-body font-medium text-foreground">Policy Status</h4>
                        <p className="mt-0.5 text-label text-faint">
                          Control the visibility and lifecycle state of this policy.
                        </p>
                      </div>
                      <StatusPicker
                        value={(wiz.policyData.status as PolicyStatus) || "draft"}
                        onChange={(s) => wiz.setPolicyData({ ...wiz.policyData, status: s })}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {wiz.currentStep === 2 && <PoolStep ctx={ctx} />}
            {wiz.currentStep === 3 && <GroupsStep ctx={ctx} />}
            {wiz.currentStep === 4 && mode === "create" && <AssignStep ctx={ctx} />}
            {wiz.currentStep === 5 && mode === "create" && <ReviewStep ctx={ctx} />}
            {wiz.currentStep === 4 && isViewMode && (
              <DetailSection
                title="Claims Usage"
                icon={<Receipt size={18} weight="duotone" />}
                description="Benefit usage and claim history for all employees on this policy"
                ghost
              >
                <UtilisationClaimsTable data={MOCK_EMPLOYEE_UTILISATION} />
              </DetailSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Launch confirm modal */}
      {wiz.showLaunchConfirmModal && (
        <PolicyLaunchConfirmModal
          policy={wiz.policyData}
          assignedEmployeeIds={wiz.assignedEmployeeIds}
          groups={wiz.groups}
          benefits={wiz.benefits}
          onConfirm={() => {
            wiz.setShowLaunchConfirmModal(false)
            void wiz.handleSubmit()
          }}
          onCancel={() => wiz.setShowLaunchConfirmModal(false)}
        />
      )}

      {/* Post-creation activation modal */}
      <AnimatePresence>
        {wiz.showPostCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-muted-foreground/40 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl"
            >
              <div className="p-8 pb-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
                    <ShieldCheck size={20} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-foreground">Policy Created</h3>
                    <p className="text-label text-muted-foreground">{wiz.policyData.name}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label font-medium",
                      STATUS_CONFIG.draft.bg,
                      STATUS_CONFIG.draft.color
                    )}
                  >
                    <NotePencil size={12} weight="fill" />
                    Draft
                  </span>
                  <span className="text-label text-faint">
                    {wiz.groups.length} group{wiz.groups.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-8 pb-2">
                <Button
                  onClick={() => void wiz.handleActivateFromModal()}
                  className="h-12 w-full rounded-lg font-semibold shadow-lg shadow-primary/20"
                >
                  Activate policy →
                </Button>
                <Button
                  variant="ghost"
                  onClick={wiz.handleViewFromModal}
                  className="h-11 w-full rounded-lg font-semibold hover:bg-muted"
                >
                  View policy
                </Button>
                <button
                  onClick={wiz.handleViewFromModal}
                  className="w-full py-2 text-center text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Skip — let org admin handle tiers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
