"use client"

import * as React from "react"
import {
  CalendarBlank,
  Clock,
  Key,
  PencilSimple,
  User,
  X,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { SendResetLinkDialog } from "@/components/host/users/send-reset-link-dialog"
import { useAdmins } from "@/hooks/data-hooks"
import type { Administrator } from "@/features/users/types"

interface AdministratorDetailsTabProps {
  admin: Administrator
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Deliberately loose — mock data carries spaced and hyphenated MY numbers. */
const MOBILE_PATTERN = /^\+?[\d\s-]{8,20}$/

export function AdministratorDetailsTab({
  admin,
}: AdministratorDetailsTabProps) {
  const { update } = useAdmins()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState(admin.name)
  const [email, setEmail] = React.useState(admin.email)
  const [mobile, setMobile] = React.useState(admin.mobile ?? "")
  const [resetTarget, setResetTarget] = React.useState<Administrator | null>(
    null
  )

  // Re-seed when navigating between administrators.
  React.useEffect(() => {
    setName(admin.name)
    setEmail(admin.email)
    setMobile(admin.mobile ?? "")
    setIsEditing(false)
  }, [admin])

  const nameValid = name.trim().length >= 2
  const emailValid = EMAIL_PATTERN.test(email.trim())
  // Mobile is optional — blank is valid, anything present must look like a number.
  const mobileValid = mobile.trim() === "" || MOBILE_PATTERN.test(mobile.trim())
  const isDirty =
    name !== admin.name ||
    email !== admin.email ||
    mobile !== (admin.mobile ?? "")
  const canSave = isDirty && nameValid && emailValid && mobileValid

  const cancel = () => {
    setName(admin.name)
    setEmail(admin.email)
    setMobile(admin.mobile ?? "")
    setIsEditing(false)
  }

  const save = () => {
    if (!canSave) return
    update(admin.id, {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim() || undefined,
    })
    setIsEditing(false)
  }


  const inputClassName = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-body outline-none transition-colors",
      "focus:ring-1 focus:ring-ring focus:border-ring/40",
      hasError &&
        "border-destructive focus:ring-destructive/20 focus:border-destructive"
    )

  return (
    <div className="animate-in space-y-6 fade-in">
      <DetailSection
        title="Administrator Details"
        icon={<User size={18} weight="duotone" />}
        description="Name and sign-in email for this administrator."
        action={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancel}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                <X size={14} weight="bold" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={!canSave}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetTarget(admin)}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                <Key size={14} weight="bold" /> Send Reset Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                <PencilSimple size={14} weight="bold" /> Edit Details
              </Button>
            </div>
          )
        }
      >
        {isEditing ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-name"
                className="text-label font-medium text-foreground"
              >
                Full Name
              </label>
              <input
                id="admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName(!nameValid)}
                autoFocus
              />
              {!nameValid && (
                <p className="text-label text-destructive">
                  Name is required.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-label font-medium text-foreground"
              >
                Corporate Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName(!emailValid)}
              />
              {!emailValid && (
                <p className="text-label text-destructive">
                  Enter a valid email address.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-mobile"
                className="text-label font-medium text-foreground"
              >
                Mobile Number
                <span className="ml-1.5 font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <input
                id="admin-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+60 12-345 6789"
                className={inputClassName(!mobileValid)}
              />
              {!mobileValid && (
                <p className="text-label text-destructive">
                  Enter a valid mobile number.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label="Full Name" value={admin.name} />
            <DetailField
              label="Corporate Email"
              value={
                <span className="font-mono text-label tracking-tight text-subtle">
                  {admin.email}
                </span>
              }
            />
            <DetailField
              label="Mobile Number"
              value={
                admin.mobile ? (
                  <span className="font-mono text-label tracking-tight text-subtle">
                    {admin.mobile}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <DetailField
              label="Admin ID"
              value={
                <span className="font-mono text-label tracking-tight text-subtle">
                  {admin.id}
                </span>
              }
            />
          </div>
        )}
      </DetailSection>

      <DetailSection
        title="Activity"
        description="System-recorded, not editable."
        icon={<Clock size={18} weight="duotone" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailField
            label="Joined Date"
            value={admin.joinedDate}
            icon={<CalendarBlank size={14} />}
          />
          <DetailField
            label="Last Login"
            value={admin.lastLogin}
            icon={<Clock size={14} />}
          />
          <DetailField
            label="Last Active"
            value={admin.lastActive}
            icon={<Clock size={14} />}
          />
        </div>
      </DetailSection>

      <SendResetLinkDialog
        admin={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  )
}
