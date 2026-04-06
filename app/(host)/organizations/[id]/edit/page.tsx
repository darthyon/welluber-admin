"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CaretLeft, 
  Buildings, 
  Article, 
  NavigationArrow, 
  WarningCircle,
  CreditCard,
  CalendarBlank,
  Note
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createOrganizationSchema, CreateOrganizationData } from "@/features/organizations/schemas";
import { Button } from "@/components/ui/button";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { Controller } from "react-hook-form";


export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateOrganizationData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrganizationSchema as any),
    defaultValues: {
      name: "Acme Corporation Sdn Bhd",
      registrationNumber: "1234567-T",
      industry: "Technology",
      subIndustry: "Software Development",
      type: "sme",
      financialYearStart: new Date("2026-01-01T00:00:00Z"),
      subscription: {
        plan: "standard",
        billingInformation: "Monthly Invoicing",
        paymentMethod: "Visa ending in 4242",
        startDate: new Date("2026-01-15T00:00:00Z"),
        endDate: new Date("2027-01-14T00:00:00Z"),
        status: "active",
      }
    }
  });

  const onSubmit = async (data: CreateOrganizationData) => {
    setIsSubmitting(true);
    try {
      // Simulate update delay
      await new Promise(r => setTimeout(r, 800));
      router.push(`/organizations/${orgId}`);
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
            href={`/organizations/${orgId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <CaretLeft size={16} /> Back to Detail Profile
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit Organisation</h1>
          <p className="text-muted-foreground text-[13px] mt-1">Make changes to the corporate client&apos;s core identity.</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <form id="newOrgForm" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Section: Account Details */}
            <div className="p-6 border-b border-border space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Buildings size={16} weight="fill" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">Account Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">Company Name</label>
                  <input 
                    {...register("name")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Acme Corporation Sdn Bhd"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Registration Number</label>
                  <input 
                    {...register("registrationNumber")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.registrationNumber ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. 1234567-T"
                  />
                  {errors.registrationNumber && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Organisation Type</label>
                  <select 
                    {...register("type")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  >
                    <option value="sme">SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="ngo">NGO</option>
                    <option value="mnc">MNC</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Industry</label>
                  <select 
                    {...register("industry")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
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
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Sub-Industry</label>
                  <input 
                    {...register("subIndustry")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                    placeholder="e.g. Software Development"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground flex items-center justify-between">
                    Financial Year Start Date
                    <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded italic">Used for benefit cycle</span>
                  </label>
                  <input 
                    type="date"
                    {...register("financialYearStart", { valueAsDate: true })}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.financialYearStart ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">TIN No.</label>
                  <input 
                    {...register("tinNumber")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.tinNumber ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. TR-882910-01"
                  />
                  {errors.tinNumber && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.tinNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Subscription Details */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CreditCard size={16} weight="fill" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">Subscription Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Subscription Plan</label>
                  <select 
                    {...register("subscription.plan")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  >
                    <option value="standard">Standard Plan</option>
                    <option value="premium">Premium Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Payment Method</label>
                  <input 
                    {...register("subscription.paymentMethod")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                    placeholder="e.g. Visa ending in 4242"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">Billing Information</label>
                  <textarea 
                    {...register("subscription.billingInformation")}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors resize-none"
                    placeholder="e.g. Monthly Invoicing"
                  />
                </div>

                <div className="space-y-1.5 font-medium">
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <CalendarBlank size={14} /> Start Date
                  </label>
                  <input 
                    type="date"
                    {...register("subscription.startDate", { valueAsDate: true })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 font-medium">
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <CalendarBlank size={14} /> End Date
                  </label>
                  <input 
                    type="date"
                    {...register("subscription.endDate", { valueAsDate: true })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-[14px] outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            {/* Section: Tax & Banking Details */}
            <div className="p-6 space-y-6 pt-0">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Article size={16} weight="fill" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">Tax & Banking Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">Bank Name</label>
                  <input 
                    {...register("bankAccountDetails.bankName")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.bankAccountDetails?.bankName ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Maybank Berhad"
                  />
                  {errors.bankAccountDetails?.bankName && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.bankAccountDetails.bankName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Account Number</label>
                  <input 
                    {...register("bankAccountDetails.accountNumber")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.bankAccountDetails?.accountNumber ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. 5140 1234 5678"
                  />
                  {errors.bankAccountDetails?.accountNumber && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.bankAccountDetails.accountNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Account Name</label>
                  <input 
                    {...register("bankAccountDetails.accountName")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
                      errors.bankAccountDetails?.accountName ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Acme Corporation Sdn Bhd"
                  />
                  {errors.bankAccountDetails?.accountName && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.bankAccountDetails.accountName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Documents */}
            <div className="p-6 border-t border-border bg-muted/5">
              <Controller
                name="documents"
                control={control}
                render={({ field }) => (
                  <DocumentUploadSection 
                    documents={field.value || []}
                    onChange={field.onChange}
                    error={errors.documents?.message}
                  />
                )}
              />
            </div>

            {/* Form Footer */}
            <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
              <Button 
                asChild
                variant="outline"
                className="text-[13px] font-medium"
              >
                <Link href={`/organizations/${orgId}`}>Cancel</Link>
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="text-[13px] font-medium flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Changes
                    <NavigationArrow size={14} weight="bold" className="rotate-90" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

    </div>
  );
}
