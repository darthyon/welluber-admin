"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  MagnifyingGlass
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { BranchSheet } from "@/components/host/organizations/branch-sheet";
import { InviteAdminModal } from "@/components/host/organizations/invite-admin-modal";
import { Button } from "@/components/ui/button";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { BranchCard } from "@/components/host/organizations/branch-card";
import { BranchDetailView } from "@/components/host/organizations/branch-detail-view";
import { BranchForm } from "@/components/host/organizations/branch-form";
import { EmployeeCard } from "@/components/host/organizations/employee-card";
import { UtilisationClaimsTable, type EmployeeUtilisationRow } from "@/components/shared/utilisation-claims-table";
import { EmployeeDetailView } from "@/components/host/organizations/employee-detail-view";
import { EmployeeForm } from "@/components/host/organizations/employee-form";
import { BulkUploadWizard } from "@/components/host/organizations/bulk-upload-wizard";
import { AssignedPolicyList } from "@/components/host/organizations/assigned-policy-list";
import { LinkPolicyModal } from "@/components/host/organizations/link-policy-modal";
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard";
import { BenefitPolicy } from "@/types/policy";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ActionPopover } from "@/components/shared/action-popover";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { deactivateOrganization, removeOrganization, suspendOrganization } from "@/features/organizations/actions";
import type { OrganizationStatus } from "@/features/organizations/types";

const TABS = [
  { id: "profile", label: "Org Details", icon: Buildings },
  { id: "branches", label: "Branches", icon: Buildings },
  { id: "employees", label: "Employees", icon: Users },
  { id: "policies", label: "Benefit Policy", icon: Shield },
  { id: "usage", label: "Utilization & Claims", icon: ChartLineUp },
  { id: "settings", label: "Settings", icon: Gear },
] as const;

type TabId = typeof TABS[number]["id"];

