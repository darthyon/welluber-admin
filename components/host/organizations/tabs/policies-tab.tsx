"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "@phosphor-icons/react"
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence"
import { Spinner } from "@/components/shared/spinner"
import { Button } from "@/components/ui/button"
import { AssignedPolicyList } from "@/components/host/organizations/assigned-policy-list"
import { AssignPolicyModal } from "@/components/host/organizations/assign-policy-modal"
import { PolicyDetailView } from "@/components/host/policies/policy-detail-view"
import { PolicyCreationLauncher } from "@/components/host/policies/policy-creation-launcher"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { useOrgWorkforce } from "@/hooks/use-org-workforce"
import type { BenefitGroup, Benefit } from "@/types/policy"
import type { AssignedPolicy } from "@/components/host/organizations/constants"
import { INITIAL_MOCK_GROUPS, INITIAL_MOCK_BENEFITS } from "./policies-mock-data"

interface PoliciesTabProps {
  orgId: string
  assignedPolicies: AssignedPolicy[]
  onAssign: (policyId: string) => void
  onUnassign: (id: string) => void
  onToast: (msg: string) => void
}

export function PoliciesTab({
  orgId,
  assignedPolicies,
  onAssign,
  onUnassign,
  onToast,
}: PoliciesTabProps) {
  const router = useRouter()
  const updateQueryParams = useUpdateQueryParams()
  const { employees } = useOrgWorkforce(orgId)

  const [policySearch, setPolicySearch] = useQueryState("policySearch", "")
  const [policyStatusFilter, setPolicyStatusFilter] = useQueryState("policyStatus", "all")
  const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useQueryState("assignPolicy")
  const [isAddingPolicy] = useQueryState("addPolicy")
  const [viewingPolicyId, setViewingPolicyId] = useQueryState("viewingPolicyId")
  const [editingPolicyId] = useQueryState("editingPolicyId")

  const [policyFilters, setPolicyFilters] = useState({
    department: "all",
    role: "all",
    mainService: "all",
    benefitGroup: "all",
  })
  const [mockGroups] = useState<BenefitGroup[]>(INITIAL_MOCK_GROUPS)
  const [mockBenefits] = useState<Benefit[]>(INITIAL_MOCK_BENEFITS)

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

      return matchesSearch && matchesStatus && matchesService && matchesGroup
    })
  }, [assignedPolicies, policySearch, policyStatusFilter, policyFilters])

  useEffect(() => {
    if (isAddingPolicy === "true") {
      router.replace(
        `/policies/new?source=org&orgId=${encodeURIComponent(orgId)}`
      )
    }
  }, [isAddingPolicy, orgId, router])

  useEffect(() => {
    if (editingPolicyId) {
      router.replace(
        `/policies/${encodeURIComponent(editingPolicyId)}/edit?source=org&orgId=${encodeURIComponent(orgId)}`
      )
    }
  }, [editingPolicyId, orgId, router])

  if (viewingPolicyId) {
    return (
      <div className="animate-in transition-all duration-300 fade-in">
        <PolicyDetailView
          key={viewingPolicyId}
          headerVariant="embedded"
          policy={assignedPolicies.find((p) => p.id === viewingPolicyId)!}
          groups={mockGroups.filter((g) => g.policyId === viewingPolicyId)}
          benefits={mockBenefits.filter((b) =>
            mockGroups.some(
              (g) => g.id === b.groupId && g.policyId === viewingPolicyId
            )
          )}
          employees={employees}
          onEdit={() =>
            router.push(
              `/policies/${encodeURIComponent(viewingPolicyId)}/edit?source=org&orgId=${encodeURIComponent(orgId)}`
            )
          }
          onClone={() => {
            const p = assignedPolicies.find((p) => p.id === viewingPolicyId)
            if (p) {
              onToast(`Cloned from ${p.name} — open Host Policies to edit`)
              setViewingPolicyId(null)
            }
          }}
          onDeactivate={() => {
            onUnassign(viewingPolicyId)
            onToast("Policy deactivated")
            setViewingPolicyId(null)
          }}
          onDelete={() => {
            onUnassign(viewingPolicyId)
            onToast("Policy unassigned from organisation")
            setViewingPolicyId(null)
          }}
        />
      </div>
    )
  }

  if (isAddingPolicy || editingPolicyId) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-card px-6 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner className="h-5 w-5" />
          <div className="space-y-1">
            <p className="text-body font-semibold text-foreground">
              Opening Policy Builder
            </p>
            <p className="text-label text-muted-foreground">
              Redirecting to the updated benefit policy flow.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in transition-all duration-300 fade-in">
      <AssignPolicyModal
        isOpen={isAssignPolicyModalOpen === "true"}
        onClose={() => setIsAssignPolicyModalOpen(null)}
        onAssign={(id) => {
          onAssign(id)
          setIsAssignPolicyModalOpen(null)
        }}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading font-semibold text-foreground">
              Benefit Policies
            </h2>
            <p className="text-body text-subtle">
              Manage which benefit structures are assigned to this
              organisation&apos;s workforce
            </p>
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
              onManual={(oid) =>
                router.push(
                  `/policies/new?source=org&orgId=${encodeURIComponent(oid ?? orgId)}`
                )
              }
              onTemplate={(tid, oid) =>
                router.push(
                  `/policies/new?source=org&template=${encodeURIComponent(tid)}&orgId=${encodeURIComponent(oid ?? orgId)}`
                )
              }
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
                  { label: "Physical Wellbeing", value: "Physical Wellbeing" },
                  { label: "Psychological", value: "Psychological Wellbeing" },
                  { label: "Nutritional", value: "Nutritional Support" },
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
                  setPolicyFilters({ ...policyFilters, benefitGroup: v })
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
          onUnassign={onUnassign}
          onView={(id) => {
            updateQueryParams({
              viewingPolicyId: id,
              editingPolicyId: null,
              addPolicy: null,
            })
          }}
          onEdit={(id) => {
            router.push(
              `/policies/${encodeURIComponent(id)}/edit?source=org&orgId=${encodeURIComponent(orgId)}`
            )
          }}
        />
      </div>
    </div>
  )
}
