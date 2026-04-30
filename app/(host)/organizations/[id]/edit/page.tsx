"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CaretLeft, 
  Buildings, 
  Article, 
  NavigationArrow, 
  WarningCircle,
  IdentificationCard,
  MapPin,
  CreditCard,
  Bank,
  Globe
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createOrganizationSchema, CreateOrganizationData } from "@/features/organizations/schemas";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { LocationPicker } from "@/components/shared/location-picker";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { toast } from "sonner";

const ANCHOR_ITEMS = [
  { id: "org-profile", label: "Organisation Profile" },
  { id: "registration-compliance", label: "Registration & Compliance" },
  { id: "registered-address", label: "Registered Address" },
  { id: "settlement-platform", label: "Settlement & Platform" },
];

const ORG_TYPES = [
  { id: "sme", label: "SME", docs: "Form D / SSM Cert" },
  { id: "enterprise", label: "Enterprise", docs: "SSM Cert & Form Section 14" },
  { id: "ngo", label: "NGO", docs: "Registration Papers" },
];

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreateOrganizationData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrganizationSchema as any),
    defaultValues: {
      name: "Acme Corporation Sdn Bhd",
      registrationNumber: "1234567-T",
      industry: "Technology",
      subIndustry: "Software Development",
      type: "sme",
      tinNumber: "TR-882910-01",
      financialYearStart: new Date("2026-01-01T00:00:00Z"),
      creditLimit: 50000,
      subscription: {
        plan: "standard",
        billingInformation: "Monthly Invoicing",
        paymentMethod: "Visa ending in 4242",
        startDate: new Date("2026-01-15T00:00:00Z"),
        endDate: new Date("2027-01-14T00:00:00Z"),
        status: "active",
      },
      address: {
        line: "Level 15, Menara Southpoint, Mid Valley City",
        city: "Kuala Lumpur",
        state: "W.P. Kuala Lumpur",
        country: "Malaysia",
        postalCode: "59200"
      },
      bankAccountDetails: {
        bankName: "Maybank Berhad",
        accountNumber: "5140 1234 5678",
        accountName: "Acme Corporation Sdn Bhd"
      },
      documents: ["SSM_Registration_2024.pdf", "Form_49_Directors.pdf"]
    }
  });

  const orgType = watch("type");

  const onSubmit = async (data: CreateOrganizationData) => {
    setIsSubmitting(true);
    try {
      // Simulate update delay
      await new Promise(r => setTimeout(r, 800));
      toast.success("Organisation profile updated successfully");
      router.push(`/organizations/${orgId}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update organisation");
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2.5 bg-background border rounded-lg text-body outline-none transition-all duration-200",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/10"
        : "border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-muted/10"
    );

  const labelCls = "text-body font-semibold text-subtle mb-1.5 block";

  const getDocRequirements = (type: string) => {
    switch (type) {
      case "enterprise": return "SSM Certificate and Form Section 14 required";
      case "sme": return "Form D and SSM Certificate required";
      case "ngo": return "Registration documents required";
      default: return "Supporting documents required";
    }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

        {/* Left Column: Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Back
              </button>
              <div>
                <h1 className="text-heading font-semibold text-foreground text-balance">Edit Organisation</h1>
                <p className="text-subtle text-body mt-1">Make changes to the corporate client&apos;s core identity.</p>
              </div>
            </div>

            <form id="editOrgForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Section: Organisation Profile */}
              <div id="org-profile" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Buildings size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Organisation Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={labelCls}>Company Name</label>
                      <input 
                        {...register("name")}
                        className={inputCls(!!errors.name)}
                        placeholder="e.g. Acme Corporation Sdn Bhd"
                      />
                      {errors.name && (
                        <p className="text-label text-destructive flex items-center gap-1 mt-1">
                          <WarningCircle size={12} /> {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Industry</label>
                      <select 
                        {...register("industry")}
                        className={inputCls(!!errors.industry)}
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
                      <label className={labelCls}>Financial Year Start</label>
                      <input 
                        type="date"
                        {...register("financialYearStart", { valueAsDate: true })}
                        className={inputCls(!!errors.financialYearStart)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Registration & Compliance */}
              <div id="registration-compliance" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <IdentificationCard size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Registration & Compliance</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Registration Number</label>
                      <input 
                        {...register("registrationNumber")}
                        className={inputCls(!!errors.registrationNumber)}
                        placeholder="e.g. 1234567-T"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>TIN Number</label>
                      <input 
                        {...register("tinNumber")}
                        className={inputCls(!!errors.tinNumber)}
                        placeholder="e.g. TR-882910-01"
                      />
                    </div>

                    <div className="space-y-3 sm:col-span-2 pt-4 border-t border-border/40">
                      <label className={labelCls}>Organisation Type</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ORG_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setValue("type", type.id as any)}
                            className={cn(
                              "flex flex-col p-3 border rounded-lg text-left transition-all duration-200",
                              orgType === type.id 
                                ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20" 
                                : "border-border hover:border-border-hover bg-muted/5"
                            )}
                          >
                            <span className={cn("text-body font-semibold", orgType === type.id ? "text-primary" : "text-foreground")}>{type.label}</span>
                            <span className="text-label text-subtle mt-0.5 leading-tight">{type.docs}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-border/40">
                      <Controller
                        control={control}
                        name="documents"
                        render={({ field }) => (
                          <DocumentUploadSection 
                            documents={field.value || []}
                            onChange={field.onChange}
                            error={errors.documents?.message}
                            label="Compliance Documents"
                            description={getDocRequirements(orgType)}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Registered Address */}
              <div id="registered-address" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-lead font-semibold text-foreground">Registered Business Address</h3>
                      <p className="text-label text-muted-foreground">Official business address as per SSM registration.</p>
                    </div>
                  </div>

                  <div className="p-1">
                    <Controller
                      control={control}
                      name="address"
                      render={({ field }) => (
                        <LocationPicker 
                          value={field.value as any}
                          onChange={field.onChange}
                          errors={errors.address}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Settlement & Platform */}
              <div id="settlement-platform" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-8">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bank size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Settlement & Platform</h3>
                  </div>

                  {/* Bank Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={labelCls}>Bank Name</label>
                      <input 
                        {...register("bankAccountDetails.bankName")}
                        className={inputCls(!!errors.bankAccountDetails?.bankName)}
                        placeholder="e.g. Maybank Berhad"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Account Number</label>
                      <input 
                        {...register("bankAccountDetails.accountNumber")}
                        className={cn(inputCls(!!errors.bankAccountDetails?.accountNumber), "font-mono")}
                        placeholder="e.g. 5140 1234 5678"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Account Name</label>
                      <input 
                        {...register("bankAccountDetails.accountName")}
                        className={inputCls(!!errors.bankAccountDetails?.accountName)}
                        placeholder="e.g. Acme Corporation Sdn Bhd"
                      />
                    </div>
                  </div>

                  {/* Platform Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-border/40">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Subscription Plan</label>
                      <select 
                        {...register("subscription.plan")}
                        className={inputCls()}
                      >
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Credit Limit</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-semibold text-body">RM</div>
                        <input 
                          type="number"
                          {...register("creditLimit", { valueAsNumber: true })}
                          className={cn(inputCls(), "pl-11 font-mono text-right")}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Action Bar */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
                <Button variant="ghost" size="lg" className="text-body font-semibold px-6 transition-colors" onClick={() => router.back()}>
                  Cancel
                </Button>
                <div className="w-px h-6 bg-border/40" />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

              {/* Spacer */}
              <div className="h-[60vh]" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
