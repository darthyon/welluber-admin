"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretLeft,
  Buildings,
  NavigationArrow,
  WarningCircle,
  IdentificationCard,
  MapPin,
  Bank,
  CalendarBlank,
  CaretDown,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createOrganizationSchema, CreateOrganizationData } from "@/features/organizations/schemas";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { LocationPicker } from "@/components/shared/location-picker";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { FormSelect } from "@/components/shared/form-select";
import { MALAYSIAN_BANKS } from "@/lib/constants/banks";
import { toast } from "sonner";

const ANCHOR_ITEMS = [
  { id: "org-profile", label: "Organisation Profile" },
  { id: "registration-compliance", label: "Registration & Compliance" },
  { id: "business-address", label: "Business Address" },
  { id: "payment-details", label: "Payment Details" },
];

const ORG_TYPES = [
  { id: "sole_proprietorship", label: "Sole Proprietorship", docs: "Form D / MyCoID" },
  { id: "partnership", label: "Partnership", docs: "Form A / Partnership Deed" },
  { id: "sdn_bhd", label: "Private Limited (Sdn. Bhd.)", docs: "SSM Section 14 & 17" },
  { id: "llp", label: "LLP", docs: "LLP Registration Certificate" },
  { id: "bhd", label: "Public Limited (Bhd.)", docs: "Prospectus & SSM Cert" },
  { id: "clbg", label: "CLBG", docs: "Memorandum & Articles" },
];

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fyPickerOpen, setFyPickerOpen] = useState(false);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<CreateOrganizationData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrganizationSchema as any),
    defaultValues: {
      name: "Acme Corporation Sdn Bhd",
      registrationNumber: "1234567-T",
      industry: "Technology",
      subIndustry: "Software Development",
      type: "bhd",
      tinNumber: "TR-882910-01",
      financialYearMode: "calendar",
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

  const orgType = useWatch({ control, name: "type" });
  const fyMode = useWatch({ control, name: "financialYearMode" });
  const industryValue = useWatch({ control, name: "industry" });
  const bankNameValue = useWatch({ control, name: "bankAccountDetails.bankName" });

  const onSubmit = async () => {
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
      case "sole_proprietorship": return "Form D / MyCoID registration required";
      case "partnership": return "Form A and Partnership Deed required";
      case "sdn_bhd": return "SSM Certificate, Section 14 & Section 17 required";
      case "llp": return "LLP Registration Certificate required";
      case "bhd": return "Prospectus and SSM Certificate required";
      case "clbg": return "Memorandum and Articles of Association required";
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
                      <FormSelect
                        value={industryValue}
                        onChange={(v) => setValue("industry", v)}
                        options={[
                          { label: "Select industry", value: "" },
                          { label: "Technology", value: "Technology" },
                          { label: "Healthcare", value: "Healthcare" },
                          { label: "Finance", value: "Finance" },
                          { label: "Logistics", value: "Logistics" },
                          { label: "Retail", value: "Retail" },
                          { label: "Manufacturing", value: "Manufacturing" },
                        ]}
                        error={!!errors.industry}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelCls}>Financial Year Start</label>
                      <div className="flex gap-2">
                        {([
                          { mode: "calendar" as const, label: "Calendar Year" },
                          { mode: "follow_month" as const, label: "Organisation Financial Year" },
                        ]).map(({ mode, label }) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setValue("financialYearMode", mode)}
                            className={cn(
                              "flex-1 py-2 px-3 border rounded-lg text-body font-medium transition-all",
                              fyMode === mode
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-border-hover"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {fyMode === "calendar" && (
                        <p className="text-label text-muted-foreground">From January 1 – December 31.</p>
                      )}
                      {fyMode === "follow_month" && (
                        <Controller
                          control={control}
                          name="financialYearMonth"
                          render={({ field }) => (
                            <div className="space-y-1.5">
                              <Popover open={fyPickerOpen} onOpenChange={setFyPickerOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 h-[38px] px-3 bg-background border border-border rounded-lg text-body transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
                                  >
                                    <CalendarBlank size={16} className="text-faint shrink-0" />
                                    <span className={field.value ? "text-foreground font-medium" : "text-faint"}>
                                      {field.value ? MONTH_NAMES[field.value - 1] : "Select FY start month"}
                                    </span>
                                    <CaretDown size={14} className={cn("text-faint ml-auto transition-transform", fyPickerOpen && "rotate-180")} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[280px] p-3">
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {MONTH_SHORT.map((m, i) => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => { field.onChange(i + 1); setFyPickerOpen(false); }}
                                        className={cn(
                                          "py-2 rounded-lg text-label font-medium border transition-all",
                                          field.value === i + 1
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                        )}
                                      >
                                        {m}
                                      </button>
                                    ))}
                                  </div>
                                  {field.value && (
                                    <p className="text-label text-muted-foreground mt-2 px-1">
                                      FY runs {MONTH_NAMES[field.value - 1]} 1 – last day of {MONTH_NAMES[(field.value - 2 + 12) % 12]}.
                                    </p>
                                  )}
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        />
                      )}
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

                    <div className="space-y-2 sm:col-span-2 pt-4 border-t border-border/40">
                      <label className={labelCls}>Organisation Type</label>
                      <FormSelect
                        value={orgType || ""}
                        onChange={(v) => setValue("type", v as CreateOrganizationData["type"])}
                        options={[
                          { label: "Select type", value: "" },
                          ...ORG_TYPES.map(t => ({ label: t.label, value: t.id })),
                        ]}
                        error={!!errors.type}
                      />
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

              {/* Section: Business Address */}
              <div id="business-address" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-lead font-semibold text-foreground">Business Address</h3>
                      <p className="text-label text-muted-foreground">Official business address as per SSM registration.</p>
                    </div>
                  </div>

                  <div className="p-1">
                    <Controller
                      control={control}
                      name="address"
                      render={({ field }) => (
                        <LocationPicker 
                          value={field.value ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" }}
                          onChange={field.onChange}
                          errors={errors.address}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Payment Details */}
              <div id="payment-details" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-8">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bank size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Payment Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={labelCls}>Bank Name</label>
                      <FormSelect
                        value={bankNameValue || ""}
                        onChange={(v) => setValue("bankAccountDetails.bankName", v)}
                        options={[
                          { label: "Select bank", value: "" },
                          ...MALAYSIAN_BANKS.map((b) => ({ label: b, value: b })),
                        ]}
                        error={!!errors.bankAccountDetails?.bankName}
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
                </div>
              </div>

              {/* Floating Action Bar */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
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
