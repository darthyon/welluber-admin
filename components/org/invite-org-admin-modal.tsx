"use client"

import { useState } from "react"
import { X, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { inviteOrganizationAdmin } from "@/features/organizations/actions"
import { inviteAdminSchema } from "@/features/organizations/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = inviteAdminSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).omit({ name: true })

type FormData = z.infer<typeof schema>

interface Props {
  orgId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteOrgAdminModal({ orgId, isOpen, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!isOpen) return null

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSuccess(null)
    try {
      const res = await inviteOrganizationAdmin(orgId, {
        name: `${data.firstName} ${data.lastName}`.trim(),
        position: data.position,
        email: data.email,
      })
      if (res.success) {
        setSuccess(res.message)
        setTimeout(() => {
          onClose()
          reset()
          setSuccess(null)
        }, 2000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-lg shadow-lg border border-border flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground tracking-tight">Invite Administrator</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {success ? (
            <SuccessCelebration title="Invite Sent!" message={success} className="py-10" />
          ) : (
            <form id="inviteOrgAdminForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-body text-subtle mb-4">
                Enter details below. They'll receive a secure invite link by email.
              </p>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Full Name</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <input {...register("firstName")} className={inputCls(!!errors.firstName)} placeholder="First Name" autoFocus />
                    {errors.firstName && (
                      <p className="text-label text-destructive flex items-center gap-1">
                        <WarningCircle size={12} /> {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input {...register("lastName")} className={inputCls(!!errors.lastName)} placeholder="Last Name" />
                    {errors.lastName && (
                      <p className="text-label text-destructive flex items-center gap-1">
                        <WarningCircle size={12} /> {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Position</label>
                <input {...register("position")} className={inputCls(!!errors.position)} placeholder="e.g. HR Manager" />
                {errors.position && (
                  <p className="text-label text-destructive flex items-center gap-1">
                    <WarningCircle size={12} /> {errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Corporate Email</label>
                <input type="email" {...register("email")} className={inputCls(!!errors.email)} placeholder="name@company.com" />
                {errors.email && (
                  <p className="text-label text-destructive flex items-center gap-1">
                    <WarningCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {!success && (
          <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10 rounded-b-xl">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="text-body font-medium">
              Cancel
            </Button>
            <Button form="inviteOrgAdminForm" type="submit" disabled={isSubmitting} className="text-body font-medium flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperPlaneTilt size={16} />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
