"use client"

import { useState, useMemo, Suspense, type ComponentProps } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  useTabPersistence,
  useQueryState,
  useUpdateQueryParams,
} from "@/hooks/use-tab-persistence"
import {
  Buildings,
  Users,
  Shield,
  Gear,
  Bank,
  Plus,
  PencilSimpleLine,
  Upload,
  Article,
  IdentificationCard,
  Scroll,
  SealCheck,
  MapPin,
  Ticket,
  Rows,
  Info
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { BranchSheet } from "@/components/host/organizations/branch-sheet"
import { InviteAdminModal } from "@/components/host/organizations/invite-admin-modal"
import { Button } from "@/components/ui/button"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import {
  VerticalTabs,
} from "@/components/shared/vertical-tabs"
import { BranchCard } from "@/components/host/organizations/branch-card"
import { BranchDetailView } from "@/components/host/organizations/branch-detail-view"

import { EmployeeCard } from "@/components/host/organizations/employee-card"
import { DependentCard } from "@/components/host/organizations/dependent-card"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { OrganizationClaimsTable } from "@/components/shared/organization-claims-table"
import { VouchersTable } from "@/components/shared/vouchers-table"
import { VoucherDetailSheet } from "@/components/shared/voucher-detail-sheet"

import { BulkUploadWizard } from "@/components/host/organizations/bulk-upload-wizard"
import { AssignedPolicyList } from "@/components/host/organizations/assigned-policy-list"
import { OrgSetupGuide } from "@/components/host/organizations/org-setup-guide"
import { OrgSetupChecklist } from "@/components/host/organizations/org-setup-checklist"
import { OrgStructureConfig } from "@/components/host/organizations/org-structure-config"
import { AssignPolicyModal } from "@/components/host/organizations/assign-policy-modal"
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard"
import { PolicyDetailView } from "@/components/host/policies/policy-detail-view"
import { PolicyCreationLauncher } from "@/components/host/policies/policy-creation-launcher"
import { BenefitPolicy, Benefit } from "@/types/policy"
import type { FlatClaimRow } from "@/types/claims"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ActionPopover } from "@/components/shared/action-popover"
import { SharedDataTable } from "@/components/shared/data-table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  deactivateOrganization,
  suspendOrganization,
} from "@/features/organizations/actions"
import { OrganizationStatus } from "@/features/organizations/types"
import { MOCK_ORGS, MOCK_DEPENDENTS, MOCK_ENTITLEMENTS, MOCK_EMPLOYEE_UTILISATION, MOCK_EMPLOYEES } from "@/lib/mock-data"
import { EntityAvatar } from "@/components/shared/entity-avatar"

const ORG_TYPE_LABELS: Record<string, string> = {
  sole_proprietorship: "Sole Proprietorship",
  partnership: "Partnership",
  sdn_bhd: "Private Limited (Sdn. Bhd.)",
  llp: "Limited Liability Partnership (LLP)",
  bhd: "Public Limited (Bhd.)",
  clbg: "Company Limited by Guarantee (CLBG)",
}

const TABS = [
  { id: "profile", label: "Org Details", icon: Buildings },
  { id: "branches", label: "Branches", icon: Buildings },
  { id: "employees", label: "Employees", icon: Users },
  { id: "policies", label: "Benefit Policy", icon: Shield },
  { id: "claims", label: "Claims", icon: SealCheck },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "settings", label: "Settings", icon: Gear },
] as const

type TabId = (typeof TABS)[number]["id"]

function PostAssignPolicyModal({
  isOpen,
  policyName,
  onAutoMatch,
  onManual,
  onLater,
}: {
  isOpen: boolean
  policyName: string
  onAutoMatch: () => void
  onManual: () => void
  onLater: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-[24px] border border-border bg-card shadow-2xl">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground">Policy Assigned</h3>
          <p className="mt-1 text-body text-subtle">
            <span className="font-medium text-foreground">{policyName}</span> is now assigned to this organisation.
          </p>
          <p className="mt-2 text-label text-muted-foreground">Do you want to assign it to employees now?</p>
        </div>

        <div className="space-y-2 px-8 pb-2">
          <Button className="h-11 w-full rounded-4xl" onClick={onAutoMatch}>
            Assign to Employees (Tier Auto-Match)
          </Button>
          <Button variant="outline" className="h-11 w-full rounded-4xl" onClick={onManual}>
            Assign to Employees Manually
          </Button>
          <Button variant="ghost" className="h-11 w-full rounded-4xl" onClick={onLater}>
            Later
          </Button>
        </div>

        <div className="border-t border-border bg-muted/30 p-8 pt-4">
          <p className="text-micro text-faint">You can manage employee assignment from Employees or Benefit Policy tabs anytime.</p>
        </div>
      </div>
    </div>
  )
}

// Mock Data for Breadcrumb Dropdowns
const OTHER_ORGS = [
  { label: "Acme Corporation Sdn Bhd", href: "/organizations/ORG-20260115-0001" },
  { label: "Global Tech Solutions", href: "/organizations/ORG-20260301-0002" },
  { label: "Nexus Innovations", href: "/organizations/ORG-20260310-0003" },
]

function OrganizationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [activeTab, setActiveTab] = useTabPersistence<TabId>("profile")
  const [isInviteModalOpen, setIsInviteModalOpen] = useQueryState("inviteAdmin")
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useQueryState("branchSheet")
  const [selectedBranchName] =
    useQueryState("branchName")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [orgStatus, setOrgStatus] = useState<OrganizationStatus>("active")
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false)
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false)
  const [dangerAction, setDangerAction] = useState<
    "deactivate" | "suspend" | null
  >(null)

  // Voucher detail sheet state
  const [selectedVoucherClaim, setSelectedVoucherClaim] = useState<FlatClaimRow | null>(null)

  // View modes
  const [branchesView, setBranchesView] = useState<ViewMode>("list")
  const [employeesView, setEmployeesView] = useState<ViewMode>("list")
  const [dependentsView, setDependentsView] = useState<ViewMode>("list")
  const [] = useState<ViewMode>("list")

  // Search states
  const [branchSearch, setBranchSearch] = useQueryState("branchSearch", "")
  const [employeeSearch, setEmployeeSearch] = useQueryState(
    "employeeSearch",
    ""
  )
  const [policySearch, setPolicySearch] = useQueryState("policySearch", "")
  const [policyStatusFilter, setPolicyStatusFilter] = useQueryState(
    "policyStatus",
    "all"
  )

  // Sub-navigation state (Branches)
  const [viewBranchId, setViewBranchId] = useQueryState("branchId")

  // Sub-navigation state (Employees)
  const [] = useQueryState("employeeId")
  const [isBulkUploading, setIsBulkUploading] = useQueryState("bulkUpload")
  const [activeEmployeeSubTab, setActiveEmployeeSubTab] = useQueryState(
    "subTab",
    "directory"
  )

  // Sub-tab specific states
  const [dependentSearch, setDependentSearch] = useQueryState("depSearch", "")
  const [entitlementSearch, setEntitlementSearch] = useQueryState(
    "entSearch",
    ""
  )
  const [entitlementTypeFilter, setEntitlementTypeFilter] = useQueryState(
    "entType",
    "all"
  )
  const updateQueryParams = useUpdateQueryParams()

  // Policies state
  const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] =
    useQueryState("assignPolicy")
  const [isAddingPolicy, setIsAddingPolicy] = useQueryState("addPolicy")
  const [viewingPolicyId, setViewingPolicyId] = useQueryState("viewingPolicyId")
  const [editingPolicyId, setEditingPolicyId] = useQueryState("editingPolicyId")
  const [assignedPolicies, setAssignedPolicies] = useState<
    (BenefitPolicy & {
      assignedTo: string
      employeeCount: number
      lastUpdated: string
      categories?: string[]
      groups?: string[]
    })[]
  >([
    {
      id: "pol_1",
      organizationId: "org-123",
      name: "Acme Employee Wellness Policy FY2026",
      code: "BEN-STD-01",
      version: "V1.1",
      description:
        "Standard wellness benefits for HQ staff including gym and mental health support.",
      eligibleEmploymentTypes: ["full-time"],
      dependentCoverages: [],
      benefitPoolType: "Individual" as const,
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "financial_year" as const,
      status: "active" as const,
      assignedTo: "All Branches",
      employeeCount: 1240,
      lastUpdated: "24 Mar 2024",
      categories: ["Physical Wellbeing", "Psychological Wellbeing"],
      groups: ["Gym Access", "Mental Support"],
    },
    {
      id: "pol_2",
      organizationId: "org-123",
      name: "Acme Leadership Benefits Policy FY2026",
      code: "BEN-EXC-02",
      version: "V2.0",
      description:
        "Flexible lifestyle benefits for travel, food, and personal development.",
      eligibleEmploymentTypes: ["full-time", "part-time"],
      dependentCoverages: [],
      benefitPoolType: "Shared" as const,
      utilisationMode: "Prorated" as const,
      refreshCycle: "Monthly" as const,
      refreshStartReference: "financial_year" as const,
      status: "active" as const,
      assignedTo: "Subang Jaya",
      employeeCount: 450,
      lastUpdated: "02 Apr 2024",
      categories: ["Nutritional Support", "Personal Care"],
      groups: ["Flexi-Benefits"],
    },
  ])

  const [policyFilters, setPolicyFilters] = useState({
    department: "all",
    role: "all",
    mainService: "all",
    benefitGroup: "all",
  })
  const [showPostAssignModal, setShowPostAssignModal] = useState(false)
  const [lastAssignedPolicyName, setLastAssignedPolicyName] = useState("")

  const filteredPolicies = useMemo(() => {
    return assignedPolicies.filter((p) => {
      const searchLower = policySearch.toLowerCase()
      const matchesSearch =
        !policySearch ||
        p.name.toLowerCase().includes(searchLower) ||
        p.code?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)

      const matchesStatus =
        policyStatusFilter === "all" ||
        (policyStatusFilter === "active"
          ? p.status === "active"
          : p.status !== "active")

      const matchesService =
        policyFilters.mainService === "all" ||
        p.categories?.includes(policyFilters.mainService)

      const matchesGroup =
        policyFilters.benefitGroup === "all" ||
        p.groups?.includes(policyFilters.benefitGroup)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesService &&
        matchesGroup
      )
    })
  }, [assignedPolicies, policySearch, policyStatusFilter, policyFilters])

  const filteredDependents = useMemo(() => {
    if (!dependentSearch) return MOCK_DEPENDENTS
    const q = dependentSearch.toLowerCase()
    return MOCK_DEPENDENTS.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.employeeName?.toLowerCase().includes(q)
    )
  }, [dependentSearch])

  // Mock Groups and Benefits for the Detail Sheet
  const [mockGroups] = useState([
    {
      id: "g1",
      policyId: "pol_1",
      name: "Physical Wellbeing",
      description: "Standard physical health services",
      distributionType: "IndividualBenefitAmount" as const,
    },
    {
      id: "g2",
      policyId: "pol_1",
      name: "Mental Fitness",
      description: "Counseling and meditation support",
      distributionType: "IndividualBenefitAmount" as const,
    },
    {
      id: "g3",
      policyId: "pol_2",
      name: "Flexi-Benefits",
      description: "Shared budget for various lifestyle services",
      distributionType: "SharedAmount" as const,
      maxUsagePerCycle: 500,
    },
  ])
  const [mockBenefits] = useState<Benefit[]>([
    {
      id: "b1",
      groupId: "g1",
      serviceId: "s1",
      amount: 200,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: "b2",
      groupId: "g2",
      serviceId: "s4",
      amount: 150,
      coPayment: { required: true, type: "Percentage", value: 10 },
    },
    {
      id: "b3",
      groupId: "g3",
      serviceId: "s5",
      amount: 100,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: "b4",
      groupId: "g3",
      serviceId: "s6",
      amount: 100,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ])

  const handleAssignPolicy = (policyId: string) => {
    // Mock assignment logic
    const policyNames: Record<string, string> = {
      "POL-20260115-0001": "Acme Employee Wellness Policy FY2026",
      "POL-20260115-0002": "Acme Leadership Benefits Policy FY2026",
      "POL-20260115-0003": "Global Tech Core Benefits Policy FY2026",
    }

    const newPolicy = {
      id: policyId,
      organizationId: "org-123",
      name: policyNames[policyId] || "Selected Policy",
      code: `WP-${policyId.split("_")[1].toUpperCase()}-2026`,
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

    setAssignedPolicies([...assignedPolicies, newPolicy])
    setToastMessage("Policy assigned successfully")
    setLastAssignedPolicyName(newPolicy.name)
    setShowPostAssignModal(true)
  }

  const handleUnassignPolicy = (id: string) => {
    setAssignedPolicies(assignedPolicies.filter((p) => p.id !== id))
    setToastMessage("Policy unassigned from organisation")
  }

  const openDangerAction = (action: "deactivate" | "suspend") => {
    setDangerAction(action)
    setIsDangerModalOpen(true)
  }

  const dangerActionConfig = {
    deactivate: {
      title: "Deactivate Organisation",
      confirmLabel: "Deactivate Organisation",
      description:
        "Temporarily disable this organisation without removing its records.",
      impactPoints: [
        "Organisation admins will lose access until the account is reactivated.",
        "Employees and branches remain stored, but the workspace becomes read-only.",
        "New actions across the organisation will be paused.",
      ],
      run: () => deactivateOrganization(orgId),
    },
    suspend: {
      title: "Suspend Organisation",
      confirmLabel: "Suspend Organisation",
      description:
        "Suspend operations while keeping the organisation data available for recovery.",
      impactPoints: [
        "Admins can no longer manage employees, policies, or wallet activity.",
        "Active operations are paused until the suspension is lifted.",
        "Historical records remain available for audit and review.",
      ],
      run: () => suspendOrganization(orgId),
    },
  } as const

  const mockOrg = MOCK_ORGS.find((o) => o.id === orgId)
  const orgName = mockOrg?.name ?? orgId
  const orgTierConfigs = mockOrg?.tierConfigs ?? []

  const orgForSetup = {
    ...(mockOrg ?? {}),
    id: orgId,
    policies: assignedPolicies.map((p) => p.name),
  } as import("@/features/organizations/types").Organization

  const handleAddEmployee = () => {
    router.push(`/employees/new?org=${orgId}`)
  }

  return (
    <div className="pb-12">
      <AssignPolicyModal
        isOpen={isAssignPolicyModalOpen === "true"}
        onClose={() => setIsAssignPolicyModalOpen(null)}
        onAssign={handleAssignPolicy}
      />

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
      <div className="relative z-30 -mx-6 -mt-6 border-b border-border bg-card px-6 pt-6">
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
                  <h1 className="text-display font-semibold tracking-tight text-foreground">
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
                  <PencilSimpleLine
                    size={16}
                    weight="bold"
                    className="mr-1.5"
                  />
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
                      // Reset all sub-navigation and detail view parameters
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
                      // Optional: Reset Search states to clear view on tab change
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
                    className={cn(
                      "transition-colors",
                      isActive && "text-primary"
                    )}
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
          <div className="animate-in space-y-6 fade-in">
            <OrgSetupChecklist
              orgId={orgId}
              status={orgStatus}
              tierCount={orgTierConfigs.length}
              employeeCount={orgForSetup.employeeCount}
              policyCount={assignedPolicies.length}
              employeesWithoutPolicy={orgForSetup.employeesWithoutPolicy ?? 0}
            />
            {orgStatus !== "inactive" && <OrgSetupGuide organization={orgForSetup} />}
            {/* Organisation Profile */}
            <DetailSection
              title="Organisation Profile"
              icon={<Buildings size={18} weight="duotone" />}
              description="Basic information about the organisation"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Name" value="Acme Corporation Sdn Bhd" />
                <DetailField label="Industry" value="Technology" />
                <DetailField label="Sub-industry" value="Software Development" />
                <DetailField label="Financial Year Start" value="01 January" />
              </div>
            </DetailSection>

            {/* Registration & Compliance */}
            <DetailSection
              title="Registration & Compliance"
              icon={<IdentificationCard size={18} weight="duotone" />}
              description="Statutory identifiers and entity classification"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Registration No." value="1234567-T" />
                <DetailField label="TIN No." value="TR-882910-01" />
                <DetailField label="Organisation Type" value={ORG_TYPE_LABELS[mockOrg?.type ?? ""] ?? mockOrg?.type ?? "—"} />
              </div>
            </DetailSection>

            {/* Business Address */}
            <DetailSection
              title="Business Address"
              icon={<MapPin size={18} weight="duotone" />}
              description="Official registered office address"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
                <DetailField label="Address Line" value="Level 15, Menara Southpoint, Mid Valley City" />
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Country" value="Malaysia" />
                  <DetailField label="Postal Code" value="59200" />
                  <DetailField label="City" value="Kuala Lumpur" />
                  <DetailField label="State" value="W.P. Kuala Lumpur" />
                </div>
              </div>
            </DetailSection>

            {/* Payment Details */}
            <DetailSection
              title="Payment Details"
              icon={<Bank size={18} weight="duotone" />}
              description="Settlement bank account"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Bank Name" value="Maybank Berhad" />
                <DetailField label="Account Number" value="5140 1234 5678" />
                <DetailField label="Account Name" value="Acme Corporation Sdn Bhd" />
              </div>
            </DetailSection>

            {/* Documents */}
            <DetailSection
              title="Documents"
              icon={<Article size={18} weight="duotone" />}
              description="Legal and registration documents for this organisation"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { name: "SSM_Registration_2024.pdf", size: "1.2 MB", type: "SSM Certificate" },
                  { name: "Form_49_Directors.pdf", size: "850 KB", type: "Form Section 14" },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 group hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-faint group-hover:text-primary transition-colors">
                      <Article size={20} weight="duotone" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-body font-medium text-foreground">
                        {doc.name}
                      </p>
                      <p className="text-label font-medium text-subtle">
                        {doc.type} • {doc.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === "branches" && (
          <div className="animate-in transition-all duration-300 fade-in">
            {viewBranchId ? (
              <BranchDetailView
                branchId={viewBranchId}
                onBack={() => setViewBranchId(null)}
                onEdit={() => {
                  router.push(`/organizations/${orgId}/branches/${viewBranchId}/edit`)
                }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-heading font-semibold text-foreground">Branches</h2>
                    <p className="text-body text-subtle">Manage geographical locations and their specific account configurations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
                    >
                      <Link href={`/organizations/${orgId}/branches/new`}>
                        <Plus size={14} weight="bold" /> Add Branch
                      </Link>
                    </Button>
                    <div className="mx-1 h-4 w-[1px] bg-border" />
                    <ViewToggle
                      mode={branchesView}
                      onChange={setBranchesView}
                    />
                  </div>
                </div>
                  <DataFilterBar
                    searchQuery={branchSearch}
                    onSearchChange={setBranchSearch}
                    searchPlaceholder="Search branches..."
                    filters={
                      <>
                        <FilterItem
                          label="Region"
                          value="all"
                          onChange={() => {}}
                          options={[
                            { label: "All States", value: "all" },
                            { label: "Selangor", value: "sel" },
                            { label: "Kuala Lumpur", value: "kl" },
                          ]}
                        />
                        <FilterItem
                          label="Status"
                          value="all"
                          onChange={() => {}}
                          options={[
                            { label: "All Status", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                          ]}
                        />
                      </>
                    }
                  />

                  {branchesView === "grid" ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <BranchCard
                        branch={{
                          id: "br_1",
                          name: "ACME HQ (Kuala Lumpur)",
                          type: "HQ",
                          accountModel: "New",
                          accountName: "KL HQ Account",
                          accountId: "ACC-20260115-0001",
                          address: {
                            city: "Kuala Lumpur",
                            state: "Wilayah Persekutuan",
                          },
                          employeesCount: 1240,
                          status: "Active",
                          cashBalance: 45000,
                          creditBalance: 10000,
                          claimsCount: 12,
                        }}
                        onView={() => setViewBranchId("br_1")}
                        onEdit={() => router.push(`/organizations/${orgId}/branches/br_1/edit`)}
                      />
                      <BranchCard
                        branch={{
                          id: "br_2",
                          name: "ACME Subang Jaya",
                          type: "Branch Office",
                          accountModel: "Existing",
                          accountName: "Acme Shared Account",
                          accountId: "ACC-20260115-0002",
                          address: { city: "Subang Jaya", state: "Selangor" },
                          employeesCount: 450,
                          status: "Active",
                          cashBalance: 12500,
                          creditBalance: 5000,
                          claimsCount: 5,
                        }}
                        onView={() => setViewBranchId("br_2")}
                        onEdit={() => router.push(`/organizations/${orgId}/branches/br_2/edit`)}
                      />
                    </div>
                  ) : (
                    <SharedDataTable
                      freezeFirst
                      freezeLast
                      onRowClick={(branch) => setViewBranchId(branch.id)}
                      columns={[
                        {
                          header: "Branch name",
                          accessorKey: "name",
                          sortable: true,
                          render: (branch: { name: string }) => (
                            <span className="text-body font-medium text-foreground transition-colors group-hover:text-primary">
                              {branch.name}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          accessorKey: "status",
                          sortable: true,
                          render: (branch: { status: string }) => (
                            <StatusBadge
                              status={branch.status}
                              variant="emerald"
                            />
                          ),
                        },
                        {
                          header: "Type",
                          accessorKey: "type",
                          sortable: true,
                          render: (branch: { type: string }) => (
                            <span className="text-body text-subtle">
                              {branch.type}
                            </span>
                          ),
                        },
                        {
                          header: "Employees",
                          accessorKey: "employees",
                          sortable: true,
                          render: (branch: { employees: number | string }) => (
                            <span className="text-body text-subtle">
                              {branch.employees}
                            </span>
                          ),
                        },
                        {
                          header: "Account",
                          accessorKey: "accountName",
                          sortable: true,
                          headerClassName: "min-w-[220px]",
                          render: (branch: { accountName: string; accountId: string; cashBalance: number; creditBalance: number }) => {
                            const total = branch.cashBalance + branch.creditBalance;
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-body font-semibold text-foreground truncate">
                                    {branch.accountName}
                                  </span>
                                  <span className="mt-0.5 text-label font-mono text-subtle tracking-tight">
                                    {branch.accountId}
                                  </span>
                                </div>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="ml-auto text-body font-semibold tabular-nums text-foreground hover:text-primary transition-colors"
                                    >
                                      RM {total.toLocaleString()}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-56 bg-card rounded-lg border-border shadow-2xl z-[200] p-3">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-label font-medium text-subtle">Cash balance</span>
                                        <span className="text-label font-semibold text-foreground tabular-nums">RM {branch.cashBalance.toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-label font-medium text-subtle">Credit available</span>
                                        <span className="text-label font-semibold text-foreground tabular-nums">RM {branch.creditBalance.toLocaleString()}</span>
                                      </div>
                                      <div className="h-px bg-border/60 my-0.5" />
                                      <div className="flex items-center justify-between">
                                        <span className="text-label font-semibold text-subtle">Total</span>
                                        <span className="text-label font-semibold text-primary tabular-nums">RM {total.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          },
                        },
                        {
                          header: (
                            <span className="inline-flex items-center gap-1">
                              Claims
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-faint hover:text-foreground transition-colors"
                                    aria-label="About claims"
                                  >
                                    <Info size={12} weight="regular" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card rounded-lg border-border shadow-2xl z-[200] px-2.5 py-1.5">
                                  <span className="text-label font-medium text-foreground">Based on current month&apos;s claim</span>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          ),
                          accessorKey: "claimsCount",
                          sortable: true,
                          headerClassName: "min-w-[120px]",
                          render: (branch: { claimsCount: number }) => (
                            <span className="text-body font-medium tabular-nums text-foreground">
                              {branch.claimsCount.toLocaleString()}
                            </span>
                          ),
                        },
                        {
                          header: "Actions",
                          align: "right",
                          render: (branch: { id: string; type: string }) => (
                            <div onClick={(e) => e.stopPropagation()}>
                              <ActionPopover
                                actions={[
                                  {
                                    label: "View Details",
                                    onClick: () => setViewBranchId(branch.id),
                                  },
                                  {
                                    label: "Edit Branch",
                                    onClick: () =>
                                      router.push(`/organizations/${orgId}/branches/${branch.id}/edit`),
                                  },
                                  ...(branch.type.toLowerCase() !== "hq" ? [{ label: "Deactivate", isDanger: true }] : []),
                                ]}
                              />
                            </div>
                          ),
                        },
                      ]}
                      data={[
                        {
                          id: "br_1",
                          name: "ACME HQ (Kuala Lumpur)",
                          type: "HQ",
                          status: "Active",
                          employees: 1240,
                          accountName: "KL HQ Account",
                          accountId: "ACC-20260115-0001",
                          cashBalance: 45000,
                          creditBalance: 10000,
                          claimsCount: 12,
                        },
                        {
                          id: "br_2",
                          name: "ACME Subang Jaya",
                          type: "Branch office",
                          status: "Active",
                          employees: 450,
                          accountName: "Subang Shared Pool",
                          accountId: "ACC-20260115-0002",
                          cashBalance: 12500,
                          creditBalance: 5000,
                          claimsCount: 5,
                        },
                      ]}
                    />
                  )}
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="animate-in transition-all duration-300 fade-in">
            {isBulkUploading === "true" ? (
              <BulkUploadWizard
                onBack={() => setIsBulkUploading(null)}
                onSuccess={() => setIsBulkUploading(null)}
                orgTierConfigs={orgTierConfigs}
                availablePolicies={assignedPolicies.map(p => ({
                  name: p.name,
                  version: p.version,
                  tiers: orgTierConfigs.map(tc => tc.code || tc.name),
                }))}
              />
            ) : (
              <div className="flex flex-col gap-8 lg:flex-row">
                <aside className="w-full flex-shrink-0 lg:w-64">
                  <VerticalTabs
                    tabs={EMPLOYEE_SUB_TABS}
                    activeTab={activeEmployeeSubTab || "directory"}
                    onChange={setActiveEmployeeSubTab}
                  />
                </aside>

                <div className="min-w-0 flex-1">
                  {activeEmployeeSubTab === "directory" && (
                    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-heading font-semibold text-foreground">
                            Employee Directory
                          </h2>
                          <p className="text-body text-subtle">
                            Manage workforce records and branch assignments
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1.5 text-label font-medium"
                            onClick={() => setIsBulkUploading("true")}
                          >
                            <Upload size={14} weight="bold" /> Bulk Upload
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1.5 text-label font-medium"
                            onClick={handleAddEmployee}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Plus size={14} weight="bold" /> Add Employee
                            </span>
                          </Button>
                          <div className="mx-1 h-4 w-[1px] bg-border" />
                          <ViewToggle
                            mode={employeesView}
                            onChange={setEmployeesView}
                          />
                        </div>
                      </div>

                      <DataFilterBar
                        searchQuery={employeeSearch}
                        onSearchChange={setEmployeeSearch}
                        searchPlaceholder="Search employees..."
                        filters={
                          <>
                            <FilterItem
                              label="Status"
                              value="all"
                              onChange={() => {}}
                              options={[
                                { label: "All Status", value: "all" },
                                { label: "Linked", value: "linked" },
                                { label: "Pending", value: "pending" },
                              ]}
                            />
                            <FilterItem
                              label="Needs Action"
                              value="all"
                              onChange={() => {}}
                              options={[
                                { label: "No Action", value: "all" },
                                { label: "Missing Data", value: "missing" },
                              ]}
                            />
                            <FilterItem
                              label="Branch"
                              value="all"
                              onChange={() => {}}
                              options={[
                                { label: "All Branches", value: "all" },
                                { label: "ACME HQ", value: "hq" },
                                { label: "ACME Subang", value: "subang" },
                              ]}
                            />
                          </>
                        }
                      />

                      {employeesView === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {[
                            {
                              id: "EMP-20260115-0001",
                              name: "Robert Fox",
                              email: "robert.f@acme.com",
                              branch: "ACME HQ",
                              status: "Linked",
                              empCode: "ACM-001",
                              joinDate: "12 Oct 2023",
                              lastActive: "09 Apr 2026, 17:15",
                              department: "Engineering",
                              tier: "Manager",
                              employmentType: "full-time",
                              dependentsCount: 2,
                              benefitPolicies: [
                                {
                                  policyName: "Acme Employee Wellness Policy FY2026",
                                  benefitGroups: [
                                    "Gym Membership",
                                    "Mental Health",
                                  ],
                                  utilisation: 48,
                                },
                                {
                                  policyName: "Corporate Perks",
                                  benefitGroups: [
                                    "Book Allowance",
                                    "Home Office",
                                  ],
                                  utilisation: 10,
                                },
                              ],
                            },
                            {
                              id: "EMP-20260115-0002",
                              name: "Jenny Wilson",
                              email: "jenny.w@acme.com",
                              branch: "ACME Subang Jaya",
                              status: "Linked",
                              empCode: "ACM-042",
                              joinDate: "05 Mar 2024",
                              lastActive: "09 Apr 2026, 16:45",
                              department: "Product",
                              tier: "Senior Manager",
                              employmentType: "full-time",
                              dependentsCount: 0,
                              benefitPolicies: [
                                {
                                  policyName: "Acme Leadership Benefits Policy FY2026",
                                  benefitGroups: ["Travel", "Food"],
                                  utilisation: 85,
                                },
                              ],
                            },
                            {
                              id: "EMP-20260115-0003",
                              name: "Dianne Russell",
                              email: "dianne.r@globalhealth.com",
                              branch: "ACME HQ",
                              status: "Pending Invite",
                              empCode: "ACM-156",
                              joinDate: "20 May 2026",
                              lastActive: "09 Apr 2026, 10:20",
                              department: "Growth",
                              tier: "Associate",
                              employmentType: "internship",
                              dependentsCount: 1,
                              benefitPolicies: [
                                {
                                  policyName: "Rejuvenation Fund",
                                  benefitGroups: [
                                    "Spa Sessions",
                                    "Massages",
                                    "Facials",
                                    "Manicures",
                                    "Pedicures",
                                    "Aromatherapy",
                                    "Hot Stone",
                                  ],
                                  utilisation: 15,
                                },
                              ],
                            },
                          ].map((emp) => (
                            <EmployeeCard
                              key={emp.id}
                              employee={emp as ComponentProps<typeof EmployeeCard>["employee"]}
                              onView={(id) => router.push(`/employees/${id}`)}
                              onEdit={(id) => router.push(`/employees/${id}/edit`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <TooltipProvider>
                          <SharedDataTable
                            freezeFirst
                            freezeLast
                            onRowClick={(emp) => router.push(`/employees/${emp.id}`)}
                            columns={[
                              {
                                header: "Employee",
                                accessorKey: "name",
                                sortable: true,
                                render: (emp) => (
                                  <div className="flex flex-col">
                                    <span className="text-body font-medium text-foreground transition-colors group-hover:text-primary">
                                      {emp.name}
                                    </span>
                                    <span className="mt-0.5 text-label font-medium text-muted-foreground">
                                      {emp.email}
                                    </span>
                                  </div>
                                ),
                              },
                              {
                                header: "ID / Code",
                                accessorKey: "empCode",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-body font-medium text-subtle">
                                    {emp.empCode}
                                  </span>
                                ),
                              },
                              {
                                header: "Branch",
                                accessorKey: "branch",
                                sortable: true,
                                render: (emp) => (
                                  <Badge variant="outline" className="whitespace-nowrap text-label font-medium">
                                    {emp.branch}
                                  </Badge>
                                ),
                              },
                              {
                                header: "Department",
                                accessorKey: "department",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-foreground">
                                    {emp.department || "—"}
                                  </span>
                                ),
                              },
                              {
                                header: "Tier",
                                accessorKey: "tier",
                                sortable: true,
                                render: (emp) => (
                                  <Badge variant="secondary" className="whitespace-nowrap text-label font-medium">
                                    {emp.tier || "—"}
                                  </Badge>
                                ),
                              },
                              {
                                header: "Employment Type",
                                accessorKey: "employmentType",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-muted-foreground capitalize">
                                    {emp.employmentType?.replace("-", " ") || "—"}
                                  </span>
                                ),
                              },
                              {
                                header: "Joined Date",
                                accessorKey: "joinDate",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-subtle">
                                    {emp.joinDate}
                                  </span>
                                ),
                              },
                              {
                                header: "Last Active",
                                accessorKey: "lastActive",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-subtle">
                                    {emp.lastActive}
                                  </span>
                                ),
                              },
                              {
                                header: "Policies",
                                render: (emp) => (
                                  <div className="flex max-w-[280px] flex-wrap items-center gap-1 overflow-visible">
                                    {emp.benefitPolicies &&
                                    emp.benefitPolicies.length > 0 ? (
                                      <>
                                        {emp.benefitPolicies
                                          .slice(0, 2)
                                          .map((policy: { policyName: string; benefitGroups?: string[]; utilisation?: number }, idx: number) => (
                                              <Tooltip key={idx}>
                                                <TooltipTrigger asChild>
                                                  <div className="flex cursor-help items-center">
                                                    <Badge variant="secondary" className="whitespace-nowrap text-label font-medium transition-colors hover:bg-secondary/80">
                                                      {policy.policyName}
                                                      {policy.benefitGroups &&
                                                        policy.benefitGroups.length > 0 && (
                                                          <span className="ml-1 max-w-[80px] truncate font-medium text-subtle">
                                                            ({policy.benefitGroups.length})
                                                          </span>
                                                        )}
                                                    </Badge>
                                                  </div>
                                                </TooltipTrigger>
                                              <TooltipContent
                                                side="top"
                                                className="z-[200] w-56 p-2"
                                              >
                                                <div className="flex flex-col gap-1.5">
                                                  <div className="text-label font-semibold text-foreground">
                                                    {policy.policyName}
                                                  </div>
                                                  {policy.benefitGroups &&
                                                  policy.benefitGroups.length >
                                                    0 ? (
                                                    <div className="text-label leading-snug text-muted-foreground">
                                                      {policy.benefitGroups.join(
                                                        ", "
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <div className="text-label text-muted-foreground italic">
                                                      No specific groups.
                                                    </div>
                                                  )}
                                                  {policy.utilisation !== undefined && (
                                                    <StatusBadge status={`${policy.utilisation}% Utilized`} variant="emerald" className="mt-0.5" />
                                                  )}
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          ))}
                                        {emp.benefitPolicies.length > 2 && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="cursor-help px-1 text-label font-medium text-subtle transition-colors hover:text-primary"
                                              >
                                                +
                                                {emp.benefitPolicies.length - 2}
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="right"
                                              className="z-[200] flex w-56 flex-col gap-2 p-2"
                                            >
                                              <div className="px-1 text-label font-semibold text-muted-foreground opacity-60">
                                                Other policies
                                              </div>
                                              {emp.benefitPolicies
                                                .slice(2)
                                                  .map(
                                                   (policy: { policyName: string; benefitGroups?: string[]; utilisation?: number }, i: number) => (
                                                    <div
                                                      key={i}
                                                      className="flex flex-col gap-1.5 border-b border-border/50 px-1 pb-2.5 last:border-0 last:pb-0"
                                                    >
                                                      <div className="mt-1 text-label font-semibold text-foreground">
                                                        {policy.policyName}
                                                      </div>
                                                      {policy.benefitGroups &&
                                                      policy.benefitGroups
                                                        .length > 0 ? (
                                                        <div className="text-label leading-snug text-muted-foreground">
                                                          {policy.benefitGroups.join(
                                                            ", "
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <div className="text-label text-muted-foreground italic">
                                                          No specific groups.
                                                        </div>
                                                      )}
                                                      {policy.utilisation !== undefined && (
                                                        <StatusBadge status={`${policy.utilisation}% Utilized`} variant="emerald" className="mt-0.5" />
                                                      )}
                                                    </div>
                                                  )
                                                )}
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="text-label font-medium">None</Badge>
                                    )}
                                  </div>
                                ),
                              },
                              {
                                header: "Status",
                                accessorKey: "status",
                                sortable: true,
                                render: (emp) => (
                                  <StatusBadge
                                    status={emp.status}
                                    variant={
                                      emp.status === "Linked"
                                        ? "emerald"
                                        : "amber"
                                    }
                                  />
                                ),
                              },
                              {
                                header: "Actions",
                                align: "right",
                                render: (emp) => (
                                  <ActionPopover
                                    actions={[
                                      {
                                        label: "View Employee",
                                        onClick: () =>
                                          router.push(`/employees/${emp.id}`),
                                      },
                                      {
                                        label: "Edit Employee",
                                        onClick: () => {
                                          router.push(`/employees/${emp.id}/edit`)
                                        },
                                      },
                                      {
                                        label: "Terminate Link",
                                        isDanger: true,
                                      },
                                    ]}
                                  />
                                ),
                              },
                            ]}
                            data={[
                              {
                                id: "EMP-20260115-0001",
                                name: "Robert Fox",
                                email: "robert.f@acme.com",
                                branch: "ACME HQ",
                                joinDate: "12 Oct 2023",
                                lastActive: "09 Apr 2026, 17:15",
                                status: "Linked",
                                empCode: "ACM-001",
                                department: "Engineering",
                                tier: "Manager",
                                employmentType: "full-time",
                                benefitPolicies: [
                                  {
                                    policyName: "Acme Employee Wellness Policy FY2026",
                                    benefitGroups: ["Gym", "Mental Health"],
                                    utilisation: 48,
                                  },
                                  { policyName: "Corporate Perks" },
                                ],
                              },
                              {
                                id: "EMP-20260115-0002",
                                name: "Jenny Wilson",
                                email: "jenny.w@acme.com",
                                branch: "ACME Subang Jaya",
                                joinDate: "05 Mar 2026",
                                lastActive: "09 Apr 2026, 16:45",
                                status: "Linked",
                                empCode: "ACM-042",
                                department: "Product",
                                tier: "Senior Manager",
                                employmentType: "full-time",
                                benefitPolicies: [
                                  {
                                    policyName: "Acme Leadership Benefits Policy FY2026",
                                    benefitGroups: ["Food", "Travel"],
                                    utilisation: 85,
                                  },
                                ],
                              },
                              {
                                id: "EMP-20260115-0003",
                                name: "Dianne Russell",
                                email: "dianne.r@globalhealth.com",
                                branch: "Global Health HQ",
                                joinDate: "20 May 2026",
                                lastActive: "09 Apr 2026, 10:20",
                                status: "Pending",
                                empCode: "ACM-156",
                                department: "Growth",
                                tier: "Associate",
                                employmentType: "internship",
                                benefitPolicies: [
                                  {
                                    policyName: "Rejuvenation Fund",
                                    benefitGroups: [
                                      "Spa Sessions",
                                      "Massages",
                                      "Facials",
                                      "Manicures",
                                      "Pedicures",
                                      "Aromatherapy",
                                      "Hot Stone",
                                    ],
                                    utilisation: 15,
                                  },
                                ],
                              },
                              {
                                id: "EMP-20260115-0004",
                                name: "Marvin McKinney",
                                email: "marvin.m@zenithwellness.com",
                                branch: "Zenith HQ",
                                joinDate: "12 Jan 2026",
                                lastActive: "08 Apr 2026, 14:30",
                                status: "Linked",
                                empCode: "ACM-089",
                                department: "Sales",
                                tier: "Manager",
                                employmentType: "contract",
                                benefitPolicies: [
                                  {
                                    policyName: "Mental Health Support",
                                    benefitGroups: [
                                      "Counseling",
                                      "Meditation Apps",
                                    ],
                                    utilisation: 12,
                                  },
                                  { policyName: "Development Fund" },
                                  { policyName: "WFH Allowance" },
                                  { policyName: "Wellness Extras" },
                                ],
                              },
                            ]}
                          />
                        </TooltipProvider>
                      )}
                    </div>
                  )}

                  {activeEmployeeSubTab === "dependents" && (
                    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-heading font-semibold text-foreground">
                            Dependent Directory
                          </h2>
                          <p className="text-body text-subtle">
                            Manage family members linked to employee benefits
                          </p>
                        </div>
                        <ViewToggle
                          mode={dependentsView}
                          onChange={setDependentsView}
                        />
                      </div>

                      <DataFilterBar
                        searchQuery={dependentSearch}
                        onSearchChange={setDependentSearch}
                        searchPlaceholder="Search by dependent or employee name..."
                      />

                      {dependentsView === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {filteredDependents.map((dep) => (
                            <DependentCard
                              key={dep.id}
                              dependent={dep}
                              onViewEmployee={(employeeId) => {
                                setActiveEmployeeSubTab("directory")
                                router.push(`/employees/${employeeId}`)
                              }}
                              onEdit={(id) => console.log("Edit dependent", id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <SharedDataTable
                          freezeFirst
                          freezeLast
                          columns={[
                            {
                              header: "Dependent Name",
                              accessorKey: "name",
                              render: (dep) => (
                                <span className="text-body font-medium text-foreground">
                                  {dep.name}
                                </span>
                              ),
                            },
                            {
                              header: "Linked Employee",
                              accessorKey: "employeeName",
                              render: (dep) => (
                                <button
                                  onClick={() => {
                                    setActiveEmployeeSubTab("directory")
                                    router.push(`/employees/${dep.employeeId}`)
                                  }}
                                  className="text-body font-medium text-primary hover:underline"
                                >
                                  {dep.employeeName}
                                </button>
                              ),
                            },
                              {
                                header: "Relationship",
                                accessorKey: "relationship",
                                render: (dep) => (
                                  <Badge variant="outline" className="text-label font-medium capitalize">
                                    {dep.relationship}
                                  </Badge>
                                ),
                              },
                            {
                              header: "Status",
                              accessorKey: "status",
                              render: (dep) => (
                                <StatusBadge
                                  status={dep.status}
                                  variant="emerald"
                                />
                              ),
                            },
                            {
                              header: "Joined Date",
                              accessorKey: "joinDate",
                              render: (dep) => (
                                <span className="text-label font-medium text-subtle">
                                  {dep.joinDate}
                                </span>
                              ),
                            },
                            {
                              header: "Actions",
                              align: "right",
                              render: () => (
                                <ActionPopover
                                  actions={[
                                    {
                                      label: "View Details",
                                      onClick: () => {},
                                    },
                                    {
                                      label: "Edit Dependent",
                                      onClick: () => {},
                                    },
                                    { label: "Remove", isDanger: true },
                                  ]}
                                />
                              ),
                            },
                          ]}
                          data={filteredDependents}
                        />
                      )}
                    </div>
                  )}

                  {activeEmployeeSubTab === "entitlements" && (
                    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-heading font-semibold text-foreground">
                            Entitlements
                          </h2>
                          <p className="text-body text-subtle">
                            View all beneficiaries and their assigned benefit
                            allocations
                          </p>
                        </div>
                      </div>

                      <DataFilterBar
                        searchQuery={entitlementSearch}
                        onSearchChange={setEntitlementSearch}
                        searchPlaceholder="Search beneficiaries..."
                        filters={
                          <FilterItem
                            label="Type"
                            value={entitlementTypeFilter}
                            onChange={setEntitlementTypeFilter}
                            options={[
                              { label: "All Types", value: "all" },
                              { label: "Employee", value: "Employee" },
                              { label: "Dependent", value: "Dependent" },
                            ]}
                          />
                        }
                      />

                      <SharedDataTable
                        freezeFirst
                        freezeLast
                        columns={[
                          {
                            header: "Beneficiary",
                            accessorKey: "beneficiaryName",
                            render: (ent) => (
                              <div className="flex flex-col">
                                <span className="text-body font-medium text-foreground">
                                  {ent.beneficiaryName}
                                </span>
                                <span
                                  className="mt-1 w-fit rounded-full px-1.5 py-0.5 text-label font-medium text-primary border border-primary/10 bg-primary/5"
                                >
                                  {ent.type}
                                </span>
                              </div>
                            ),
                          },
                          {
                            header: "Branch",
                            accessorKey: "branchName",
                            render: (ent) => (
                              <span className="text-label font-medium text-muted-foreground">
                                {ent.branchName}
                              </span>
                            ),
                          },
                          {
                            header: "Policy",
                            accessorKey: "policy",
                            render: (ent) => (
                              <span className="text-body font-semibold text-primary">
                                {ent.policy}
                              </span>
                            ),
                          },
                          {
                            header: "Claims Usage",
                            render: (ent) => {
                              const pct = ent.allocatedAmount > 0 ? Math.round((ent.usedAmount / ent.allocatedAmount) * 100) : 0
                              const isHigh = pct > 80
                              return (
                                <div className="flex w-[160px] flex-col gap-1.5">
                                  <div className="flex items-center justify-between text-label">
                                    <span className="text-faint">
                                      RM {ent.usedAmount.toLocaleString()}
                                    </span>
                                    <span className={isHigh ? "font-semibold text-rose-600 dark:text-rose-400" : "font-semibold text-primary"}>{pct}%</span>
                                  </div>
                                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                      className={isHigh
                                        ? "h-full rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-700"
                                        : "h-full rounded-full bg-primary transition-all duration-700"
                                      }
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            },
                          },
                          {
                            header: "Status",
                            accessorKey: "status",
                            render: (ent) => (
                              <StatusBadge
                                status={ent.status}
                                variant="emerald"
                              />
                            ),
                          },
                        ]}
                        data={MOCK_ENTITLEMENTS.filter(
                          (e) =>
                            (entitlementTypeFilter === "all" ||
                              e.type === entitlementTypeFilter) &&
                            e.beneficiaryName
                              .toLowerCase()
                              .includes(entitlementSearch.toLowerCase())
                        )}
                      />
                    </div>
                  )}

                  {activeEmployeeSubTab === "claims" && (
                    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-heading font-semibold text-foreground">
                            Claims
                          </h2>
                          <p className="text-body text-subtle">
                            Complete claim history and reimbursement status for
                            the workforce
                          </p>
                        </div>
                      </div>

                      <UtilisationClaimsTable data={MOCK_EMPLOYEE_UTILISATION} />
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs placeholders */}
        {/* Benefit Policies Tab */}
        {activeTab === "policies" && (
          <div className="animate-in transition-all duration-300 fade-in">
            {viewingPolicyId ? (
              <PolicyDetailView
                key={viewingPolicyId}
                policy={assignedPolicies.find((p) => p.id === viewingPolicyId)!}
                groups={mockGroups.filter((g) => g.policyId === viewingPolicyId)}
                benefits={mockBenefits.filter((b) =>
                  mockGroups.some(
                    (g) => g.id === b.groupId && g.policyId === viewingPolicyId
                  )
                )}
                employees={MOCK_EMPLOYEES}
                onEdit={() => setEditingPolicyId(viewingPolicyId)}
                onClone={() => {
                  const p = assignedPolicies.find((p) => p.id === viewingPolicyId)
                  if (p) {
                    setToastMessage(`Cloned from ${p.name} — open Host Policies to edit`)
                    setViewingPolicyId(null)
                  }
                }}
                onDeactivate={() => {
                  setAssignedPolicies((prev) =>
                    prev.map((p) =>
                      p.id === viewingPolicyId ? { ...p, status: "deactivated" as const } : p
                    )
                  )
                  setToastMessage("Policy deactivated")
                  setViewingPolicyId(null)
                }}
                onDelete={() => {
                  setAssignedPolicies((prev) => prev.filter((p) => p.id !== viewingPolicyId))
                  setToastMessage("Policy unassigned from organisation")
                  setViewingPolicyId(null)
                }}
              />
            ) : isAddingPolicy || editingPolicyId ? (
              <BenefitPolicyWizard
                mode={editingPolicyId ? "edit" : "create"}
                orgId={orgId}
                initialData={
                  editingPolicyId
                    ? {
                        policy: assignedPolicies.find(
                          (p) => p.id === editingPolicyId
                        )!,
                        groups: mockGroups.filter(
                          (g) => g.policyId === editingPolicyId
                        ),
                        benefits: mockBenefits.filter((b) =>
                          mockGroups.some(
                            (g) =>
                              g.id === b.groupId &&
                              g.policyId === editingPolicyId
                          )
                        ),
                      }
                    : undefined
                }
                onCancel={() => {
                  setIsAddingPolicy(null)
                  setEditingPolicyId(null)
                }}
                onSaveDraft={() => {
                  setToastMessage("Policy saved as draft")
                  setIsAddingPolicy(null)
                  setEditingPolicyId(null)
                }}
                onSuccess={(data) => {
                  if (editingPolicyId) {
                    setAssignedPolicies((prev) =>
                      prev.map((p) =>
                        p.id === editingPolicyId ? { ...p, ...data.policy } : p
                      )
                    )
                    setToastMessage("Policy updated successfully")
                  } else {
                    handleAssignPolicy(data.policy.id || "new_pol")
                  }
                  setIsAddingPolicy(null)
                  setEditingPolicyId(null)
                }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-heading font-semibold text-foreground">Benefit Policies</h2>
                    <p className="text-body text-subtle">Manage which benefit structures are assigned to this organisation&apos;s workforce</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsAssignPolicyModalOpen("true")}
                      variant="secondary"
                      size="sm"
                      className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
                    >
                      <Plus size={14} weight="bold" /> Assign Policy
                    </Button>
                    <PolicyCreationLauncher
                      preselectedOrgId={orgId}
                      hideOrgPicker
                      onManual={(oid) => router.push(`/policies/new?orgId=${oid}`)}
                      onTemplate={(tid, oid) => router.push(`/policies/new?template=${tid}&orgId=${oid}`)}
                    />
                  </div>
                </div>
                <DataFilterBar
                  searchQuery={policySearch}
                  onSearchChange={setPolicySearch}
                  searchPlaceholder="Search policies..."
                  filters={
                    <>
                      <FilterItem
                        label="Benefit"
                        options={[
                          { label: "All Benefits", value: "all" },
                          {
                            label: "Physical Wellbeing",
                            value: "Physical Wellbeing",
                          },
                          {
                            label: "Psychological",
                            value: "Psychological Wellbeing",
                          },
                          {
                            label: "Nutritional",
                            value: "Nutritional Support",
                          },
                          { label: "Personal Care", value: "Personal Care" },
                        ]}
                        value={policyFilters.mainService}
                        onChange={(v) =>
                          setPolicyFilters({ ...policyFilters, mainService: v })
                        }
                      />
                      <FilterItem
                        label="Benefit Group"
                        options={[
                          { label: "All Groups", value: "all" },
                          { label: "Gym Access", value: "Gym Access" },
                          { label: "Mental Support", value: "Mental Support" },
                          { label: "Flexi-Benefits", value: "Flexi-Benefits" },
                        ]}
                        value={policyFilters.benefitGroup}
                        onChange={(v) =>
                          setPolicyFilters({
                            ...policyFilters,
                            benefitGroup: v,
                          })
                        }
                      />
                      <FilterItem
                        label="Role Scope"
                        options={[
                          { label: "All Roles", value: "all" },
                          { label: "Management", value: "management" },
                          { label: "Staff", value: "staff" },
                        ]}
                        value={policyFilters.role}
                        onChange={(v) =>
                          setPolicyFilters({ ...policyFilters, role: v })
                        }
                      />
                      <FilterItem
                        label="Status"
                        options={[
                          { label: "All Status", value: "all" },
                          { label: "Active", value: "active" },
                          { label: "Inactive", value: "inactive" },
                        ]}
                        value={policyStatusFilter}
                        onChange={setPolicyStatusFilter}
                      />
                    </>
                  }
                />
                <AssignedPolicyList
                  policies={filteredPolicies.map((policy) => ({
                    ...policy,
                    code: policy.code ?? policy.id,
                    version: policy.version,
                    type: policy.benefitPoolType,
                  }))}
                  onUnassign={handleUnassignPolicy}
                  onView={(id) => {
                    setViewingPolicyId(id)
                    setEditingPolicyId(null)
                  }}
                  onEdit={(id) => {
                    setEditingPolicyId(id)
                  }}
                />
              </div>
            )}
          </div>
        )}
        {activeTab === "claims" && (
          <div className="animate-in fade-in space-y-6">
            <div>
              <h2 className="text-heading font-semibold text-foreground">Claims</h2>
              <p className="text-body text-subtle">Claim history across all employees in this organisation</p>
            </div>
            <OrganizationClaimsTable
              data={MOCK_EMPLOYEE_UTILISATION}
              onViewVoucher={(claim) => setSelectedVoucherClaim(claim)}
              onViewDetails={(claim) => setSelectedVoucherClaim(claim)}
            />
          </div>
        )}

        {activeTab === "vouchers" && (
          <div className="animate-in fade-in space-y-6">
            <div>
              <h2 className="text-heading font-semibold text-foreground">Vouchers</h2>
              <p className="text-body text-subtle">Voucher redemption records across all employees in this organisation</p>
            </div>
            <VouchersTable
              data={MOCK_EMPLOYEE_UTILISATION}
              onViewVoucher={(voucher) => console.log("View voucher", voucher)}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in space-y-6 fade-in">
            {/* Admin Management */}
            <DetailSection
              title="Admin Management"
              icon={<Shield size={18} weight="duotone" />}
              description="Manage administrator access for this organisation"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInviteModalOpen("true")}
                  className="flex h-8 items-center gap-2 text-label font-medium"
                >
                  <Plus size={14} weight="bold" /> Invite Admin
                </Button>
              }
            >
              <SharedDataTable
                freezeFirst
                freezeLast
                columns={[
                  {
                    header: "Name",
                    accessorKey: "name",
                    sortable: true,
                    render: (admin: { name: string }) => (
                      <span className="text-body font-medium text-foreground">
                        {admin.name}
                      </span>
                    ),
                  },
                  {
                    header: "Email",
                    accessorKey: "email",
                    sortable: true,
                    render: (admin: { email: string }) => (
                      <span className="text-body text-subtle">
                        {admin.email}
                      </span>
                    ),
                  },
                  {
                    header: "Role",
                    accessorKey: "role",
                    sortable: true,
                    render: (admin: { role: string }) => (
                      <StatusBadge status="Admin" variant="emerald" />
                    ),
                  },
                  {
                    header: "Branch",
                    accessorKey: "branchName",
                    sortable: true,
                    render: (admin: { branchId: string; branchName: string }) => (
                      <button
                        onClick={() => {
                          setActiveTab("branches")
                          setViewBranchId(admin.branchId)
                        }}
                        className="text-label font-medium text-primary hover:underline"
                      >
                        {admin.branchName}
                      </button>
                    ),
                  },
                  {
                    header: "Joined Date",
                    accessorKey: "joinDate",
                    sortable: true,
                    render: (admin: { joinDate: string }) => (
                      <span className="text-label font-medium text-subtle">
                        {admin.joinDate}
                      </span>
                    ),
                  },
                  {
                    header: "Last Active",
                    accessorKey: "lastActive",
                    sortable: true,
                    render: (admin: { lastActive: string }) => (
                      <span className="text-label font-medium text-subtle">
                        {admin.lastActive}
                      </span>
                    ),
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    sortable: true,
                    render: (admin: { status: string }) => (
                      <StatusBadge status={admin.status} variant="emerald" />
                    ),
                  },
                  {
                    header: "Actions",
                    align: "right",
                    render: () => (
                      <ActionPopover
                        actions={[
                          {
                            label: "Resend Invite",
                            onClick: () => console.log("Resend"),
                          },
                          {
                            label: "Revoke Access",
                            isDanger: true,
                            onClick: () => console.log("Revoke"),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
                data={[
                  {
                    id: "adm_1",
                    name: "John Doe",
                    email: "john.doe@acme.com",
                    role: "OrgAdmin",
                    joinDate: "12 Oct 2023",
                    lastActive: "09 Apr 2024, 16:30",
                    branchName: "ACME HQ",
                    branchId: "br_1",
                    status: "Active",
                  },
                ]}
              />
            </DetailSection>

            {/* Organisation Structure */}
            <OrgStructureConfig
              orgId={orgId}
              initialTiers={mockOrg?.tierConfigs}
              initialDepts={mockOrg?.departmentConfigs}
            />

            <DetailSection
              title="Danger Zone"
              icon={<Gear size={18} weight="duotone" />}
              description="Confirm how you want to change the organisation lifecycle."
            >
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-body font-medium text-foreground">
                        Deactivate Organisation
                      </p>
                      <p className="text-label text-muted-foreground">
                        Disable access temporarily while keeping data intact.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 text-label"
                      onClick={() => openDangerAction("deactivate")}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>

              </div>
            </DetailSection>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDangerModalOpen}
        title={
          dangerAction
            ? dangerActionConfig[dangerAction].title
            : "Confirm Action"
        }
        description={
          dangerAction
            ? dangerActionConfig[dangerAction].description
            : "Review the impact before proceeding."
        }
        impactPoints={
          dangerAction ? dangerActionConfig[dangerAction].impactPoints : []
        }
        confirmLabel={
          dangerAction
            ? dangerActionConfig[dangerAction].confirmLabel
            : "Confirm"
        }
        isSubmitting={isDangerSubmitting}
        onClose={() => {
          setIsDangerModalOpen(false)
          setDangerAction(null)
        }}
        onConfirm={async () => {
          if (!dangerAction) return
          setIsDangerSubmitting(true)
          try {
            const res = await dangerActionConfig[dangerAction].run()
            if (res.success) {
              setOrgStatus(
                dangerAction === "deactivate"
                  ? "deactivated"
                  : "suspended"
              )
              setToastMessage(res.message)
              setIsDangerModalOpen(false)
              setDangerAction(null)
            }
          } finally {
            setIsDangerSubmitting(false)
          }
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center rounded-lg bg-foreground px-5 py-3 text-primary-foreground shadow-lg animate-in slide-in-from-bottom-4 fade-in">
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

const EMPLOYEE_SUB_TABS = [
  { id: "directory", label: "Employee Directory", icon: Users },
  { id: "dependents", label: "Dependent Directory", icon: IdentificationCard },
  { id: "entitlements", label: "Entitlements", icon: Scroll },
  { id: "claims", label: "Claims", icon: SealCheck },
] as const
