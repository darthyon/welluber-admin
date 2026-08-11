"use client"

import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { useAdmins } from "@/hooks/data-hooks"
import type { Administrator } from "@/features/users/types"

interface DeactivateAdminDialogProps {
  /** The administrator awaiting confirmation, or null when closed. */
  admin: Administrator | null
  onClose: () => void
  onDeactivated?: (admin: Administrator) => void
}

export function DeactivateAdminDialog({
  admin,
  onClose,
  onDeactivated,
}: DeactivateAdminDialogProps) {
  const { update } = useAdmins()

  if (!admin) return null

  const scope = admin.entity?.name ?? "the Welluber platform"

  const handleConfirm = () => {
    update(admin.id, { status: "Inactive" })
    onDeactivated?.(admin)
    onClose()
  }

  return (
    <ConfirmationModal
      isOpen
      tone="danger"
      title="Deactivate administrator?"
      description={`${admin.name} will lose admin access to ${scope} immediately.`}
      impactLabel="What happens"
      impactPoints={[
        "Active sessions are ended and sign-in is blocked.",
        "Their audit history is retained and stays attributed to them.",
        "Any entity they administer keeps its data — only their access is removed.",
        "The account can be reactivated from this record at any time.",
      ]}
      confirmLabel="Deactivate"
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  )
}
