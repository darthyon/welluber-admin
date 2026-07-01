"use client"

import { useMemo, Suspense, useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PolicyWizardContent } from "@/components/host/policies/policy-wizard-content"
import {
  NEW_POLICY_ANCHOR_ITEMS,
  NewPolicyPageActionBar,
  NewPolicyPageHeader,
  NewPolicySidebar,
  NewPolicyUnsavedDialog,
  PolicyDraftResumeDialog,
  PolicySetupBanner,
  type NewPolicyDraftShape,
} from "@/components/host/policies/new-policy-page-sections"
import { usePolicyTemplates } from "@/hooks/use-policy-templates"
import { readPolicyDraft, clearPolicyDraft } from "@/hooks/use-policy-draft"
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data"

type DraftShape = NewPolicyDraftShape

function NewPolicyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { templates: policyTemplates, isLoading: templatesLoading } = usePolicyTemplates()
  const source = searchParams.get("source") ?? (searchParams.get("orgId") ? "org" : "global")
  const templateId = searchParams.get("template")
  const cloneId = searchParams.get("clone")
  const paramOrgId = searchParams.get("orgId")
  const backHref =
    source === "org" && paramOrgId
      ? `/organizations/${paramOrgId}?tab=policies`
      : "/policies"

  const [sectionErrors, setSectionErrors] = useState<Record<string, number>>({})
  const [resumePromptOpen, setResumePromptOpen] = useState(false)
  const [resumeDecided, setResumeDecided] = useState(false)
  const [resumedDraft, setResumedDraft] = useState<DraftShape | null>(null)
  const [pendingDraftMeta, setPendingDraftMeta] = useState<{ savedAt?: string; data: DraftShape } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [targeting, setTargeting] = useState<{ organizationId?: string; employmentTypes: string[]; tierIds: string[]; departmentIds: string[] }>({ employmentTypes: [], tierIds: [], departmentIds: [] })
  const [issues, setIssues] = useState<Array<{ key: string; label: string; target: string }>>([])
  const [saveState, setSaveState] = useState<{ status: "idle" | "saving" | "saved"; savedAt?: string }>({ status: "idle" })
  const [savedAgo, setSavedAgo] = useState("")
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const pendingLeaveRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!saveState.savedAt) return
    const savedAtIso = saveState.savedAt
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(savedAtIso).getTime()) / 1000)
      if (diff < 5) setSavedAgo("just now")
      else if (diff < 60) setSavedAgo(`${diff}s ago`)
      else setSavedAgo(`${Math.floor(diff / 60)}m ago`)
    }
    update()
    const timer = setInterval(update, 5000)
    return () => clearInterval(timer)
  }, [saveState.savedAt])

  const jumpToIssue = useCallback((target: string) => {
    if (typeof window === "undefined") return
    const element = document.getElementById(target)
    if (!element) return
    const top = element.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top, behavior: "smooth" })
  }, [])

  const guardedLeave = useCallback((target: () => void) => {
    if (!dirty || typeof window === "undefined") {
      target()
      return
    }
    pendingLeaveRef.current = () => {
      clearPolicyDraft(paramOrgId ?? undefined)
      target()
    }
    setUnsavedDialogOpen(true)
  }, [dirty, paramOrgId])

  const handleConfirmLeave = useCallback(() => {
    setUnsavedDialogOpen(false)
    pendingLeaveRef.current?.()
    pendingLeaveRef.current = null
  }, [])

  const handleCancelLeave = useCallback(() => {
    setUnsavedDialogOpen(false)
    pendingLeaveRef.current = null
  }, [])

  const anchorItemsWithErrors = useMemo(() => NEW_POLICY_ANCHOR_ITEMS.map((item) => ({ ...item, errorCount: sectionErrors[item.id] ?? 0 })), [sectionErrors])

  useEffect(() => {
    if (resumeDecided) return
    if (templateId || cloneId) {
      setTimeout(() => setResumeDecided(true), 0)
      return
    }
    const sessionDraft = typeof window !== "undefined" ? sessionStorage.getItem("policy-draft") : null
    if (sessionDraft) {
      setTimeout(() => setResumeDecided(true), 0)
      return
    }
    const draft = readPolicyDraft<DraftShape>(paramOrgId ?? undefined)
    if (draft) {
      setTimeout(() => {
        setPendingDraftMeta({ savedAt: draft.savedAt, data: draft.data })
        setResumePromptOpen(true)
      }, 0)
    } else {
      setTimeout(() => setResumeDecided(true), 0)
    }
  }, [cloneId, paramOrgId, resumeDecided, templateId])

  const handleResume = useCallback(() => {
    if (pendingDraftMeta) setResumedDraft(pendingDraftMeta.data)
    setResumePromptOpen(false)
    setResumeDecided(true)
  }, [pendingDraftMeta])

  const handleDiscardDraft = useCallback(() => {
    clearPolicyDraft(paramOrgId ?? undefined)
    setPendingDraftMeta(null)
    setResumePromptOpen(false)
    setResumeDecided(true)
  }, [paramOrgId])

  const selectedTemplate = policyTemplates.find((template) => template.id === templateId)
  const cloneSource = MOCK_POLICIES.find((policy) => policy.id === cloneId) ?? null

  const initialData = useMemo(() => {
    if (resumedDraft) {
      const policy = paramOrgId && resumedDraft.policy.organizationId !== paramOrgId ? { ...resumedDraft.policy, organizationId: paramOrgId } : resumedDraft.policy
      return { ...resumedDraft, policy }
    }

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("policy-draft")
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }
          if (paramOrgId && parsed.policy.organizationId !== paramOrgId) parsed.policy = { ...parsed.policy, organizationId: paramOrgId }
          return parsed
        } catch {
          // ignore malformed session draft
        }
      }
    }

    if (paramOrgId && !cloneSource && !selectedTemplate) {
      return {
        policy: {
          organizationId: paramOrgId,
          name: "",
          description: "",
          eligibleEmploymentTypes: ["full-time"],
          benefitPoolType: "Individual" as const,
          utilisationMode: "Fixed" as const,
          refreshCycle: "Yearly" as const,
          refreshStartReference: "financial_year" as const,
          status: "draft" as const,
        },
        groups: [],
        benefits: [],
      }
    }

    if (cloneSource) {
      const sourceData = MOCK_POLICY_DATA_MAP[cloneSource.id]
      if (!sourceData) return undefined
      const idMap = new Map<string, string>()
      const groups: BenefitGroup[] = sourceData.groups.map((group) => {
        const newId = `${group.id}-new`
        idMap.set(group.id, newId)
        return { ...group, id: newId, policyId: "temp" }
      })
      const benefits: Benefit[] = sourceData.benefits.map((benefit) => ({ ...benefit, id: `${benefit.id}-new`, groupId: idMap.get(benefit.groupId) || benefit.groupId }))
      return {
        policy: { ...cloneSource, id: undefined, name: "", status: "draft" as const, clonedFrom: cloneSource.id, ...(paramOrgId ? { organizationId: paramOrgId } : {}) },
        groups,
        benefits,
      }
    }

    if (!selectedTemplate) return undefined
    const prefill = selectedTemplate.prefill
    const idMap = new Map<string, string>()
    const groups: BenefitGroup[] = prefill.groups.map((group) => {
      const newId = `${group.id}-new`
      idMap.set(group.id, newId)
      return { ...group, id: newId, policyId: "temp" }
    })
    const benefits: Benefit[] = prefill.benefits.map((benefit) => ({ ...benefit, id: `${benefit.id}-new`, groupId: idMap.get(benefit.groupId) || benefit.groupId }))
    return {
      policy: {
        name: prefill.name || "",
        description: prefill.description || "",
        eligibleEmploymentTypes: [...prefill.eligibleEmploymentTypes],
        dependentCoverages: prefill.dependentCoverages ? [...prefill.dependentCoverages] : [],
        benefitPoolType: prefill.benefitPoolType,
        utilisationMode: prefill.utilisationMode,
        refreshCycle: prefill.refreshCycle,
        refreshStartReference: prefill.refreshStartReference,
        templateId: selectedTemplate.id,
        status: "draft" as const,
        ...(paramOrgId ? { organizationId: paramOrgId } : {}),
      },
      groups,
      benefits,
    }
  }, [cloneSource, paramOrgId, resumedDraft, selectedTemplate])

  const handleReview = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-draft", JSON.stringify(data))
      if (paramOrgId) sessionStorage.setItem("policy-org-context", paramOrgId)
      else sessionStorage.removeItem("policy-org-context")
    }
    const nextParams = new URLSearchParams()
    nextParams.set("source", source)
    if (paramOrgId) nextParams.set("orgId", paramOrgId)
    router.push(`/policies/new/review?${nextParams.toString()}`)
  }

  if (templateId && templatesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading template...</span>
      </div>
    )
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <NewPolicySidebar anchorItemsWithErrors={anchorItemsWithErrors} issues={issues} jumpToIssue={jumpToIssue} targeting={targeting} />

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            <NewPolicyPageHeader
              onBack={() => guardedLeave(() => router.push(backHref))}
              paramOrgId={paramOrgId}
              saveState={saveState}
              savedAgo={savedAgo}
            />

            <PolicySetupBanner
              cloneSource={cloneSource ? { name: cloneSource.name } : null}
              selectedTemplate={selectedTemplate ? { icon: selectedTemplate.icon, name: selectedTemplate.name } : undefined}
              onChange={() => router.push("/policies")}
            />

            {resumeDecided ? (
              <PolicyWizardContent
                mode="create"
                initialData={initialData}
                onReview={handleReview}
                onSubmit={handleReview}
                lockedOrganizationId={paramOrgId ?? undefined}
                onValidationChange={setSectionErrors}
                onDirtyChange={setDirty}
                onTargetingChange={setTargeting}
                onIssuesChange={setIssues}
                onSaveStatusChange={setSaveState}
              />
            ) : null}

            <NewPolicyPageActionBar
              onCancel={() => guardedLeave(() => router.push(backHref))}
              onReview={() => undefined}
            />
          </div>
        </div>
      </div>

      <PolicyDraftResumeDialog open={resumePromptOpen} onDiscard={handleDiscardDraft} onResume={handleResume} pendingDraftMeta={pendingDraftMeta} />
      <NewPolicyUnsavedDialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen} onConfirm={handleConfirmLeave} onCancel={handleCancelLeave} />
    </div>
  )
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={<div data-test="fallback">FALLBACK</div>}>
      <NewPolicyForm />
    </Suspense>
  )
}