// Mock Data for Breadcrumb Dropdowns
const OTHER_ORGS = [
  { label: "Acme Corporation Sdn Bhd", href: "/organizations/org_1" },
  { label: "Global Tech Solutions", href: "/organizations/org_2" },
  { label: "Nexus Innovate", href: "/organizations/org_3" },
];

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [orgStatus, setOrgStatus] = useState<OrganizationStatus>("active");
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false);
  const [dangerAction, setDangerAction] = useState<"deactivate" | "suspend" | "remove" | null>(null);

  // View modes
  const [branchesView, setBranchesView] = useState<ViewMode>("grid");
  const [employeesView, setEmployeesView] = useState<ViewMode>("grid");
  const [adminsView, setAdminsView] = useState<ViewMode>("list");
  const [policiesView, setPoliciesView] = useState<ViewMode>("list");

  // Search states
  const [branchSearch, setBranchSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Sub-navigation state (Branches)
  const [viewBranchId, setViewBranchId] = useState<string | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // Sub-navigation state (Employees)
  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Policies state
  const [isLinkPolicyModalOpen, setIsLinkPolicyModalOpen] = useState(false);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [assignedPolicies, setAssignedPolicies] = useState<(BenefitPolicy & { assignedTo: string; employeeCount: number; lastUpdated: string })[]>([
    {
      id: "pol_1",
      name: "Wellness Allocation",
      code: "WELL-2026-HQ",
      description: "Standard wellness benefits for HQ staff including gym and mental health support.",
      eligibility: { roles: ["staff", "management"], employeeTypes: ["full-time"] },
      benefitPoolType: { employee: "Individual" as const, dependents: "None" as const },
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "OrgFY" as const,
      activationMode: "JoinDate" as const,
      status: "Published" as const,
      assignedTo: "All Branches",
      employeeCount: 1240,
      lastUpdated: "24 Mar 2024"
    },
    {
      id: "pol_2",
      name: "Lifestyle Pocket",
      code: "LIFE-2026-SUB",
      description: "Flexible lifestyle benefits for travel, food, and personal development.",
      eligibility: { roles: ["staff"], employeeTypes: ["full-time", "part-time"] },
      benefitPoolType: { employee: "Shared" as const, dependents: "Shared" as const },
      utilisationMode: "Prorated" as const,
      refreshCycle: "Monthly" as const,
      refreshStartReference: "JoinDate" as const,
      activationMode: "ProbationEnds" as const,
      status: "Published" as const,
      assignedTo: "Subang Jaya",
      employeeCount: 450,
      lastUpdated: "02 Apr 2024"
    }
  ]);

  // Mock Groups and Benefits for the Detail Sheet
  const [mockGroups] = useState([
    { id: "g1", policyId: "pol_1", name: "Physical Wellbeing", description: "Standard physical health services", distributionType: "IndividualBenefitAmount" as const },
    { id: "g2", policyId: "pol_1", name: "Mental Fitness", description: "Counseling and meditation support", distributionType: "IndividualBenefitAmount" as const },
    { id: "g3", policyId: "pol_2", name: "Flexi-Benefits", description: "Shared budget for various lifestyle services", distributionType: "SharedAmount" as const, maxUsagePerCycle: 500 },
  ]);
  const [mockBenefits] = useState([
    { id: "b1", groupId: "g1", serviceId: "s1", amount: 200, coPayment: { required: false, type: "Percentage" as const, value: 0 } },
    { id: "b2", groupId: "g2", serviceId: "s4", amount: 150, coPayment: { required: true, type: "Percentage" as const, value: 10 } },
    { id: "b3", groupId: "g3", serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage" as const, value: 0 } },
    { id: "b4", groupId: "g3", serviceId: "s6", amount: 100, coPayment: { required: false, type: "Percentage" as const, value: 0 } },
  ]);

  const handleLinkPolicy = (policyId: string) => {
    // Mock linking logic
    const policyNames: Record<string, string> = {
      "pol_1": "Executive Health Plus",
      "pol_2": "Standard Workforce Pool",
      "pol_3": "Remote Flex Benefits"
    };
    
    const newPolicy = {
      id: policyId,
      name: policyNames[policyId] || "Selected Policy",
      code: `WP-${policyId.split('_')[1].toUpperCase()}-2026`,
      description: "Automatically linked benefit policy.",
      eligibility: { roles: [], employeeTypes: ["full-time"] },
      benefitPoolType: { employee: "Individual" as const, dependents: "None" as const },
      utilisationMode: "Fixed" as const,
      refreshCycle: "Yearly" as const,
      refreshStartReference: "OrgFY" as const,
      activationMode: "JoinDate" as const,
      status: "Published" as const,
      assignedTo: "All Branches",
      employeeCount: 0,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setAssignedPolicies([...assignedPolicies, newPolicy]);
    setToastMessage("Policy linked successfully");
  };

  const handleUnlinkPolicy = (id: string) => {
    setAssignedPolicies(assignedPolicies.filter(p => p.id !== id));
    setToastMessage("Policy unlinked from organization");
  };

  const openDangerAction = (action: "deactivate" | "suspend" | "remove") => {
    setDangerAction(action);
    setIsDangerModalOpen(true);
  };

  const dangerActionConfig = {
    deactivate: {
      title: "Deactivate Organization",
      confirmLabel: "Deactivate Organization",
      description: "Temporarily disable this organization without removing its records.",
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
      description: "Suspend operations while keeping the organization data available for recovery.",
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
      description: "Permanently remove this organization and all associated records.",
      impactPoints: [
        "Branches, employees, policies, and admins will be removed from the workspace.",
        "This action cannot be undone.",
        "Any dependent references in reporting will be severed.",
      ],
      run: () => removeOrganization(orgId),
    },
  } as const;

  const orgName = orgId === 'org_2' ? 'Global Tech Solutions' : 'Acme Corporation Sdn Bhd';

  return (
    <div className="pb-12">
      <InviteAdminModal 
        targetId={orgId} 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />

      <LinkPolicyModal 
        isOpen={isLinkPolicyModalOpen}
        onClose={() => setIsLinkPolicyModalOpen(false)}
        onLink={handleLinkPolicy}
      />


      <BranchSheet 
        isOpen={isBranchSheetOpen}
        onClose={() => setIsBranchSheetOpen(false)}
        branchName={selectedBranchName}
      />

      {/* Header Banner */}
      <div className="bg-card border-b border-border -mx-6 -mt-6 px-6 pt-6 relative z-30">
        <div className="max-w-[1200px] mx-auto py-6 lg:px-2">
          <Breadcrumbs 
            items={[
              { label: "Organisations", href: "/organizations" },
              { 
                label: orgName, 
                options: OTHER_ORGS.filter(o => o.label !== orgName)
              }
            ]}
            className="mb-4"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-15 h-15 rounded-2xl bg-zinc-100/80 flex items-center justify-center text-zinc-500 border border-zinc-200/60 transition-all">
                <Buildings size={32} weight="fill" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{orgName}</h1>
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
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                  <span className="font-mono text-[11px] text-zinc-400 bg-white px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-widest">ORG-20260115-0001</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="lg" className="text-[13px] font-medium rounded-full transition-all">
                <Link href={`/organizations/${orgId}/edit`}>
                  <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
                  Edit Organisation
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-8 border-b border-border">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Reset subviews when switching main tabs
                    setViewBranchId(null);
                    setViewEmployeeId(null);
                    setIsBulkUploading(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 py-3 border-b-2 text-[14px] font-medium transition-all duration-300",
                    isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} className={cn("transition-colors", isActive && "text-primary")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1200px] mx-auto p-6 lg:p-8">
        
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Account Details */}
            <DetailSection 
              title="Account Details" 
              icon={<Buildings size={18} weight="duotone" />}
              description="Basic information about the organization"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                <DetailField label="Registration No." value="1234567-T" />
                <DetailField label="Industry" value="Technology" />
                <DetailField label="Sub-industry" value="Software Development" />
                <DetailField label="Financial Year Start Date" value="01 January" />
                <DetailField label="Organisation Type" value="SME" />
              </div>
            </DetailSection>

            {/* Tax & Banking Details */}
            <DetailSection 
              title="Tax & Banking" 
              icon={<CreditCard size={18} weight="duotone" />}
              description="Financial reporting and settlement identifiers"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                <DetailField label="TIN No." value="TR-882910-01" />
                <DetailField label="Bank Name" value="Maybank Berhad" />
                <DetailField label="Account Number" value="5140 1234 5678" />
                <DetailField label="Account Name" value="Acme Corporation Sdn Bhd" />
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
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 text-[12px] font-medium h-8"
                  >
                    <Plus size={14} weight="bold" /> Send Invite
                  </Button>
                  <div className="h-4 w-[1px] bg-border mx-1" />
                  <ViewToggle mode={adminsView} onChange={setAdminsView} />
                </div>
              }
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Name</th>
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Email</th>
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Role</th>
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Branch</th>
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Status</th>
                      <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4 text-[13px] font-medium text-foreground">John Doe</td>
                      <td className="p-4 text-[13px] text-muted-foreground">john.doe@acme.com</td>
                      <td className="p-4 text-[13px] text-muted-foreground">Org Admin</td>
                      <td className="p-4 text-[12px]">
                        <button 
                          onClick={() => {
                            setActiveTab("branches");
                            setViewBranchId("br_1");
                          }}
                          className="text-primary hover:underline font-medium"
                        >
                          ACME HQ
                        </button>
                      </td>
                      <td className="p-4">
                        <StatusBadge status="Active" variant="emerald" />
                      </td>
                      <td className="p-4 text-right">
                        <ActionPopover 
                          actions={[
                            { label: "Resend Invite", onClick: () => console.log("Resend") },
                            { label: "Revoke Access", isDanger: true, onClick: () => console.log("Revoke") }
                          ]}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DetailSection>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === "branches" && (
          <div className="animate-in fade-in transition-all duration-300">
            {isAddingBranch || editingBranchId ? (
              <BranchForm 
                branchId={editingBranchId}
                onCancel={() => {
                  setIsAddingBranch(false);
                  setEditingBranchId(null);
                }}
                onSubmit={() => {
                  setIsAddingBranch(false);
                  setEditingBranchId(null);
                  setToastMessage(editingBranchId ? "Branch updated successfully" : "Branch created successfully");
                }}
              />
            ) : viewBranchId ? (
              <BranchDetailView 
                branchId={viewBranchId} 
                onBack={() => setViewBranchId(null)} 
                onEdit={() => {
                  setEditingBranchId(viewBranchId);
                  setViewBranchId(null);
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
                        onClick={() => setIsAddingBranch(true)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 text-[12px] font-medium rounded-full h-8"
                      >
                        <Plus size={14} weight="bold" /> Add Branch
                      </Button>
                      <div className="h-4 w-[1px] bg-border mx-1" />
                      <ViewToggle mode={branchesView} onChange={setBranchesView} />
                    </div>
                  }
                >
                  <DataToolbarContainer 
                    search={
                      <SearchBar 
                        placeholder="Search branches..." 
                        value={branchSearch} 
                        onChange={setBranchSearch} 
                      />
                    }
                    filters={
                      <>
                        <FilterItem 
                          label="Region" 
                          value="all"
                          onChange={() => {}}
                          options={[
                            { label: "All States", value: "all" },
                            { label: "Selangor", value: "sel" },
                            { label: "Kuala Lumpur", value: "kl" }
                          ]} 
                        />
                        <FilterItem 
                          label="Status" 
                          value="all"
                          onChange={() => {}}
                          options={[
                            { label: "All", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" }
                          ]} 
                        />
                      </>
                    }
                    className="mb-6 px-0"
                  />

                  {branchesView === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <BranchCard 
                        branch={{
                          id: "br_1",
                          name: "ACME HQ (Kuala Lumpur)",
                          type: "HQ",
                          walletModel: "Cash Balance",
                          address: { city: "Kuala Lumpur", state: "Wilayah Persekutuan" },
                          employeesCount: 1240,
                          status: "Active",
                          balance: "RM 45,000.00",
                          utilizationRate: 68
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
                          utilizationRate: 42
                        }}
                        onView={() => setViewBranchId("br_2")}
                        onEdit={() => setEditingBranchId("br_2")}
                      />
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/20">
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap">Branch Name</th>
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap">Status</th>
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap">Type</th>
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap">Employees</th>
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap">Wallet</th>
                            <th className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider p-4 text-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {[
                            { id: "br_1", name: "ACME HQ (Kuala Lumpur)", type: "HQ", status: "Active", employees: 1240, walletModel: "Single Wallet", balance: "RM 45,000" },
                            { id: "br_2", name: "ACME Subang Jaya", type: "Branch", status: "Active", employees: 450, walletModel: "Existing Wallet", balance: "RM 12,500" }
                          ].map((branch) => (
                            <tr key={branch.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setViewBranchId(branch.id)}>
                              <td className="p-4 text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{branch.name}</td>
                              <td className="p-4"><StatusBadge status={branch.status} variant="emerald" /></td>
                              <td className="p-4 text-[13px] text-muted-foreground">{branch.type}</td>
                              <td className="p-4 text-[13px] text-muted-foreground">{branch.employees}</td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-[12px] font-medium text-foreground">{branch.walletModel}</span>
                                  <span className="text-[11px] text-muted-foreground">{branch.balance}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <ActionPopover 
                                  actions={[
                                    { label: "View Details", onClick: () => setViewBranchId(branch.id) },
                                    { label: "Edit Branch", onClick: () => setEditingBranchId(branch.id) },
                                    { label: "Deactivate", isDanger: true }
                                  ]}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </DetailSection>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="animate-in fade-in transition-all duration-300">
            {isBulkUploading ? (
              <BulkUploadWizard 
                onBack={() => setIsBulkUploading(false)} 
                onSuccess={() => setIsBulkUploading(false)}
              />
            ) : isAddingEmployee || editingEmployeeId ? (
              <EmployeeForm
                employeeId={editingEmployeeId}
                onCancel={() => {
                  setIsAddingEmployee(false);
                  setEditingEmployeeId(null);
                }}
                onSuccess={() => {
                  setIsAddingEmployee(false);
                  setEditingEmployeeId(null);
                  setToastMessage(editingEmployeeId ? "Employee updated successfully" : "Employee registered successfully");
                }}
              />
            ) : viewEmployeeId ? (
              <EmployeeDetailView 
                employeeId={viewEmployeeId} 
                onBack={() => setViewEmployeeId(null)}
                onEdit={(id) => {
                  setEditingEmployeeId(id);
                  setViewEmployeeId(null);
                }}
              />
            ) : (
              <div className="space-y-6">
                <DetailSection 
                  title="Employee Directory" 
                  icon={<Users size={18} weight="duotone" />}
                  description="Manage workforce records and branch assignments"
                  action={
                    <div className="flex items-center gap-2">
                       <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-[12px] font-medium h-8 gap-1.5"
                        onClick={() => setIsBulkUploading(true)}
                      >
                        <Upload size={14} weight="bold" /> Bulk Upload
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-[12px] font-medium h-8 gap-1.5"
                        onClick={() => setIsAddingEmployee(true)}
                      >
                        <Plus size={14} weight="bold" /> Add Employee
                      </Button>
                      <div className="h-4 w-[1px] bg-border mx-1" />
                      <ViewToggle mode={employeesView} onChange={setEmployeesView} />
                    </div>
                  }
                >
                  <DataToolbarContainer 
                    search={
                      <SearchBar 
                        placeholder="Search employees..." 
                        value={employeeSearch} 
                        onChange={setEmployeeSearch} 
                      />
                    }
                    filters={
                      <>
                        <FilterItem 
                          label="Status" 
                          value="all" 
                          onChange={() => {}} 
                          options={[
                            { label: "All", value: "all" },
                            { label: "Linked", value: "linked" },
                            { label: "Pending", value: "pending" }
                          ]} 
                        />
                        <FilterItem 
                          label="Needs Action" 
                          value="all" 
                          onChange={() => {}} 
                          options={[
                            { label: "None", value: "all" },
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
                            { label: "ACME Subang", value: "subang" }
                          ]} 
                        />
                      </>
                    }
                    className="mb-6 px-0"
                  />

                  {employeesView === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { id: "emp_1", name: "Robert Fox", email: "robert.f@acme.com", branch: "ACME HQ", status: "Linked", empCode: "ACM-001", joinDate: "12 Oct 2023", dependentsCount: 2, benefitPolicies: [{ policyName: "Wellness Allocation", benefitGroups: ["Gym Membership", "Mental Health"], utilisation: 48 }, { policyName: "Corporate Perks", benefitGroups: ["Book Allowance", "Home Office"], utilisation: 10 }] },
                        { id: "emp_2", name: "Jenny Wilson", email: "jenny.w@acme.com", branch: "ACME Subang Jaya", status: "Linked", empCode: "ACM-042", joinDate: "05 Mar 2024", dependentsCount: 0, benefitPolicies: [{ policyName: "Lifestyle Pocket", benefitGroups: ["Travel", "Food"], utilisation: 85 }] },
                        { id: "emp_3", name: "Dianne Russell", email: "dianne.r@acme.com", branch: "ACME HQ", status: "Pending Invite", empCode: "ACM-156", joinDate: "20 May 2026", dependentsCount: 1, benefitPolicies: [{ policyName: "Rejuvenation Fund", benefitGroups: ["Spa Sessions", "Massages", "Facials", "Manicures", "Pedicures", "Aromatherapy", "Hot Stone"], utilisation: 15 }] }
                      ].map((emp) => (
                        <EmployeeCard 
                          key={emp.id} 
                          employee={emp as any} 
                          onView={(id) => setViewEmployeeId(id)}
                          onEdit={(id) => setEditingEmployeeId(id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <TooltipProvider>
                      <SharedDataTable 
                        onRowClick={(emp) => setViewEmployeeId(emp.id)}
                        columns={[
                          {
                            header: "Employee",
                            render: (emp) => (
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{emp.name}</span>
                                <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{emp.email}</span>
                              </div>
                            )
                          },
                          {
                            header: "ID / Code",
                            render: (emp) => <span className="text-[13px] font-medium text-muted-foreground">{emp.empCode}</span>
                          },
                          {
                            header: "Branch",
                            render: (emp) => <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100/80 text-zinc-600 border border-zinc-200">{emp.branch}</span>
                          },
                          {
                            header: "Policies",
                            render: (emp) => (
                              <div className="flex flex-wrap items-center gap-1 overflow-visible max-w-[280px]">
                                {emp.benefitPolicies && emp.benefitPolicies.length > 0 ? (
                                  <>
                                    {emp.benefitPolicies.slice(0, 2).map((policy: any, idx: number) => (
                                      <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                          <div className="bg-primary/5 text-primary border border-primary/20 font-semibold text-[12px] px-2 py-0.5 rounded-md whitespace-nowrap flex items-center cursor-help transition-colors hover:bg-primary/10">
                                            {policy.policyName}
                                            {policy.benefitGroups && policy.benefitGroups.length > 0 && (
                                              <span className="ml-1 text-muted-foreground/80 font-medium truncate max-w-[80px]">
                                                ({policy.benefitGroups.length})
                                              </span>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="w-56 p-2 z-[200]">
                                          <div className="flex flex-col gap-1.5">
                                            <div className="text-[12px] font-bold text-foreground">
                                              {policy.policyName}
                                            </div>
                                            {policy.benefitGroups && policy.benefitGroups.length > 0 ? (
                                              <div className="text-[11px] text-muted-foreground leading-snug">
                                                {policy.benefitGroups.join(", ")}
                                              </div>
                                            ) : (
                                              <div className="text-[11px] text-muted-foreground italic">No specific groups.</div>
                                            )}
                                            {policy.utilisation !== undefined && (
                                              <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                                                {policy.utilisation}% Utilized
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
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[11px] text-muted-foreground hover:text-primary font-bold px-1 transition-colors cursor-help"
                                          >
                                            +{emp.benefitPolicies.length - 2}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="w-56 p-2 z-[200] flex flex-col gap-2">
                                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60 px-1">Other Policies</div>
                                          {emp.benefitPolicies.slice(2).map((policy: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-1.5 border-b border-border/50 pb-2.5 px-1 last:border-0 last:pb-0">
                                              <div className="text-[12px] font-bold text-foreground mt-1">
                                                {policy.policyName}
                                              </div>
                                              {policy.benefitGroups && policy.benefitGroups.length > 0 ? (
                                                <div className="text-[11px] text-muted-foreground leading-snug">
                                                  {policy.benefitGroups.join(", ")}
                                                </div>
                                              ) : (
                                                <div className="text-[11px] text-muted-foreground italic">No specific groups.</div>
                                              )}
                                              {policy.utilisation !== undefined && (
                                                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                                                  {policy.utilisation}% Utilized
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/50 font-medium italic">None</span>
                                )}
                              </div>
                            )
                          },
                          {
                            header: "Status",
                            render: (emp) => <StatusBadge status={emp.status} variant={emp.status === "Linked" ? "emerald" : "amber"} />
                          },
                          {
                            header: "Actions",
                            align: "right",
                            render: (emp) => (
                              <ActionPopover 
                                actions={[
                                  { label: "View Employee", onClick: () => setViewEmployeeId(emp.id) },
                                  { label: "Edit Employee", onClick: () => { setEditingEmployeeId(emp.id); setViewEmployeeId(null); } },
                                  { label: "Terminate Link", isDanger: true }
                                ]}
                              />
                            )
                          }
                        ]}
                        data={[
                          { id: "emp_1", name: "Robert Fox", email: "robert.f@acme.com", branch: "ACME HQ", status: "Linked", empCode: "ACM-001", benefitPolicies: [{ policyName: "Wellness Allocation", benefitGroups: ["Gym", "Mental Health"], utilisation: 48 }, { policyName: "Corporate Perks" }] },
                          { id: "emp_2", name: "Jenny Wilson", email: "jenny.w@acme.com", branch: "ACME Subang Jaya", status: "Linked", empCode: "ACM-042", benefitPolicies: [{ policyName: "Lifestyle Pocket", benefitGroups: ["Food", "Travel"], utilisation: 85 }] },
                          { id: "emp_3", name: "Dianne Russell", email: "dianne.r@acme.com", branch: "ACME HQ", status: "Pending", empCode: "ACM-156", benefitPolicies: [{ policyName: "Rejuvenation Fund", benefitGroups: ["Spa Sessions", "Massages", "Facials", "Manicures", "Pedicures", "Aromatherapy", "Hot Stone"], utilisation: 15 }] },
                          { id: "emp_4", name: "Marvin McKinney", email: "marvin@acme.com", branch: "ACME Subang Jaya", status: "Linked", empCode: "ACM-089", benefitPolicies: [{ policyName: "Mental Health Support", benefitGroups: ["Counseling", "Meditation Apps"], utilisation: 12 }, { policyName: "Development Fund"}, { policyName: "WFH Allowance"}, { policyName: "Wellness Extras"}] },
                        ]}
                      />
                    </TooltipProvider>
                  )}
                </DetailSection>
              </div>
            )}
          </div>
        )}

        {/* Other tabs placeholders */}
        {/* Benefit Policies Tab */}
        {activeTab === "policies" && (
          <div className="animate-in fade-in transition-all duration-300">
            {isCreatingPolicy ? (
              <BenefitPolicyWizard 
                  mode={viewingPolicyId ? "view" : editingPolicyId ? "edit" : "create"}
                  initialData={
                    (viewingPolicyId || editingPolicyId) ? {
                      policy: assignedPolicies.find(p => p.id === (viewingPolicyId || editingPolicyId))!,
                      groups: mockGroups.filter(g => g.policyId === (viewingPolicyId || editingPolicyId)),
                      benefits: mockBenefits.filter(b => mockGroups.some(g => g.id === b.groupId && g.policyId === (viewingPolicyId || editingPolicyId)))
                    } : undefined
                  }
                  onEdit={() => {
                    if (viewingPolicyId) {
                      setEditingPolicyId(viewingPolicyId);
                      setViewingPolicyId(null);
                    }
                  }}
                  onCancel={() => {
                    setIsCreatingPolicy(false);
                    setViewingPolicyId(null);
                    setEditingPolicyId(null);
                  }}
                  onSaveDraft={(data) => {
                    setToastMessage("Policy saved as draft");
                    setIsCreatingPolicy(false);
                    setEditingPolicyId(null);
                    setViewingPolicyId(null);
                  }}
                  onSuccess={(data) => {
                    if (editingPolicyId) {
                      setAssignedPolicies(prev => prev.map(p => p.id === editingPolicyId ? { ...p, ...data.policy } : p));
                      setToastMessage("Policy updated successfully");
                    } else {
                      handleLinkPolicy(data.policy.id || "new_pol");
                    }
                    setIsCreatingPolicy(false);
                    setEditingPolicyId(null);
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
                      onClick={() => setIsLinkPolicyModalOpen(true)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-[12px] font-medium rounded-full h-8 px-4"
                    >
                      <Plus size={14} weight="bold" /> Link Policy
                    </Button>
                    <Button 
                      onClick={() => setIsCreatingPolicy(true)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-[12px] font-medium rounded-full h-8 px-4"
                    >
                      <Plus size={14} weight="bold" /> Create New
                    </Button>
                  </div>
                }
              >
                <AssignedPolicyList 
                  policies={assignedPolicies as any} 
                  onUnlink={handleUnlinkPolicy}
                  onView={(id) => {
                    setViewingPolicyId(id);
                    setEditingPolicyId(null);
                    setIsCreatingPolicy(true);
                  }}
                  onEdit={(id) => {
                    setEditingPolicyId(id);
                    setViewingPolicyId(null);
                    setIsCreatingPolicy(true);
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
              <UtilisationClaimsTable data={ORG_MOCK_UTILISATION} />
            </DetailSection>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in">
            <DetailSection
              title="Danger Zone"
              icon={<Gear size={18} weight="duotone" />}
              description="Confirm how you want to change the organisation lifecycle."
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[13px] font-semibold text-foreground">Deactivate Organisation</p>
                      <p className="text-[12px] text-muted-foreground">
                        Disable access temporarily while keeping data intact.
                      </p>
                    </div>
                    <Button variant="outline" className="text-[12px] h-9" onClick={() => openDangerAction("deactivate")}>
                      Deactivate
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[13px] font-semibold text-foreground">Suspend Organisation</p>
                      <p className="text-[12px] text-muted-foreground">
                        Pause operations and access until the suspension is lifted.
                      </p>
                    </div>
                    <Button variant="outline" className="text-[12px] h-9" onClick={() => openDangerAction("suspend")}>
                      Suspend
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[13px] font-semibold text-foreground">Remove Organisation</p>
                      <p className="text-[12px] text-muted-foreground">
                        Permanently delete the organisation and all linked records.
                      </p>
                    </div>
                    <Button variant="destructive" className="text-[12px] h-9" onClick={() => openDangerAction("remove")}>
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
        title={dangerAction ? dangerActionConfig[dangerAction].title : "Confirm Action"}
        description={dangerAction ? dangerActionConfig[dangerAction].description : "Review the impact before proceeding."}
        impactPoints={dangerAction ? dangerActionConfig[dangerAction].impactPoints : []}
        confirmLabel={dangerAction ? dangerActionConfig[dangerAction].confirmLabel : "Confirm"}
        isSubmitting={isDangerSubmitting}
        onClose={() => {
          setIsDangerModalOpen(false);
          setDangerAction(null);
        }}
        onConfirm={async () => {
          if (!dangerAction) return;
          setIsDangerSubmitting(true);
          try {
            const res = await dangerActionConfig[dangerAction].run();
            if (res.success) {
              setOrgStatus(
                dangerAction === "deactivate" ? "deactivated" : dangerAction === "suspend" ? "suspended" : "removed"
              );
              setToastMessage(res.message);
              setIsDangerModalOpen(false);
              setDangerAction(null);
            }
          } finally {
            setIsDangerSubmitting(false);
          }
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-4 text-zinc-400 hover:text-white transition-colors">
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mock org-level utilisation data (replace with API) ───────────────────────

const ORG_MOCK_UTILISATION: EmployeeUtilisationRow[] = [
  {
    id: "emp_1", name: "Robert Fox", empCode: "ACM-001", branch: "ACME HQ",
    allocated: 2500, used: 1200,
    claims: [
      { id: "c1",  voucherCode: "VCH-2024-0081", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC",  location: "Kuala Lumpur",  date: "12 Mar 2024", amount: 180, status: "Approved" },
      { id: "c2",  voucherCode: "VCH-2024-0114", service: "Clinical Therapy",     provider: "Mind & Soul Clinic",      location: "Mont Kiara",    date: "20 Mar 2024", amount: 320, status: "Approved" },
      { id: "c3",  voucherCode: "VCH-2024-0198", service: "Group Fitness",        provider: "Ritual Yoga Studio",      location: "Bangsar",       date: "01 Apr 2024", amount: 95,  status: "Pending"  },
      { id: "c4",  voucherCode: "VCH-2024-0211", service: "Dietary Counseling",   provider: "NutriCare Clinic",        location: "Damansara",     date: "05 Apr 2024", amount: 605, status: "Approved" },
    ],
  },
  {
    id: "emp_2", name: "Jenny Wilson", empCode: "ACM-042", branch: "ACME Subang Jaya",
    allocated: 2500, used: 2125,
    claims: [
      { id: "c5",  voucherCode: "VCH-2024-0033", service: "Gymnasium Facilities", provider: "Fitness First Subang",    location: "Subang Jaya",   date: "03 Jan 2024", amount: 200, status: "Approved" },
      { id: "c6",  voucherCode: "VCH-2024-0057", service: "Therapeutic Spa",      provider: "Hammam Spa & Wellness",  location: "Shah Alam",     date: "18 Feb 2024", amount: 380, status: "Approved" },
      { id: "c7",  voucherCode: "VCH-2024-0089", service: "Mental Fitness",       provider: "Calm Studio KL",         location: "Subang Jaya",   date: "10 Mar 2024", amount: 145, status: "Approved" },
      { id: "c8",  voucherCode: "VCH-2024-0132", service: "Group Fitness",        provider: "Barry's Bootcamp",       location: "TTDI",          date: "22 Mar 2024", amount: 200, status: "Rejected" },
      { id: "c9",  voucherCode: "VCH-2024-0201", service: "Clinical Therapy",     provider: "Therapy Works PJ",       location: "Petaling Jaya", date: "08 Apr 2024", amount: 400, status: "Approved" },
      { id: "c10", voucherCode: "VCH-2024-0215", service: "Dietary Counseling",   provider: "NutriCare Clinic",       location: "Subang Jaya",   date: "10 Apr 2024", amount: 800, status: "Pending"  },
    ],
  },
  {
    id: "emp_3", name: "Dianne Russell", empCode: "ACM-156", branch: "ACME HQ",
    allocated: 2500, used: 375,
    claims: [
      { id: "c11", voucherCode: "VCH-2024-0177", service: "Therapeutic Spa", provider: "Relaxe Spa KL", location: "KLCC",          date: "15 Mar 2024", amount: 250, status: "Approved" },
      { id: "c12", voucherCode: "VCH-2024-0190", service: "Group Fitness",   provider: "TRX Studio KL", location: "Bukit Bintang", date: "28 Mar 2024", amount: 125, status: "Pending"  },
    ],
  },
  {
    id: "emp_4", name: "Marvin McKinney", empCode: "ACM-089", branch: "ACME Subang Jaya",
    allocated: 2500, used: 300,
    claims: [
      { id: "c13", voucherCode: "VCH-2024-0144", service: "Mental Fitness",   provider: "Headspace Partner KL", location: "Online",     date: "01 Apr 2024", amount: 120, status: "Approved" },
      { id: "c14", voucherCode: "VCH-2024-0188", service: "Clinical Therapy", provider: "Mind & Soul Clinic",   location: "Mont Kiara", date: "09 Apr 2024", amount: 180, status: "Pending"  },
    ],
  },
];
