"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  useTabPersistence,
  useQueryState,
  useUpdateQueryParams,
} from "@/hooks/use-tab-persistence"
import { PencilSimpleLine, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { BranchSheet } from "@/components/host/organizations/branch-sheet"
import { InviteAdminModal } from "@/components/host/organizations/invite-admin-modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { VoucherDetailSheet } from "@/components/shared/voucher-detail-sheet"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PostAssignPolicyModal } from "@/components/host/organizations/post-assign-policy-modal"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { TabErrorState } from "@/components/shared/tab-error-state"
import { ProfileTab } from "@/components/host/organizations/tabs/profile-tab"
import { BranchesTab } from "@/components/host/organizations/tabs/branches-tab"
import { EmployeesTab } from "@/components/host/organizations/tabs/employees-tab"
import { PoliciesTab } from "@/components/host/organizations/tabs/policies-tab"
import { ClaimsTab } from "@/components/host/organizations/tabs/claims-tab"
import { VouchersTab } from "@/components/host/organizations/tabs/vouchers-tab"
import { SettingsTab } from "@/components/host/organizations/tabs/settings-tab"
import { TABS, OTHER_ORGS, type TabId, type AssignedPolicy } from "@/components/host/organizations/constants"
import { MOCK_ORGS, ACME_POLICIES } from "@/lib/mock-data"
import type { FlatClaimRow } from "@/types/claims"
import type { OrganizationStatus } from "@/features/organizations/types"

// Shared base fields (id/name/code/version/status/assignedTo/employeeCount/lastUpdated)
// come from the centralised Acme seed so host + org portal never drift.
// Host-only benefit-policy detail stays here.
const INITIAL_POLICIES: AssignedPolicy[] = [
  {
    ...ACME_POLICIES[0],
    organizationId: "org-123",
    description: "Standard wellness benefits for HQ staff including gym and mental health support.",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [],
    benefitPoolType: "Individual" as const,
    utilisationMode: "Fixed" as const,
    refreshCycle: "Yearly" as const,
    refreshStartReference: "financial_year" as const,
    categories: ["Physical Wellbeing", "Psychological Wellbeing"],
    groups: ["Gym Access", "Mental Support"],
  },
  {
    ...ACME_POLICIES[1],
    organizationId: "org-123",
    description: "Flexible lifestyle benefits for travel, food, and personal development.",
    eligibleEmploymentTypes: ["full-time", "part-time"],
    dependentCoverages: [],
    benefitPoolType: "Shared" as const,
    utilisationMode: "Prorated" as const,
    refreshCycle: "Monthly" as const,
    refreshStartReference: "financial_year" as const,
    categories: ["Nutritional Support", "Personal Care"],
    groups: ["Flexi-Benefits"],
  },
]

function OrganizationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [activeTab, setActiveTab] = useTabPersistence<TabId>("profile")
  const [isInviteModalOpen, setIsInviteModalOpen] = useQueryState("inviteAdmin")
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useQueryState("branchSheet")
  const [selectedBranchName] = useQueryState("branchName")
  const [isBulkUploading, setIsBulkUploading] = useQueryState("bulkUpload")
  const updateQueryParams = useUpdateQueryParams()

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [orgStatus, setOrgStatus] = useState<OrganizationStatus>("active")
  const [assignedPolicies, setAssignedPolicies] = useState<AssignedPolicy[]>(INITIAL_POLICIES)
  const [showPostAssignModal, setShowPostAssignModal] = useState(false)
  const [lastAssignedPolicyName, setLastAssignedPolicyName] = useState("")
  const [selectedVoucherClaim, setSelectedVoucherClaim] = useState<FlatClaimRow | null>(null)

  const mockOrg = MOCK_ORGS.find((o) => o.id === orgId)
  const orgName = mockOrg?.name ?? orgId
  const orgTierConfigs = mockOrg?.tierConfigs ?? []

  const orgForSetup = {
    ...(mockOrg ?? {}),
    id: orgId,
    policies: assignedPolicies.map((p) => p.name),
  } as import("@/features/organizations/types").Organization

  const handleAssignPolicy = (policyId: string) => {
    const policyNames: Record<string, string> = {
      "POL-20260115-0001": "Acme Employee Wellness Policy FY2026",
      "POL-20260115-0002": "Acme Leadership Benefits Policy FY2026",
      "POL-20260115-0003": "Global Tech Core Benefits Policy FY2026",
    }
    const newPolicy: AssignedPolicy = {
      id: policyId,
      organizationId: "org-123",
      name: policyNames[policyId] || "Selected Policy",
      code: `WP-${policyId.split("_")[1]?.toUpperCase() ?? "NEW"}-2026`,
      description: "Automatically assigned benefit policy.",
      eligibleEmploymentTypes: ["full-time"],
      dependentCoverages: [],
      benefitPoolType: "Individual" as const,
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "financial_year" as const,
      status: "active" as const,
      assignedTo: "All Branches",
      employeeCount: 0,
      lastUpdated: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }
    setAssignedPolicies((prev) => [...prev, newPolicy])
    setToastMessage("Policy assigned successfully")
    setLastAssignedPolicyName(newPolicy.name)
    setShowPostAssignModal(true)
  }

  const handleUnassignPolicy = (id: string) => {
    setAssignedPolicies((prev) => prev.filter((p) => p.id !== id))
    setToastMessage("Policy unassigned from organisation")
  }

  return (
    <div className="pb-12">
      <PostAssignPolicyModal
        isOpen={showPostAssignModal}
        policyName={lastAssignedPolicyName}
        onAutoMatch={() => {
          setShowPostAssignModal(false)
          setActiveTab("employees")
          setIsBulkUploading("true")
          setToastMessage("Opened employee import with policy auto-match suggestion")
        }}
        onManual={() => {
          setShowPostAssignModal(false)
          setActiveTab("employees")
          setToastMessage("Open Employees to assign this policy manually")
        }}
        onLater={() => setShowPostAssignModal(false)}
      />

      <BranchSheet
        isOpen={isBranchSheetOpen === "true"}
        onClose={() => setIsBranchSheetOpen(null)}
        branchName={selectedBranchName || undefined}
      />

      <InviteAdminModal
        isOpen={isInviteModalOpen === "true"}
        onClose={() => setIsInviteModalOpen(null)}
        targetId={orgId}
      />

      {/* Header Banner */}
      <div className="relative z-30 -mx-6 -mt-6 bg-card px-6 pt-6">
        <div className="py-6 lg:px-2">
          <Breadcrumbs
            items={[
              { label: "Organisations", href: "/organizations" },
              {
                label: orgName,
                options: OTHER_ORGS.filter((o) => o.label !== orgName),
              },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-5">
              <EntityAvatar name={orgName} size="xl" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="tracking-tight text-display font-semibold text-foreground">
                    {orgName}
                  </h1>
                  <StatusBadge
                    status={orgStatus}
                    variant={
                      orgStatus === "active"
                        ? "emerald"
                        : orgStatus === "suspended"
                          ? "rose"
                          : "zinc"
                    }
                  />
                </div>
                <div className="flex items-center gap-3 text-body text-subtle">
                  <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
                    ORG-20260115-0001
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="rounded-full text-body font-medium transition-all"
              >
                <Link href={`/organizations/${orgId}/edit`}>
                  <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
                  Edit Organisation
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-6 border-b border-border">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    updateQueryParams({
                      tab: tab.id === "profile" ? null : tab.id,
                      branchId: null,
                      branchName: null,
                      employeeId: null,
                      bulkUpload: null,
                      assignPolicy: null,
                      addPolicy: null,
                      viewingPolicyId: null,
                      editingPolicyId: null,
                      inviteAdmin: null,
                      branchSheet: null,
                      branchSearch: null,
                      employeeSearch: null,
                      policySearch: null,
                      policyStatus: null,
                    })
                  }}
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

      {/* Tab Content */}
      <div className="p-6 lg:p-8">
        {activeTab === "profile" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <ProfileTab
              orgId={orgId}
              orgStatus={orgStatus}
              orgTierConfigs={orgTierConfigs}
              assignedPolicies={assignedPolicies}
              orgForSetup={orgForSetup}
              mockOrg={mockOrg}
            />
          </ErrorBoundary>
        )}
        {activeTab === "branches" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <BranchesTab orgId={orgId} />
          </ErrorBoundary>
        )}
        {activeTab === "employees" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <EmployeesTab
              orgId={orgId}
              orgTierConfigs={orgTierConfigs}
              assignedPolicies={assignedPolicies}
              isBulkUploading={isBulkUploading}
              onBulkUploadChange={setIsBulkUploading}
            />
          </ErrorBoundary>
        )}
        {activeTab === "policies" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <PoliciesTab
              orgId={orgId}
              assignedPolicies={assignedPolicies}
              onAssign={handleAssignPolicy}
              onUnassign={handleUnassignPolicy}
              onToast={setToastMessage}
            />
          </ErrorBoundary>
        )}
        {activeTab === "claims" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <ClaimsTab orgId={orgId} onViewVoucher={setSelectedVoucherClaim} />
          </ErrorBoundary>
        )}
        {activeTab === "vouchers" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <VouchersTab orgId={orgId} />
          </ErrorBoundary>
        )}
        {activeTab === "settings" && (
          <ErrorBoundary fallback={<TabErrorState />}>
            <SettingsTab
              orgId={orgId}
              mockOrg={mockOrg}
              onInviteAdmin={() => setIsInviteModalOpen("true")}
              onNavigateToBranch={(branchId) => {
                setActiveTab("branches")
                router.push(`?tab=branches&branchId=${branchId}`)
              }}
              onStatusChange={setOrgStatus}
              onToast={setToastMessage}
            />
          </ErrorBoundary>
        )}
      </div>

      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center rounded-lg bg-foreground px-5 py-3 text-primary-foreground shadow-lg fade-in slide-in-from-bottom-4">
          <p className="text-body font-semibold">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-faint transition-colors hover:text-primary-foreground"
          >
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      )}

      <VoucherDetailSheet
        claim={selectedVoucherClaim}
        onClose={() => setSelectedVoucherClaim(null)}
      />
    </div>
  )
}

export default function OrganizationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] animate-pulse items-center justify-center text-muted-foreground">
          Loading organization details...
        </div>
      }
    >
      <OrganizationDetailContent />
    </Suspense>
  )
}
