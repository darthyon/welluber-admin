"use client"

import * as React from "react"
import { Key, Info } from "@phosphor-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/shared/spinner"
import type { Administrator } from "@/features/users/types"

interface SendResetLinkDialogProps {
  admin: Administrator | null
  onClose: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SendResetLinkDialog({
  admin,
  onClose,
}: SendResetLinkDialogProps) {
  const [email, setEmail] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)

  // Re-seed each time the dialog opens for an administrator.
  React.useEffect(() => {
    if (admin) {
      setEmail(admin.email)
      setIsSending(false)
    }
  }, [admin])

  if (!admin) return null

  const trimmed = email.trim()
  const emailValid = EMAIL_PATTERN.test(trimmed)
  const isRedirected = trimmed.toLowerCase() !== admin.email.toLowerCase()

  const send = async () => {
    if (!emailValid) return
    setIsSending(true)
    try {
      // Stands in for the real mail call — the prototype has no mail service.
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("Password reset link sent", {
        description: `${trimmed} has 60 minutes to use it.`,
      })
      onClose()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold text-foreground">
            Send password reset link
          </DialogTitle>
          <DialogDescription className="text-body">
            {admin.name} will receive a link to set a new password. It expires
            in 60 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email"
              className="text-label font-medium text-foreground"
            >
              Send to
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-body outline-none transition-colors",
                "focus:border-ring/40 focus:ring-1 focus:ring-ring",
                !emailValid &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
            />
            {!emailValid && (
              <p className="text-label text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>

          {isRedirected && emailValid && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-amber-600 dark:text-amber-400">
              <Info size={16} weight="fill" className="mt-0.5 shrink-0" />
              <p className="text-label leading-relaxed">
                This is not the administrator&apos;s registered email
                (<span className="font-mono">{admin.email}</span>). The link
                will go to the address above, and their record stays unchanged.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={send}
            disabled={!emailValid || isSending}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Spinner size="sm" variant="white" />
                Sending...
              </>
            ) : (
              <>
                <Key size={16} weight="bold" />
                Send Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
