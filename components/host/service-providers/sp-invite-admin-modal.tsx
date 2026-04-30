"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, EnvelopeSimple, WarningCircle, Warning, GitBranch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inviteSpAdminSchema, InviteSpAdminData } from "@/features/providers/schemas";
import { inviteSpAdmin } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import type { SpBranch } from "@/types/provider";

interface SpInviteAdminModalProps {
  spId: string;
  spName: string;
  branches: SpBranch[];
  existingEmails?: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function SpInviteAdminModal({
  spId,
  spName,
  branches = [],
  existingEmails = [],
  onClose,
  onSuccess,
}: SpInviteAdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<InviteSpAdminData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inviteSpAdminSchema as any),
    defaultValues: {
      branchIds: [],
    },
  });

  const watchedEmail = watch("email") ?? "";
  const isDuplicateEmail = existingEmails.includes(watchedEmail.toLowerCase());

  const onSubmit = async (data: InviteSpAdminData) => {
    setIsSubmitting(true);
    try {
      const res = await inviteSpAdmin(spId, data);
      if (res.success) {
        setInvitedEmail(data.email);
        setIsSuccess(true);
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
      hasError ? "border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  const branchTaxonomy = [
    {
      category: "Available Branches",
      services: branches.map((b) => b.name),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {isSuccess ? (
          <div className="p-8">
            <SuccessCelebration
              title="Invite Sent"
              message={`Invite sent to ${invitedEmail}. They can activate their account within 60 minutes.`}
            />
            <div className="mt-6 flex justify-center">
              <Button onClick={onClose} variant="ghost" className="text-body">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lead font-semibold text-foreground">Invite SP Admin</h2>
                <p className="text-label text-muted-foreground mt-0.5">
                  Send a magic link to {spName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              {/* Warning for duplicate email (not error — they can manage multiple SPs) */}
              {isDuplicateEmail && watchedEmail && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <Warning size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-label text-amber-700 leading-relaxed">
                    This email is already an SP Admin for another provider. They can manage multiple SPs from one account.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">Full Name</label>
                <input
                  {...register("name")}
                  className={inputCls(!!errors.name)}
                  placeholder="e.g. Sara Lim"
                />
                {errors.name && (
                  <p className="text-label text-destructive flex items-center gap-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">Email Address</label>
                <input
                  {...register("email")}
                  className={inputCls(!!errors.email)}
                  placeholder="admin@providername.my"
                  type="email"
                />
                {errors.email && (
                  <p className="text-label text-destructive flex items-center gap-1">
                    <WarningCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-body font-medium text-foreground">Restricted to Branches (Optional)</label>
                  <span className="text-label text-muted-foreground">Default: All Branches</span>
                </div>
                <Controller
                  control={control}
                  name="branchIds"
                  render={({ field }) => (
                    <SearchableMultiSelect
                      taxonomy={branchTaxonomy}
                      staticOptions={["Assign to all branches"]}
                      selected={field.value.map(idOrName => {
                        if (idOrName === "all") return "Assign to all branches";
                        const branch = branches.find(b => b.id === idOrName || b.name === idOrName);
                        return branch?.name ?? idOrName;
                      })}
                      onChange={(names) => {
                        // Mutual exclusion logic
                        let finalIds: string[] = [];
                        
                        const newlySelectedAll = names.includes("Assign to all branches") && !field.value.includes("all");
                        const previouslySelectedAll = field.value.includes("all");
                        const hasOtherBranches = names.some(n => n !== "Assign to all branches");

                        if (newlySelectedAll) {
                          // If "Assign to all branches" was just selected, clear others
                          finalIds = ["all"];
                        } else if (previouslySelectedAll && hasOtherBranches) {
                          // If "Assign to all branches" was already there but a branch was added, remove "all"
                          finalIds = names
                            .filter(n => n !== "Assign to all branches")
                            .map(name => {
                              const branch = branches.find(b => b.name === name);
                              return branch?.id ?? name;
                            });
                        } else {
                          // Normal behavior
                          finalIds = names.map(name => {
                            if (name === "Assign to all branches") return "all";
                            const branch = branches.find(b => b.name === name);
                            return branch?.id ?? name;
                          });
                        }
                        
                        field.onChange(finalIds);
                      }}
                      placeholder="Search to restrict branches..."
                    />
                  )}
                />
                {errors.branchIds && (
                  <p className="text-label text-destructive flex items-center gap-1">
                    <WarningCircle size={12} /> {errors.branchIds.message}
                  </p>
                )}
              </div>

              <p className="text-label text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2">
                A magic link will be sent to this address. The link expires in{" "}
                <span className="font-semibold text-foreground">60 minutes</span>.
              </p>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={onClose} className="text-body">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="text-body gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <EnvelopeSimple size={14} weight="fill" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
