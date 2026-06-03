"use client"

import { useState } from "react"
import { Shield, Gear, Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { OrgStructureConfig } from "@/components/host/organizations/org-structure-config"
import {
  deactivateOrganization,
  suspendOrganization,
} from "@/features/organizations/actions"
import type { OrganizationStatus, Organization } from "@/features/organizations/types"
import { MOCK_ADMINS } from "./settings-mock-data"

interface SettingsTabProps {
  orgId: string
  mockOrg: Pick<Organization, "tierConfigs" | "departmentConfigs"> | undefined
  onInviteAdmin: () => void
  onNavigateToBranch: (branchId: string) => void
  onStatusChange: (status: OrganizationStatus) => void
  onToast: (msg: string) => void
}

export function SettingsTab({
  orgId,
  mockOrg,
  onInviteAdmin,
  onNavigateToBranch,
  onStatusChange,
  onToast,
}: SettingsTabProps) {
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false)
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false)
  const [dangerAction, setDangerAction] = useState<"deactivate" | "suspend" | null>(null)

  const dangerActionConfig = {
    deactivate: {
      title: "Deactivate Organisation",
      confirmLabel: "Deactivate Organisation",
      description: "Temporarily disable this organisation without removing its records.",
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
      description: "Suspend operations while keeping the organisation data available for recovery.",
      impactPoints: [
        "Admins can no longer manage employees, policies, or wallet activity.",
        "Active operations are paused until the suspension is lifted.",
        "Historical records remain available for audit and review.",
      ],
      run: () => suspendOrganization(orgId),
    },
  } as const

  const openDangerAction = (action: "deactivate" | "suspend") => {
    setDangerAction(action)
    setIsDangerModalOpen(true)
  }

  return (
    <div className="animate-in space-y-6 fade-in">
      <DetailSection
        title="Admin Management"
        icon={<Shield size={18} weight="duotone" />}
        description="Manage administrator access for this organisation"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={onInviteAdmin}
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
                <span className="text-body text-subtle">{admin.email}</span>
              ),
            },
            {
              header: "Role",
              accessorKey: "role",
              sortable: true,
              render: () => <StatusBadge status="Admin" variant="emerald" />,
            },
            {
              header: "Branch",
              accessorKey: "branchName",
              sortable: true,
              render: (admin: { branchId: string; branchName: string }) => (
                <button
                  onClick={() => onNavigateToBranch(admin.branchId)}
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
                    { label: "Resend Invite", onClick: () => {} },
                    { label: "Revoke Access", isDanger: true, onClick: () => {} },
                  ]}
                />
              ),
            },
          ]}
          data={MOCK_ADMINS}
        />
      </DetailSection>

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

      <ConfirmationModal
        isOpen={isDangerModalOpen}
        title={dangerAction ? dangerActionConfig[dangerAction].title : "Confirm Action"}
        description={
          dangerAction
            ? dangerActionConfig[dangerAction].description
            : "Review the impact before proceeding."
        }
        impactPoints={dangerAction ? dangerActionConfig[dangerAction].impactPoints : []}
        confirmLabel={
          dangerAction ? dangerActionConfig[dangerAction].confirmLabel : "Confirm"
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
              onStatusChange(dangerAction === "deactivate" ? "deactivated" : "suspended")
              onToast(res.message)
              setIsDangerModalOpen(false)
              setDangerAction(null)
            }
          } finally {
            setIsDangerSubmitting(false)
          }
        }}
      />
    </div>
  )
}
