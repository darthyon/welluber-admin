"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, Buildings, Article, NavigationArrow, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createOrganizationSchema, CreateOrganizationData } from "@/features/organizations/schemas";
import { createOrganization } from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/shared/success-modal";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrganizationData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrganizationSchema as any),
    defaultValues: {
      type: "sme",
      subscription: {
        plan: "standard",
        status: "pending",
      }
    }
  });

  const onSubmit = async (data: CreateOrganizationData) => {
    setIsSubmitting(true);
    try {
      const res = await createOrganization(data);
      if (res.success) {
        setOrgId(res.data.id);
        setShowSuccess(true);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Breadcrumb / Back */}
        <div>
          <Link 
            href="/organizations"
            className="inline-flex items-center gap-1.5 text-nav font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <CaretLeft size={16} /> Back to Organisations
          </Link>
          <h1 className="text-heading font-semibold tracking-tight text-foreground">Add New Organisation</h1>
          <p className="text-muted-foreground text-nav mt-1">Register a new corporate client on the platform.</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <form id="newOrgForm" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Section: Profile */}
            <div className="p-6 border-b border-border space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Buildings size={16} weight="fill" />
                </div>
                <h3 className="text-subtitle font-semibold text-foreground">Company Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-nav font-medium text-foreground">Company Name</label>
                  <input 
                    {...register("name")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                      errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Acme Corporation Sdn Bhd"
                  />
                  {errors.name && (
                    <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-nav font-medium text-foreground">Registration Number</label>
                  <input 
                    {...register("registrationNumber")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                      errors.registrationNumber ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. 1234567-T"
                  />
                  {errors.registrationNumber && (
                    <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-nav font-medium text-foreground">Industry</label>
                  <select 
                    {...register("industry")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                      errors.industry ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                  {errors.industry && (
                    <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Configuration */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Article size={16} weight="fill" />
                </div>
                <h3 className="text-subtitle font-semibold text-foreground">Platform Configuration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-nav font-medium text-foreground">Organisation Type</label>
                  <select 
                    {...register("type")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  >
                    <option value="sme">SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-nav font-medium text-foreground">Subscription Plan</label>
                  <select 
                    {...register("subscription.plan")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-nav font-medium text-foreground text-muted-foreground/80">Sub-Industry (Optional)</label>
                  <input 
                    {...register("subIndustry")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                      "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Healthcare Analytics"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-nav font-medium text-foreground flex items-center justify-between">
                    Financial Year Start
                    <span className="text-caption font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Used for benefit cycle</span>
                  </label>
                  <input 
                    type="date"
                    {...register("financialYearStart", { valueAsDate: true })}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                      errors.financialYearStart ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                  />
                  {errors.financialYearStart && (
                    <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.financialYearStart.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
              <Button 
                asChild
                variant="outline"
                className="text-nav font-medium"
              >
                <Link href="/organizations">Cancel</Link>
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="text-nav font-medium flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Organisation
                    <NavigationArrow size={14} weight="bold" className="rotate-90" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Organisation Registered"
        message="The corporate profile has been successfully established. You can now proceed to assign benefit policies or onboard employees."
        primaryAction={{
          label: "Assign Benefit Policy",
          href: `/organizations/${orgId}?tab=policies&addPolicy=true`
        }}
        secondaryAction={{
          label: "Onboard Employees",
          href: `/organizations/${orgId}?tab=employees&addEmployee=true`
        }}
      />
    </div>
  );
}
