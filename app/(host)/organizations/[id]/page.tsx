"use client"

import { useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  useTabPersistence,
  useQueryState,
  useUpdateQueryParams,
} from "@/hooks/use-tab-persistence"
import {
  Buildings,
  GitBranch,
  Users,
  Shield,
  Gear,
  CreditCard,
  Plus,
  PencilSimpleLine,
  Upload,
  ChartLineUp,
  ClockCounterClockwise,
  TrendUp,
  Funnel,
  DotsThreeVertical,
  MagnifyingGlass,
  Article,
  IdentificationCard,
  Suitcase,
  Scroll,
  SealCheck,
  MapPin,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { BranchSheet } from "@/components/host/organizations/branch-sheet"
import { InviteAdminModal } from "@/components/host/organizations/invite-admin-modal"
import { Button } from "@/components/ui/button"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/shared/vertical-tabs"
import { BranchCard } from "@/components/host/organizations/branch-card"
import { BranchDetailView } from "@/components/host/organizations/branch-detail-view"
import { BranchForm } from "@/components/host/organizations/branch-form"
import { EmployeeCard } from "@/components/host/organizations/employee-card"
import { DependentCard } from "@/components/host/organizations/dependent-card"
import {
  UtilisationClaimsTable,
  type EmployeeUtilisationRow,
} from "@/components/shared/utilisation-claims-table"
import { OrganizationClaimsTable } from "@/components/shared/organization-claims-table"
import { EmployeeDetailView } from "@/components/host/organizations/employee-detail-view"
import { EmployeeForm } from "@/components/host/organizations/employee-form"
import { BulkUploadWizard } from "@/components/host/organizations/bulk-upload-wizard"
import { AssignedPolicyList } from "@/components/host/organizations/assigned-policy-list"
import { LinkPolicyModal } from "@/components/host/organizations/link-policy-modal"
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard"
import { BenefitPolicy } from "@/types/policy"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ActionPopover } from "@/components/shared/action-popover"
import { SharedDataTable, Column } from "@/components/shared/data-table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  deactivateOrganization,
  removeOrganization,
  suspendOrganization,
} from "@/features/organizations/actions"
import { OrganizationStatus } from "@/features/organizations/types"
import { UtilizationChart } from "@/components/host/organizations/utilization-chart"
import { EntityAvatar } from "@/components/shared/entity-avatar"

const TABS = [
  { id: "profile", label: "Org Details", icon: Buildings },
  { id: "branches", label: "Branches", icon: Buildings },
  { id: "employees", label: "Employees", icon: Users },
  { id: "policies", label: "Benefit Policy", icon: Shield },
  { id: "usage", label: "Utilization & Claims", icon: ChartLineUp },
  { id: "settings", label: "Settings", icon: Gear },
] as const

type TabId = (typeof TABS)[number]["id"]

// Mock Data for Breadcrumb Dropdowns
const OTHER_ORGS = [
  { label: "Acme Corporation Sdn Bhd", href: "/organizations/org_1" },
  { label: "Global Tech Solutions", href: "/organizations/org_2" },
  { label: "Nexus Innovate", href: "/organizations/org_3" },
]

function OrganizationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [activeTab, setActiveTab] = useTabPersistence<TabId>("profile")
  const [isInviteModalOpen, setIsInviteModalOpen] = useQueryState("inviteAdmin")
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useQueryState("branchSheet")
  const [selectedBranchName, setSelectedBranchName] =
    useQueryState("branchName")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [orgStatus, setOrgStatus] = useState<OrganizationStatus>("active")
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false)
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false)
  const [dangerAction, setDangerAction] = useState<
    "deactivate" | "suspend" | "remove" | null
  >(null)

  // View modes
  const [branchesView, setBranchesView] = useState<ViewMode>("grid")
  const [employeesView, setEmployeesView] = useState<ViewMode>("grid")
  const [dependentsView, setDependentsView] = useState<ViewMode>("grid")
  const [adminsView, setAdminsView] = useState<ViewMode>("list")
  const [policiesView, setPoliciesView] = useState<ViewMode>("list")

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
  const [isAddingBranch, setIsAddingBranch] = useQueryState("addBranch")
  const [editingBranchId, setEditingBranchId] = useQueryState("editBranch")

  // Sub-navigation state (Employees)
  const [viewEmployeeId, setViewEmployeeId] = useQueryState("employeeId")
  const [isAddingEmployee, setIsAddingEmployee] = useQueryState("addEmployee")
  const [editingEmployeeId, setEditingEmployeeId] =
    useQueryState("editEmployee")
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
  const [isLinkPolicyModalOpen, setIsLinkPolicyModalOpen] =
    useQueryState("linkPolicy")
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
      name: "Wellness Allocation",
      code: "WELL-2026-HQ",
      description:
        "Standard wellness benefits for HQ staff including gym and mental health support.",
      eligibility: {
        roles: ["staff", "management"],
        employeeTypes: ["full-time"],
      },
      benefitPoolType: {
        employee: "Individual" as const,
        dependents: "None" as const,
      },
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "OrgFY" as const,
      activationMode: "JoinDate" as const,
      status: "Published" as const,
      assignedTo: "All Branches",
      employeeCount: 1240,
      lastUpdated: "24 Mar 2024",
      categories: ["Physical Wellbeing", "Psychological Wellbeing"],
      groups: ["Gym Access", "Mental Support"],
    },
    {
      id: "pol_2",
      name: "Lifestyle Pocket",
      code: "LIFE-2026-SUB",
      description:
        "Flexible lifestyle benefits for travel, food, and personal development.",
      eligibility: {
        roles: ["staff"],
        employeeTypes: ["full-time", "part-time"],
      },
      benefitPoolType: {
        employee: "Shared" as const,
        dependents: "Shared" as const,
      },
      utilisationMode: "Prorated" as const,
      refreshCycle: "Monthly" as const,
      refreshStartReference: "JoinDate" as const,
      activationMode: "ProbationEnds" as const,
      status: "Published" as const,
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

  const filteredPolicies = useMemo(() => {
    return assignedPolicies.filter((p) => {
      const searchLower = policySearch.toLowerCase()
      const matchesSearch =
        !policySearch ||
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)

      const matchesStatus =
        policyStatusFilter === "all" ||
        (policyStatusFilter === "active"
          ? p.status === "Published"
          : p.status !== "Published")

      const matchesRole =
        policyFilters.role === "all" ||
        p.eligibility.roles.includes(policyFilters.role.toLowerCase())

      const matchesService =
        policyFilters.mainService === "all" ||
        p.categories?.includes(policyFilters.mainService)

      const matchesGroup =
        policyFilters.benefitGroup === "all" ||
        p.groups?.includes(policyFilters.benefitGroup)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesService &&
        matchesGroup
      )
    })
  }, [assignedPolicies, policySearch, policyStatusFilter, policyFilters])

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
  const [mockBenefits] = useState([
    {
      id: "b1",
      groupId: "g1",
      serviceId: "s1",
      amount: 200,
      coPayment: { required: false, type: "Percentage" as const, value: 0 },
    },
    {
      id: "b2",
      groupId: "g2",
      serviceId: "s4",
      amount: 150,
      coPayment: { required: true, type: "Percentage" as const, value: 10 },
    },
    {
      id: "b3",
      groupId: "g3",
      serviceId: "s5",
      amount: 100,
      coPayment: { required: false, type: "Percentage" as const, value: 0 },
    },
    {
      id: "b4",
      groupId: "g3",
      serviceId: "s6",
      amount: 100,
      coPayment: { required: false, type: "Percentage" as const, value: 0 },
    },
  ])

  const handleLinkPolicy = (policyId: string) => {
    // Mock linking logic
    const policyNames: Record<string, string> = {
      pol_1: "Executive Health Plus",
      pol_2: "Standard Workforce Pool",
      pol_3: "Remote Flex Benefits",
    }

    const newPolicy = {
      id: policyId,
      name: policyNames[policyId] || "Selected Policy",
      code: `WP-${policyId.split("_")[1].toUpperCase()}-2026`,
      description: "Automatically linked benefit policy.",
      eligibility: { roles: [], employeeTypes: ["full-time"] },
      benefitPoolType: {
        employee: "Individual" as const,
        dependents: "None" as const,
      },
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "OrgFY" as const,
      activationMode: "JoinDate" as const,
      status: "Published" as const,
      assignedTo: "All Branches",
      employeeCount: 0,
      lastUpdated: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }

    setAssignedPolicies([...assignedPolicies, newPolicy])
    setToastMessage("Policy linked successfully")
  }

  const handleUnlinkPolicy = (id: string) => {
    setAssignedPolicies(assignedPolicies.filter((p) => p.id !== id))
    setToastMessage("Policy unlinked from organization")
  }

  const openDangerAction = (action: "deactivate" | "suspend" | "remove") => {
    setDangerAction(action)
    setIsDangerModalOpen(true)
  }

  const dangerActionConfig = {
    deactivate: {
      title: "Deactivate Organization",
      confirmLabel: "Deactivate Organization",
      description:
        "Temporarily disable this organization without removing its records.",
      impactPoints: [
        "Organization admins will lose access until the account is reactivated.",
        "Employees and branches remain stored, but the workspace becomes read-only.",
        "New actions across the organization will be paused.",
      ],
      run: () => deactivateOrganization(orgId),
    },
    suspend: {
      title: "Suspend Organization",
      confirmLabel: "Suspend Organization",
      description:
        "Suspend operations while keeping the organization data available for recovery.",
      impactPoints: [
        "Admins can no longer manage employees, policies, or wallet activity.",
        "Active operations are paused until the suspension is lifted.",
        "Historical records remain available for audit and review.",
      ],
      run: () => suspendOrganization(orgId),
    },
    remove: {
      title: "Remove Organization",
      confirmLabel: "Remove Organization",
      description:
        "Permanently remove this organization and all associated records.",
      impactPoints: [
        "Branches, employees, policies, and admins will be removed from the workspace.",
        "This action cannot be undone.",
        "Any dependent references in reporting will be severed.",
      ],
      run: async () => {
        const res = await removeOrganization(orgId)
        if (res.success) {
          router.push("/organizations")
        }
        return res
      },
    },
  } as const

  const orgName =
    orgId === "org_2" ? "Global Tech Solutions" : "Acme Corporation Sdn Bhd"

  return (
    <div className="pb-12">
      <LinkPolicyModal
        isOpen={isLinkPolicyModalOpen === "true"}
        onClose={() => setIsLinkPolicyModalOpen(null)}
        onLink={handleLinkPolicy}
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
                        : orgStatus === "pending"
                          ? "amber"
                          : orgStatus === "removed"
                            ? "zinc"
                            : "rose"
                    }
                  />
                </div>
                <div className="flex items-center gap-3 text-nav text-muted-foreground">
                  <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-caption tracking-widest text-muted-foreground/60 uppercase">
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
                className="rounded-full text-nav font-medium transition-all"
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
                      addBranch: null,
                      editBranch: null,
                      branchName: null,
                      employeeId: null,
                      addEmployee: null,
                      editEmployee: null,
                      bulkUpload: null,
                      linkPolicy: null,
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
            {/* Account Details */}
            <DetailSection
              title="Account Details"
              icon={<Buildings size={18} weight="duotone" />}
              description="Basic information about the organization"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Registration No." value="1234567-T" />
                <DetailField label="TIN No." value="TR-882910-01" />
                <DetailField label="Industry" value="Technology" />
                <DetailField
                  label="Sub-industry"
                  value="Software Development"
                />
                <DetailField
                  label="Financial Year Start"
                  value="01 January"
                />
                <DetailField label="Organisation Type" value="SME" />
                <DetailField 
                  label="Credit Limit" 
                  value={<span className="font-mono font-semibold text-primary">RM 50,000.00</span>} 
                />
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
                  <DetailField label="City" value="Kuala Lumpur" />
                  <DetailField label="State" value="W.P. Kuala Lumpur" />
                  <DetailField label="Postal Code" value="59200" />
                  <DetailField label="Country" value="Malaysia" />
                </div>
              </div>
            </DetailSection>

            {/* Tax & Banking Details */}
            <DetailSection
              title="Tax & Banking"
              icon={<CreditCard size={18} weight="duotone" />}
              description="Financial reporting and settlement identifiers"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Bank Name" value="Maybank Berhad" />
                <DetailField label="Account Number" value="5140 1234 5678" />
                <DetailField
                  label="Account Name"
                  value="Acme Corporation Sdn Bhd"
                />
              </div>
            </DetailSection>

            {/* Administrators */}
            <DetailSection
              title="Administrators"
              icon={<Users size={18} weight="duotone" />}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsInviteModalOpen("true")}
                    className="flex h-8 items-center gap-2 text-label font-medium"
                  >
                    <Plus size={14} weight="bold" /> Send Invite
                  </Button>
                  <div className="mx-1 h-4 w-[1px] bg-border" />
                  <ViewToggle mode={adminsView} onChange={setAdminsView} />
                </div>
              }
            >
              <SharedDataTable
                columns={[
                  {
                    header: "Name",
                    accessorKey: "name",
                    sortable: true,
                    render: (admin: any) => (
                      <span className="text-nav font-medium text-foreground">
                        {admin.name}
                      </span>
                    ),
                  },
                  {
                    header: "Email",
                    accessorKey: "email",
                    sortable: true,
                    render: (admin: any) => (
                      <span className="text-nav text-muted-foreground">
                        {admin.email}
                      </span>
                    ),
                  },
                  {
                    header: "Role",
                    accessorKey: "role",
                    sortable: true,
                    render: (admin: any) => (
                      <span className="text-nav text-muted-foreground">
                        {admin.role}
                      </span>
                    ),
                  },
                  {
                    header: "Joined Date",
                    accessorKey: "joinDate",
                    sortable: true,
                    render: (admin: any) => (
                      <span className="text-label font-medium text-muted-foreground/80">
                        {admin.joinDate}
                      </span>
                    ),
                  },
                  {
                    header: "Last Active",
                    accessorKey: "lastActive",
                    sortable: true,
                    render: (admin: any) => (
                      <span className="text-label font-medium text-muted-foreground/80">
                        {admin.lastActive}
                      </span>
                    ),
                  },
                  {
                    header: "Branch",
                    accessorKey: "branchName",
                    sortable: true,
                    render: (admin: any) => (
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
                    header: "Status",
                    accessorKey: "status",
                    sortable: true,
                    render: (admin: any) => (
                      <StatusBadge status={admin.status} variant="emerald" />
                    ),
                  },
                  {
                    header: "Actions",
                    align: "right",
                    render: (admin: any) => (
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
                    role: "Org Admin",
                    joinDate: "12 Oct 2023",
                    lastActive: "09 Apr 2024, 16:30",
                    branchName: "ACME HQ",
                    branchId: "br_1",
                    status: "Active",
                  },
                ]}
              />
            </DetailSection>

            {/* Documents */}
            <DetailSection
              title="Documents"
              icon={<Article size={18} weight="duotone" />}
              description="Legal and registration documents for this organization"
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-100 bg-white text-muted-foreground/60 group-hover:text-primary transition-colors">
                      <Article size={20} weight="duotone" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-nav font-semibold text-foreground">
                        {doc.name}
                      </p>
                      <p className="text-micro font-medium text-muted-foreground">
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
            {isAddingBranch === "true" || editingBranchId ? (
              <BranchForm
                branchId={editingBranchId}
                onCancel={() => {
                  setIsAddingBranch(null)
                  setEditingBranchId(null)
                }}
                onSubmit={() => {
                  setIsAddingBranch(null)
                  setEditingBranchId(null)
                  setToastMessage(
                    editingBranchId
                      ? "Branch updated successfully"
                      : "Branch created successfully"
                  )
                }}
              />
            ) : viewBranchId ? (
              <BranchDetailView
                branchId={viewBranchId}
                onBack={() => setViewBranchId(null)}
                onEdit={() => {
                  setEditingBranchId(viewBranchId)
                }}
              />
            ) : (
              <div className="space-y-6">
                <DetailSection
                  title="Branches"
                  icon={<GitBranch size={18} weight="duotone" />}
                  description="Manage geographical locations and their specific wallet configurations"
                  action={
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsInviteModalOpen("true")}
                        variant="secondary"
                        size="sm"
                        className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
                      >
                        <Plus size={14} weight="bold" /> Invite Admin
                      </Button>
                      <div className="h-4 w-[1px] bg-border" />
                      <Button
                        onClick={() => setIsBranchSheetOpen("true")}
                        variant="ghost"
                        size="sm"
                        className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium text-primary hover:bg-primary/5"
                      >
                        <Plus size={14} weight="bold" /> Quick Launch Hub
                      </Button>
                      <div className="mx-1 h-4 w-[1px] bg-border" />
                      <ViewToggle
                        mode={branchesView}
                        onChange={setBranchesView}
                      />
                    </div>
                  }
                >
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <BranchCard
                        branch={{
                          id: "br_1",
                          name: "ACME HQ (Kuala Lumpur)",
                          type: "HQ",
                          walletModel: "Cash Balance",
                          address: {
                            city: "Kuala Lumpur",
                            state: "Wilayah Persekutuan",
                          },
                          employeesCount: 1240,
                          status: "Active",
                          balance: "RM 45,000.00",
                          limit: "RM 60,000.00",
                          utilizationRate: 68,
                          claimsCount: 12,
                        }}
                        onView={() => setViewBranchId("br_1")}
                        onEdit={() => setEditingBranchId("br_1")}
                      />
                      <BranchCard
                        branch={{
                          id: "br_2",
                          name: "ACME Subang Jaya",
                          type: "Branch Office",
                          walletModel: "Shared HQ Wallet",
                          address: { city: "Subang Jaya", state: "Selangor" },
                          employeesCount: 450,
                          status: "Active",
                          balance: "RM 12,500.00",
                          limit: "RM 30,000.00",
                          utilizationRate: 42,
                          claimsCount: 5,
                        }}
                        onView={() => setViewBranchId("br_2")}
                        onEdit={() => setEditingBranchId("br_2")}
                      />
                    </div>
                  ) : (
                    <SharedDataTable
                      onRowClick={(branch) => setViewBranchId(branch.id)}
                      columns={[
                        {
                          header: "Branch name",
                          accessorKey: "name",
                          sortable: true,
                          render: (branch: any) => (
                            <span className="text-nav font-medium text-foreground transition-colors group-hover:text-primary">
                              {branch.name}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          accessorKey: "status",
                          sortable: true,
                          render: (branch: any) => (
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
                          render: (branch: any) => (
                            <span className="text-nav text-muted-foreground">
                              {branch.type}
                            </span>
                          ),
                        },
                        {
                          header: "Employees",
                          accessorKey: "employees",
                          sortable: true,
                          render: (branch: any) => (
                            <span className="text-nav text-muted-foreground">
                              {branch.employees}
                            </span>
                          ),
                        },
                        {
                          header: "Wallet",
                          accessorKey: "walletModel",
                          sortable: true,
                          headerClassName: "min-w-[150px]",
                          render: (branch: any) => (
                            <div className="flex flex-col">
                              <span className="text-nav font-semibold tracking-tight text-foreground">
                                {branch.walletModel}
                              </span>
                              <span className="mt-0.5 text-caption font-medium text-muted-foreground">
                                {branch.balance}
                              </span>
                            </div>
                          ),
                        },
                        {
                          header: "Utilisation / Claims",
                          accessorKey: "utilizationRate",
                          sortable: true,
                          headerClassName: "min-w-[180px]",
                          render: (branch: any) => (
                            <div className="flex items-center gap-2.5">
                              <UtilizationChart
                                value={branch.utilizationRate}
                                mode="ring"
                                size={32}
                                strokeWidth={3}
                              />
                              <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 leading-tight">
                                  <span className="text-label font-semibold text-foreground">
                                    {branch.balance}
                                  </span>
                                  {branch.claimsCount !== undefined && (
                                    <span className="rounded-full border border-zinc-200 bg-muted px-1.5 text-micro font-semibold text-muted-foreground tabular-nums">
                                      {branch.claimsCount}
                                    </span>
                                  )}
                                </div>
                                <span className="mt-0.5 text-micro font-medium text-muted-foreground/60 tabular-nums">
                                  / {branch.limit || "RM 0.00"}
                                </span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          header: "Actions",
                          align: "right",
                          render: (branch: any) => (
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
                                      setEditingBranchId(branch.id),
                                  },
                                  { label: "Deactivate", isDanger: true },
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
                          walletModel: "Single Wallet",
                          balance: "RM 45,000",
                          limit: "RM 60,000",
                          utilizationRate: 68,
                          claimsCount: 12,
                        },
                        {
                          id: "br_2",
                          name: "ACME Subang Jaya",
                          type: "Branch office",
                          status: "Active",
                          employees: 450,
                          walletModel: "Existing Wallet",
                          balance: "RM 12,500",
                          limit: "RM 30,000",
                          utilizationRate: 42,
                          claimsCount: 5,
                        },
                      ]}
                    />
                  )}
                </DetailSection>
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
              />
            ) : isAddingEmployee === "true" || editingEmployeeId ? (
              <EmployeeForm
                employeeId={editingEmployeeId}
                onCancel={() => {
                  setIsAddingEmployee(null)
                  setEditingEmployeeId(null)
                  // Also use router.back() as fallback
                  router.back()
                }}
                onSuccess={() => {
                  setIsAddingEmployee(null)
                  setEditingEmployeeId(null)
                  setToastMessage(
                    editingEmployeeId
                      ? "Employee updated successfully"
                      : "Employee registered successfully"
                  )
                }}
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
                          <p className="text-nav text-muted-foreground">
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
                            onClick={() => setIsAddingEmployee("true")}
                          >
                            <Plus size={14} weight="bold" /> Add Employee
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
                              id: "emp_1",
                              name: "Robert Fox",
                              email: "robert.f@acme.com",
                              branch: "ACME HQ",
                              status: "Linked",
                              empCode: "ACM-001",
                              joinDate: "12 Oct 2023",
                              dependentsCount: 2,
                              benefitPolicies: [
                                {
                                  policyName: "Wellness Allocation",
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
                              id: "emp_2",
                              name: "Jenny Wilson",
                              email: "jenny.w@acme.com",
                              branch: "ACME Subang Jaya",
                              status: "Linked",
                              empCode: "ACM-042",
                              joinDate: "05 Mar 2024",
                              dependentsCount: 0,
                              benefitPolicies: [
                                {
                                  policyName: "Lifestyle Pocket",
                                  benefitGroups: ["Travel", "Food"],
                                  utilisation: 85,
                                },
                              ],
                            },
                            {
                              id: "emp_3",
                              name: "Dianne Russell",
                              email: "dianne.r@acme.com",
                              branch: "ACME HQ",
                              status: "Pending Invite",
                              empCode: "ACM-156",
                              joinDate: "20 May 2026",
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
                              employee={emp as any}
                              onView={(id) => router.push(`/employees/${id}`)}
                              onEdit={(id) => setEditingEmployeeId(id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <TooltipProvider>
                          <SharedDataTable
                            onRowClick={(emp) => router.push(`/employees/${emp.id}`)}
                            columns={[
                              {
                                header: "Employee",
                                accessorKey: "name",
                                sortable: true,
                                render: (emp) => (
                                  <div className="flex flex-col">
                                    <span className="text-nav font-semibold text-foreground transition-colors group-hover:text-primary">
                                      {emp.name}
                                    </span>
                                    <span className="mt-0.5 text-caption font-medium text-muted-foreground">
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
                                  <span className="text-nav font-medium text-muted-foreground">
                                    {emp.empCode}
                                  </span>
                                ),
                              },
                              {
                                header: "Branch",
                                accessorKey: "branch",
                                sortable: true,
                                render: (emp) => (
                                  <span className="rounded-md border border-zinc-200 bg-muted/80 px-2 py-0.5 text-label font-semibold text-muted-foreground">
                                    {emp.branch}
                                  </span>
                                ),
                              },
                              {
                                header: "Joined Date",
                                accessorKey: "joinDate",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-muted-foreground/80">
                                    {emp.joinDate}
                                  </span>
                                ),
                              },
                              {
                                header: "Last Active",
                                accessorKey: "lastActive",
                                sortable: true,
                                render: (emp) => (
                                  <span className="text-label font-medium text-muted-foreground/80">
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
                                          .map((policy: any, idx: number) => (
                                            <Tooltip key={idx}>
                                              <TooltipTrigger asChild>
                                                <div className="flex cursor-help items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-label font-semibold whitespace-nowrap text-primary transition-colors hover:bg-primary/10">
                                                  {policy.policyName}
                                                  {policy.benefitGroups &&
                                                    policy.benefitGroups
                                                      .length > 0 && (
                                                      <span className="ml-1 max-w-[80px] truncate font-medium text-muted-foreground/80">
                                                        (
                                                        {
                                                          policy.benefitGroups
                                                            .length
                                                        }
                                                        )
                                                      </span>
                                                    )}
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
                                                    <div className="text-caption leading-snug text-muted-foreground">
                                                      {policy.benefitGroups.join(
                                                        ", "
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <div className="text-caption text-muted-foreground italic">
                                                      No specific groups.
                                                    </div>
                                                  )}
                                                  {policy.utilisation !==
                                                    undefined && (
                                                    <div className="mt-0.5 text-caption font-medium text-emerald-600">
                                                      {policy.utilisation}%
                                                      Utilized
                                                    </div>
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
                                                className="cursor-help px-1 text-caption font-semibold text-muted-foreground transition-colors hover:text-primary"
                                              >
                                                +
                                                {emp.benefitPolicies.length - 2}
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="right"
                                              className="z-[200] flex w-56 flex-col gap-2 p-2"
                                            >
                                              <div className="px-1 text-caption font-semibold tracking-tight text-muted-foreground opacity-60">
                                                Other policies
                                              </div>
                                              {emp.benefitPolicies
                                                .slice(2)
                                                .map(
                                                  (policy: any, i: number) => (
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
                                                        <div className="text-caption leading-snug text-muted-foreground">
                                                          {policy.benefitGroups.join(
                                                            ", "
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <div className="text-caption text-muted-foreground italic">
                                                          No specific groups.
                                                        </div>
                                                      )}
                                                      {policy.utilisation !==
                                                        undefined && (
                                                        <div className="mt-0.5 text-caption font-medium text-emerald-600">
                                                          {policy.utilisation}%
                                                          Utilized
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                )}
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-micro font-medium text-muted-foreground/50 italic">
                                        None
                                      </span>
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
                                          setEditingEmployeeId(emp.id)
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
                                id: "emp_1",
                                name: "Robert Fox",
                                email: "robert.f@acme.com",
                                branch: "ACME HQ",
                                joinDate: "12 Oct 2023",
                                lastActive: "09 Apr 2024, 17:15",
                                status: "Linked",
                                empCode: "ACM-001",
                                benefitPolicies: [
                                  {
                                    policyName: "Wellness Allocation",
                                    benefitGroups: ["Gym", "Mental Health"],
                                    utilisation: 48,
                                  },
                                  { policyName: "Corporate Perks" },
                                ],
                              },
                              {
                                id: "emp_2",
                                name: "Jenny Wilson",
                                email: "jenny.w@acme.com",
                                branch: "ACME Subang Jaya",
                                joinDate: "05 Mar 2024",
                                lastActive: "09 Apr 2024, 16:45",
                                status: "Linked",
                                empCode: "ACM-042",
                                benefitPolicies: [
                                  {
                                    policyName: "Lifestyle Pocket",
                                    benefitGroups: ["Food", "Travel"],
                                    utilisation: 85,
                                  },
                                ],
                              },
                              {
                                id: "emp_3",
                                name: "Dianne Russell",
                                email: "dianne.r@acme.com",
                                branch: "ACME HQ",
                                joinDate: "20 May 2026",
                                lastActive: "09 Apr 2024, 10:20",
                                status: "Pending",
                                empCode: "ACM-156",
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
                                id: "emp_4",
                                name: "Marvin McKinney",
                                email: "marvin@acme.com",
                                branch: "ACME Subang Jaya",
                                joinDate: "12 Jan 2024",
                                lastActive: "08 Apr 2024, 14:30",
                                status: "Linked",
                                empCode: "ACM-089",
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
                          <p className="text-nav text-muted-foreground">
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
                        searchPlaceholder="Search dependents..."
                      />

                      {dependentsView === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {MOCK_DEPENDENTS.map((dep) => (
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
                          columns={[
                            {
                              header: "Dependent Name",
                              accessorKey: "name",
                              render: (dep) => (
                                <span className="text-nav font-medium text-foreground">
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
                                  className="text-nav font-medium text-primary hover:underline"
                                >
                                  {dep.employeeName}
                                </button>
                              ),
                            },
                            {
                              header: "Relationship",
                              accessorKey: "relationship",
                              render: (dep) => (
                                <span className="rounded-md border border-zinc-200 bg-muted px-2 py-0.5 text-label font-semibold text-muted-foreground">
                                  {dep.relationship}
                                </span>
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
                                <span className="text-label font-medium text-muted-foreground/80">
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
                          data={MOCK_DEPENDENTS}
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
                          <p className="text-nav text-muted-foreground">
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
                        columns={[
                          {
                            header: "Beneficiary",
                            accessorKey: "beneficiaryName",
                            render: (ent) => (
                              <div className="flex flex-col">
                                <span className="text-nav font-semibold text-foreground">
                                  {ent.beneficiaryName}
                                </span>
                                <span
                                  className={cn(
                                    "mt-1 w-fit rounded-full px-1.5 py-0.5 text-micro font-semibold tracking-wider uppercase",
                                    ent.type === "Employee"
                                      ? "border border-blue-100 bg-blue-50 text-blue-600"
                                      : "border border-purple-100 bg-purple-50 text-purple-600"
                                  )}
                                >
                                  {ent.type}
                                </span>
                              </div>
                            ),
                          },
                          {
                            header: "Branch",
                            accessorKey: "branch",
                            render: (ent) => (
                              <span className="text-label font-medium text-muted-foreground">
                                {ent.branch}
                              </span>
                            ),
                          },
                          {
                            header: "Policy",
                            accessorKey: "policy",
                            render: (ent) => (
                              <span className="text-nav font-semibold text-primary">
                                {ent.policy}
                              </span>
                            ),
                          },
                          {
                            header: "Utilisation",
                            render: (ent) => (
                              <div className="flex w-[140px] flex-col gap-1.5">
                                <div className="flex justify-between text-caption font-medium">
                                  <span className="text-muted-foreground">
                                    {ent.used}
                                  </span>
                                  <span className="text-foreground">
                                    / {ent.allocated}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{
                                      width: `${(parseFloat(ent.used.replace("RM ", "").replace(",", "")) / parseFloat(ent.allocated.replace("RM ", "").replace(",", ""))) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ),
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
                          <p className="text-nav text-muted-foreground">
                            Complete claim history and reimbursement status for
                            the workforce
                          </p>
                        </div>
                      </div>

                      <UtilisationClaimsTable data={ORG_MOCK_UTILISATION} />
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
            {isAddingPolicy || viewingPolicyId || editingPolicyId ? (
              <BenefitPolicyWizard
                mode={
                  editingPolicyId ? "edit" : viewingPolicyId ? "view" : "create"
                }
                initialData={
                  viewingPolicyId || editingPolicyId
                    ? {
                        policy: assignedPolicies.find(
                          (p) => p.id === (viewingPolicyId || editingPolicyId)
                        )!,
                        groups: mockGroups.filter(
                          (g) =>
                            g.policyId === (viewingPolicyId || editingPolicyId)
                        ),
                        benefits: mockBenefits.filter((b) =>
                          mockGroups.some(
                            (g) =>
                              g.id === b.groupId &&
                              g.policyId ===
                                (viewingPolicyId || editingPolicyId)
                          )
                        ),
                      }
                    : undefined
                }
                onEdit={() => {
                  if (viewingPolicyId) {
                    setEditingPolicyId(viewingPolicyId)
                  }
                }}
                onCancel={() => {
                  if (editingPolicyId && viewingPolicyId) {
                    setEditingPolicyId(null)
                  } else {
                    setIsAddingPolicy(null)
                    setViewingPolicyId(null)
                    setEditingPolicyId(null)
                  }
                }}
                onSaveDraft={(data) => {
                  setToastMessage("Policy saved as draft")
                  setIsAddingPolicy(null)
                  setEditingPolicyId(null)
                  setViewingPolicyId(null)
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
                    handleLinkPolicy(data.policy.id || "new_pol")
                  }
                  setIsAddingPolicy(null)
                  setEditingPolicyId(null)
                }}
              />
            ) : (
              <DetailSection
                title="Benefit Policies"
                icon={<Shield size={18} weight="duotone" />}
                description="Manage which benefit structures are assigned to this organization's workforce"
                action={
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsLinkPolicyModalOpen("true")}
                      variant="secondary"
                      size="sm"
                      className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
                    >
                      <Plus size={14} weight="bold" /> Link Policy
                    </Button>
                    <Button
                      onClick={() => setIsAddingPolicy("true")}
                      variant="secondary"
                      size="sm"
                      className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
                    >
                      <Plus size={14} weight="bold" /> Create New
                    </Button>
                  </div>
                }
              >
                <DataFilterBar
                  searchQuery={policySearch}
                  onSearchChange={setPolicySearch}
                  searchPlaceholder="Search policies..."
                  filters={
                    <>
                      <FilterItem
                        label="Main Service"
                        options={[
                          { label: "All Services", value: "all" },
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
                  policies={filteredPolicies as any}
                  onUnlink={handleUnlinkPolicy}
                  onView={(id) => {
                    setViewingPolicyId(id)
                    setEditingPolicyId(null)
                  }}
                  onEdit={(id) => {
                    setEditingPolicyId(id)
                  }}
                />
              </DetailSection>
            )}
          </div>
        )}
        {activeTab === "usage" && (
          <div className="animate-in fade-in">
            <DetailSection
              title="Utilisation & Claims"
              icon={<ChartLineUp size={18} weight="duotone" />}
              description="Benefit usage and claim history across all employees in this organisation"
            >
              <OrganizationClaimsTable data={ORG_MOCK_UTILISATION} />
            </DetailSection>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in space-y-6 fade-in">
            <DetailSection
              title="Danger Zone"
              icon={<Gear size={18} weight="duotone" />}
              description="Confirm how you want to change the organisation lifecycle."
            >
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-nav font-semibold text-foreground">
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

                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-nav font-semibold text-foreground">
                        Suspend Organisation
                      </p>
                      <p className="text-label text-muted-foreground">
                        Pause operations and access until the suspension is
                        lifted.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 text-label"
                      onClick={() => openDangerAction("suspend")}
                    >
                      Suspend
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-nav font-semibold text-foreground">
                        Remove Organisation
                      </p>
                      <p className="text-label text-muted-foreground">
                        Permanently delete the organisation and all linked
                        records.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="h-9 text-label"
                      onClick={() => openDangerAction("remove")}
                    >
                      Remove
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
                  : dangerAction === "suspend"
                    ? "suspended"
                    : "removed"
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
        <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 animate-in items-center gap-3 rounded-lg bg-zinc-900 px-6 py-3 text-white shadow-2xl duration-300 slide-in-from-bottom-4">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-body font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-muted-foreground/60 transition-colors hover:text-white"
          >
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      )}
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

// ─── Mock org-level utilisation data (replace with API) ───────────────────────

const ORG_MOCK_UTILISATION: EmployeeUtilisationRow[] = [
  {
    id: "emp_1",
    name: "Robert Fox",
    empCode: "ACM-001",
    branch: "ACME HQ",
    allocated: 2500,
    used: 1200,
    claims: [
      {
        id: "c1",
        voucherCode: "VCH-2024-0081",
        service: "Gymnasium Facilities",
        provider: "Celebrity Fitness KLCC",
        location: "Kuala Lumpur",
        date: "12 Mar 2024",
        amount: 180,
        status: "Approved",
      },
      {
        id: "c2",
        voucherCode: "VCH-2024-0114",
        service: "Clinical Therapy",
        provider: "Mind & Soul Clinic",
        location: "Mont Kiara",
        date: "20 Mar 2024",
        amount: 320,
        status: "Approved",
      },
      {
        id: "c3",
        voucherCode: "VCH-2024-0198",
        service: "Group Fitness",
        provider: "Ritual Yoga Studio",
        location: "Bangsar",
        date: "01 Apr 2024",
        amount: 95,
        status: "Pending",
      },
      {
        id: "c4",
        voucherCode: "VCH-2024-0211",
        service: "Dietary Counseling",
        provider: "NutriCare Clinic",
        location: "Damansara",
        date: "05 Apr 2024",
        amount: 605,
        status: "Approved",
      },
    ],
  },
  {
    id: "emp_2",
    name: "Jenny Wilson",
    empCode: "ACM-042",
    branch: "ACME Subang Jaya",
    allocated: 2500,
    used: 2125,
    claims: [
      {
        id: "c5",
        voucherCode: "VCH-2024-0033",
        service: "Gymnasium Facilities",
        provider: "Fitness First Subang",
        location: "Subang Jaya",
        date: "03 Jan 2024",
        amount: 200,
        status: "Approved",
      },
      {
        id: "c6",
        voucherCode: "VCH-2024-0057",
        service: "Therapeutic Spa",
        provider: "Hammam Spa & Wellness",
        location: "Shah Alam",
        date: "18 Feb 2024",
        amount: 380,
        status: "Approved",
      },
      {
        id: "c7",
        voucherCode: "VCH-2024-0089",
        service: "Mental Fitness",
        provider: "Calm Studio KL",
        location: "Subang Jaya",
        date: "10 Mar 2024",
        amount: 145,
        status: "Approved",
      },
      {
        id: "c8",
        voucherCode: "VCH-2024-0132",
        service: "Group Fitness",
        provider: "Barry's Bootcamp",
        location: "TTDI",
        date: "22 Mar 2024",
        amount: 200,
        status: "Rejected",
      },
      {
        id: "c9",
        voucherCode: "VCH-2024-0201",
        service: "Clinical Therapy",
        provider: "Therapy Works PJ",
        location: "Petaling Jaya",
        date: "08 Apr 2024",
        amount: 400,
        status: "Approved",
      },
      {
        id: "c10",
        voucherCode: "VCH-2024-0215",
        service: "Dietary Counseling",
        provider: "NutriCare Clinic",
        location: "Subang Jaya",
        date: "10 Apr 2024",
        amount: 800,
        status: "Pending",
      },
    ],
  },
  {
    id: "emp_3",
    name: "Dianne Russell",
    empCode: "ACM-156",
    branch: "ACME HQ",
    allocated: 2500,
    used: 375,
    claims: [
      {
        id: "c11",
        voucherCode: "VCH-2024-0177",
        service: "Therapeutic Spa",
        provider: "Relaxe Spa KL",
        location: "KLCC",
        date: "15 Mar 2024",
        amount: 250,
        status: "Approved",
      },
      {
        id: "c12",
        voucherCode: "VCH-2024-0190",
        service: "Group Fitness",
        provider: "TRX Studio KL",
        location: "Bukit Bintang",
        date: "28 Mar 2024",
        amount: 125,
        status: "Pending",
      },
    ],
  },
  {
    id: "emp_4",
    name: "Marvin McKinney",
    empCode: "ACM-089",
    branch: "ACME Subang Jaya",
    allocated: 2500,
    used: 300,
    claims: [
      {
        id: "c13",
        voucherCode: "VCH-2024-0144",
        service: "Mental Fitness",
        provider: "Headspace Partner KL",
        location: "Online",
        date: "01 Apr 2024",
        amount: 120,
        status: "Approved",
      },
      {
        id: "c14",
        voucherCode: "VCH-2024-0188",
        service: "Clinical Therapy",
        provider: "Mind & Soul Clinic",
        location: "Mont Kiara",
        date: "09 Apr 2024",
        amount: 180,
        status: "Pending",
      },
    ],
  },
]

const EMPLOYEE_SUB_TABS = [
  { id: "directory", label: "Employee Directory", icon: Users },
  { id: "dependents", label: "Dependent Directory", icon: IdentificationCard },
  { id: "entitlements", label: "Entitlements", icon: Scroll },
  { id: "claims", label: "Claims", icon: SealCheck },
] as const

const MOCK_DEPENDENTS = [
  {
    id: "dep_1",
    name: "Sarah Fox",
    employeeName: "Robert Fox",
    employeeId: "emp_1",
    relationship: "Spouse",
    status: "Active",
    joinDate: "12 Oct 2023",
  },
  {
    id: "dep_2",
    name: "Leo Fox",
    employeeName: "Robert Fox",
    employeeId: "emp_1",
    relationship: "Child",
    status: "Active",
    joinDate: "12 Oct 2023",
  },
  {
    id: "dep_3",
    name: "Russell Jr.",
    employeeName: "Dianne Russell",
    employeeId: "emp_3",
    relationship: "Child",
    status: "Active",
    joinDate: "20 May 2026",
  },
]

const MOCK_ENTITLEMENTS = [
  {
    id: "ent_1",
    beneficiaryName: "Robert Fox",
    type: "Employee",
    branch: "ACME HQ",
    policy: "Wellness Allocation",
    status: "Active",
    used: "RM 1,200",
    allocated: "RM 2,500",
  },
  {
    id: "ent_2",
    beneficiaryName: "Sarah Fox",
    type: "Dependent",
    branch: "ACME HQ",
    policy: "Wellness Allocation",
    status: "Active",
    used: "RM 450",
    allocated: "RM 1,000",
  },
  {
    id: "ent_3",
    beneficiaryName: "Leo Fox",
    type: "Dependent",
    branch: "ACME HQ",
    policy: "Wellness Allocation",
    status: "Active",
    used: "RM 120",
    allocated: "RM 1,000",
  },
  {
    id: "ent_4",
    beneficiaryName: "Jenny Wilson",
    type: "Employee",
    branch: "ACME Subang Jaya",
    policy: "Lifestyle Pocket",
    status: "Active",
    used: "RM 2,125",
    allocated: "RM 2,500",
  },
]
