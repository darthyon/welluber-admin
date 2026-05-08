"use client";

import { useState } from "react";
import { X, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import { inviteAdminSchema, InviteAdminData } from "@/features/organizations/schemas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inviteOrganizationAdmin } from "@/features/organizations/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SuccessCelebration } from "@/components/shared/success-celebration";

interface InviteAdminModalProps {
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function InviteAdminModal({ targetId, isOpen, onClose, title = "Invite Administrator" }: InviteAdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteAdminData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inviteAdminSchema as any),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteAdminData) => {
    setIsSubmitting(true);
    setSuccess(null);
    try {
      const res = await inviteOrganizationAdmin(targetId, data);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onClose();
          reset();
          setSuccess(null);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-lg shadow-lg border border-border flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {success ? (
            <SuccessCelebration 
              title="Invite Sent!" 
              message={success}
              className="py-10"
            />
          ) : (

            <form id="inviteAdminForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-body text-subtle mb-4">
                Enter the details below to invite an administrator. They will receive an email with a secure link to join.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Full Name</label>
                <input 
                  {...register("name")}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                    errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                  )}
                  placeholder="e.g. John Doe"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-label text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Position / Role</label>
                <input 
                  {...register("position")}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                    errors.position ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                  )}
                  placeholder="e.g. Branch Manager, Finance Admin"
                />
                {errors.position && (
                  <p className="text-label text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Corporate Email</label>
                <input 
                  type="email"
                  {...register("email")}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                    errors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                  )}
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <p className="text-label text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10 rounded-b-xl">
            <Button 
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-body font-medium"
            >
              Cancel
            </Button>
            <Button 
              form="inviteAdminForm"
              type="submit"
              disabled={isSubmitting}
              className="text-body font-medium flex items-center gap-2"
            >
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
  );
}

