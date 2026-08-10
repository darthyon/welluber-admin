"use client"

import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { useMembers } from "@/hooks/data-hooks"
import type { Member } from "@/features/users/types"

interface RevokeMemberAccessDialogProps {
  /** The member awaiting confirmation, or null when the dialog is closed. */
  member: Member | null
  onClose: () => void
  onRevoked?: (member: Member) => void
}

export function RevokeMemberAccessDialog({
  member,
  onClose,
  onRevoked,
}: RevokeMemberAccessDialogProps) {
  const { update } = useMembers()

  if (!member) return null

  const handleConfirm = () => {
    update(member.id, { status: "Inactive" })
    onRevoked?.(member)
    onClose()
  }

  return (
    <ConfirmationModal
      isOpen
      tone="danger"
      title="Revoke app access?"
      description={`${member.name} will lose access to the WellUber app immediately.`}
      impactLabel="What happens"
      impactPoints={[
        "The member is signed out of the app on all devices.",
        "Unredeemed vouchers stay issued but cannot be used until access is restored.",
        "Employment and entitlement records are not affected.",
        "Access can be restored from this member's record at any time.",
      ]}
      confirmLabel="Revoke Access"
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  )
}
