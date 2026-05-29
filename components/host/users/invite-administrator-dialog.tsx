"use client";

import * as React from "react";
import { useForm, type FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buildings, Shield, Storefront } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/shared/form-select";
import { Spinner } from "@/components/shared/spinner";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { inviteOrganizationAdmin } from "@/features/organizations/actions";
import { inviteSpAdmin } from "@/features/providers/actions";
import { inviteHostAdmin } from "@/features/users/actions";
import { MOCK_ORGS, MOCK_SPS } from "@/lib/mock-data";

const inviteAdministratorSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("host"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    position: z.string().min(2, "Position is required"),
  }),
  z.object({
    scope: z.literal("org"),
    orgId: z.string().min(1, "Organization is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    position: z.string().min(2, "Position is required"),
  }),
  z.object({
    scope: z.literal("sp"),
    spId: z.string().min(1, "Service provider is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    position: z.string().min(2, "Position is required"),
    email: z.string().email("Enter a valid email address"),
  }),
]);

type InviteAdministratorForm = z.infer<typeof inviteAdministratorSchema>;
type Scope = InviteAdministratorForm["scope"];

interface InviteAdministratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdministratorDialog({ open, onOpenChange }: InviteAdministratorDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm<InviteAdministratorForm>({
    resolver: zodResolver(inviteAdministratorSchema),
    defaultValues: {
      scope: "host",
      firstName: "",
      lastName: "",
      email: "",
      position: "",
    } as InviteAdministratorForm,
  });

  const scope = form.watch("scope");
  // FieldErrors on a discriminated union can't narrow scope-specific fields (orgId, spId)
  const errors = form.formState.errors as Record<string, FieldError | undefined>;

  React.useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setSuccessMessage(null);
      setSubmitError(null);
      form.reset({ scope: "host", firstName: "", lastName: "", email: "", position: "" } as InviteAdministratorForm);
    }
  }, [open, form]);

  const orgOptions = React.useMemo(
    () => MOCK_ORGS.map((o) => ({ label: o.name, value: o.id })),
    []
  );
  const spOptions = React.useMemo(
    () => MOCK_SPS.map((sp) => ({ label: sp.name, value: sp.id })),
    []
  );

  const setScope = (next: Scope) => {
    setSuccessMessage(null);
    setSubmitError(null);

    if (next === "sp") {
      form.reset({ scope: "sp", firstName: "", lastName: "", email: "", position: "", spId: "" } as InviteAdministratorForm);
      return;
    }

    if (next === "org") {
      form.reset({ scope: "org", firstName: "", lastName: "", email: "", position: "", orgId: "" } as InviteAdministratorForm);
      return;
    }

    form.reset({ scope: "host", firstName: "", lastName: "", email: "", position: "" } as InviteAdministratorForm);
  };

  const onSubmit = async (data: InviteAdministratorForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      if (data.scope === "host") {
        const res = await inviteHostAdmin({ name: fullName, email: data.email, position: data.position });
        if (res.success) setSuccessMessage(res.message);
        return;
      }

      if (data.scope === "org") {
        const res = await inviteOrganizationAdmin(data.orgId, { name: fullName, email: data.email, position: data.position });
        if (res.success) setSuccessMessage(res.message);
        return;
      }

      const res = await inviteSpAdmin(data.spId, { name: fullName, position: data.position, email: data.email, branchIds: [] });
      if (res.success) setSuccessMessage(res.message);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-body outline-none transition-colors",
      "focus:ring-1 focus:ring-ring focus:border-ring/40",
      hasError && "border-destructive focus:ring-destructive/20 focus:border-destructive"
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold text-foreground">Invite Administrator</DialogTitle>
          <DialogDescription className="text-body">
            Select an admin type and send an invite link.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="py-8">
            <SuccessCelebration title="Invite Sent" message={successMessage} />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="text-label font-medium text-muted-foreground">Administrator Type</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScope("host")}
                  className={cn(
                    "h-10 justify-start gap-2",
                    scope === "host" && "border-primary/30 bg-primary/5 text-primary"
                  )}
                >
                  <Shield size={16} className="shrink-0" />
                  Host
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScope("org")}
                  className={cn(
                    "h-10 justify-start gap-2",
                    scope === "org" && "border-primary/30 bg-primary/5 text-primary"
                  )}
                >
                  <Buildings size={16} className="shrink-0" />
                  Organization
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScope("sp")}
                  className={cn(
                    "h-10 justify-start gap-2",
                    scope === "sp" && "border-primary/30 bg-primary/5 text-primary"
                  )}
                >
                  <Storefront size={16} className="shrink-0" />
                  Service Provider
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-foreground">Full Name</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <input
                    {...form.register("firstName")}
                    className={inputClassName(!!errors.firstName)}
                    placeholder="First Name"
                    autoFocus
                  />
                  {!!errors.firstName?.message && (
                    <p className="text-label text-destructive">{String(errors.firstName.message)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <input
                    {...form.register("lastName")}
                    className={inputClassName(!!errors.lastName)}
                    placeholder="Last Name"
                  />
                  {!!errors.lastName?.message && (
                    <p className="text-label text-destructive">{String(errors.lastName.message)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-foreground">Position</label>
              <input
                {...form.register("position")}
                className={inputClassName(!!errors.position)}
                placeholder="e.g. Operations Admin"
              />
              {!!errors.position?.message && (
                <p className="text-label text-destructive">{String(errors.position.message)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-foreground">Corporate Email</label>
              <input
                type="email"
                {...form.register("email")}
                className={inputClassName(!!form.formState.errors.email)}
                placeholder="name@company.com"
              />
              {form.formState.errors.email?.message && (
                <p className="text-label text-destructive">{String(form.formState.errors.email.message)}</p>
              )}
            </div>

            {scope === "org" && (
              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Organization</label>
                <FormSelect
                  value={(form.watch("orgId") as string | undefined) ?? ""}
                  onChange={(v) => form.setValue("orgId", v as never, { shouldValidate: true })}
                  options={orgOptions}
                  placeholder="Select an organization..."
                  searchPlaceholder="Search organizations..."
                  error={!!errors.orgId}
                />
                {!!errors.orgId?.message && (
                  <p className="text-label text-destructive">{String(errors.orgId.message)}</p>
                )}
              </div>
            )}

            {scope === "sp" && (
              <div className="space-y-1.5">
                <label className="text-label font-medium text-foreground">Service Provider</label>
                <FormSelect
                  value={(form.watch("spId") as string | undefined) ?? ""}
                  onChange={(v) => form.setValue("spId", v as never, { shouldValidate: true })}
                  options={spOptions}
                  placeholder="Select a service provider..."
                  searchPlaceholder="Search service providers..."
                  error={!!errors.spId}
                />
                {!!errors.spId?.message && (
                  <p className="text-label text-destructive">{String(errors.spId.message)}</p>
                )}
              </div>
            )}

            {submitError && (
              <div className="text-label text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" variant="white" />
                    Sending...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
