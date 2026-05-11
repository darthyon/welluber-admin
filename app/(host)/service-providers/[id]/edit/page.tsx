"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CaretLeft,
  Storefront,
  NavigationArrow,
  IdentificationCard,
  MapPin,
  Bank,
  ShieldCheck,
  Globe,
  Article,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createSpSchema } from "@/features/providers/schemas";
import { updateSp } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { MOCK_SPS } from "@/lib/mock-data";
import { MOCK_BRANDS } from "@/lib/mock-data";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { Switch } from "@/components/shared/switch";
import { LocationPicker } from "@/components/shared/location-picker";
import { ServicePortfolioSection } from "@/components/host/service-providers/form-sections/service-portfolio-section";
import {
  BUSINESS_TYPES,
  PAYMENT_CYCLES,
  CREDIT_TERMS,
} from "@/features/providers/constants";

import { toast } from "sonner";

export default function EditServiceProviderPage() {
  const router = useRouter();
  const params = useParams();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((s) => s.id === spId) ?? MOCK_SPS[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>(sp.mainServices || []);
  
  const brand = MOCK_BRANDS.find(b => b.id === sp.brandId);
  const brandCategories = brand?.serviceCategories || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof createSpSchema>>({
    resolver: zodResolver(createSpSchema),
    defaultValues: {
      name: sp.name,
      registrationNo: sp.registrationNo,
      website: sp.website ?? "",
      description: sp.description ?? "",
      mainServices: sp.mainServices || [],
      serviceCategories: sp.serviceCategories || [],
      isActive: sp.isActive,
      tinNumber: sp.tinNumber ?? "",
      classificationCode: sp.classificationCode ?? "",
      classificationDescriptor: sp.classificationDescriptor ?? "",
      documents: sp.documents ?? [],
      businessType: sp.businessType ?? "sdn_bhd",
      bankInfo: sp.bankInfo ?? { bankName: "", accountNumber: "", accountName: "" },
      address: sp.address ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" },
      needsEInvoiceSubmission: sp.needsEInvoiceSubmission ?? false,
      appointedForEInvoice: sp.appointedForEInvoice ?? false,
      expiredCommissionFee: sp.expiredCommissionFee ?? 0,
      paymentCycle: sp.paymentCycle ?? "",
      creditTerms: sp.creditTerms ?? "",
      commissionSchema: sp.commissionSchema ?? [],
    },
  });

  const businessType = useWatch({ control, name: "businessType" });

  const ANCHOR_ITEMS = [
    { id: "provider-profile", label: "Provider Profile" },
    { id: "registration-compliance", label: "Registration & Compliance" },
    { id: "registered-address", label: "Registered Address" },
    { id: "settlement-tax", label: "Settlement & Tax" },
    { id: "service-portfolio", label: "Service Portfolio" },
  ];

  const onSubmit = async (data: z.input<typeof createSpSchema>) => {
    setIsSubmitting(true);
    try {
      const derivedCategories = Array.from(new Set(
        selectedMainServices.map(serviceName => {
          const group = MASTER_SERVICE_TAXONOMY.find(g => g.services.some(s => s.name === serviceName));
          return group?.category;
        }).filter(Boolean) as string[]
      ));

      const payload = createSpSchema.parse({
        ...data,
        mainServices: selectedMainServices,
        serviceCategories: derivedCategories,
      });
      const res = await updateSp(spId, payload);
      if (res.success) {
        toast.success("Provider profile updated successfully");
        router.push(`/service-providers/${spId}`);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleServicesChange = (services: string[]) => {
    setSelectedMainServices(services);
    setValue("mainServices", services);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2.5 bg-background border rounded-lg text-body outline-none transition-all duration-200",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/10"
        : "border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-muted/10"
    );

  const labelCls = "text-body font-semibold text-subtle mb-1.5 block";

  const SERVICE_PORTFOLIO_TAXONOMY = MASTER_SERVICE_TAXONOMY
    .filter(group => brandCategories.length === 0 || brandCategories.includes(group.category))
    .map(group => ({
      category: group.category,
      services: group.services.map(s => s.name),
    }));

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
                <h1 className="text-heading font-semibold text-foreground text-balance">Edit Service Provider</h1>
                <p className="text-subtle text-body mt-1">Update profile, compliance details, and backend settings.</p>
              </div>
            </div>

            <form id="editSpForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section: Provider Profile */}
          <div id="provider-profile" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Storefront size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Provider Profile</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Service Provider Name</label>
                        <input
                            {...register("name")}
                            className={inputCls(!!errors.name)}
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Website Link</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-faint">
                                <Globe size={16} />
                            </div>
                            <input
                                {...register("website")}
                                className={cn(inputCls(!!errors.website), "pl-9")}
                                type="url"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Description</label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className={cn(inputCls(), "resize-none")}
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
                        <label className={labelCls}>Registration Number (BRN)</label>
                        <input
                            {...register("registrationNo")}
                            className={inputCls(!!errors.registrationNo)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>TIN Number</label>
                        <input
                            {...register("tinNumber")}
                            className={inputCls()}
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>SST Registration No. <span className="text-muted-foreground font-normal">(if applicable)</span></label>
                        <input
                            {...register("tinNumber")}
                            className={inputCls()}
                        />
                    </div>

                    <div className="sm:col-span-2 pt-4 space-y-6 border-t border-border/40">
                        <div className="space-y-3">
                            <label className={labelCls}>Business Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {BUSINESS_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setValue("businessType", type.id)}
                                        className={cn(
                                            "flex flex-col p-3 border rounded-lg text-left transition-all duration-200",
                                            businessType === type.id 
                                                ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20" 
                                                : "border-border hover:border-border-hover bg-muted/5"
                                        )}
                                    >
                                        <span className={cn("text-body font-semibold", businessType === type.id ? "text-primary" : "text-foreground")}>{type.label}</span>
                                        <span className="text-label text-subtle mt-0.5 leading-tight">{type.docs}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <Controller
                                control={control}
                                name="documents"
                                render={({ field }) => {
                                    const typeLabel = BUSINESS_TYPES.find(t => t.id === businessType)?.label || "Provider";
                                    return (
                                        <DocumentUploadSection
                                            documents={field.value || []}
                                            onChange={field.onChange}
                                            error={errors.documents?.message as string}
                                            label={`${typeLabel} Documents`}
                                        />
                                    );
                                }}
                            />
                        </div>
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
                        value={field.value ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" }}
                        onChange={(val) => field.onChange(val)}
                        errors={errors.address}
                      />
                    )}
                  />
                </div>
            </div>
          </div>

          {/* Section: Settlement & Tax Compliance */}
          <div id="settlement-tax" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bank size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">Settlement & Tax Compliance</h3>
                </div>

                <div className="space-y-8">
                    {/* Bank Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={labelCls}>Bank Name</label>
                            <input
                                {...register("bankInfo.bankName")}
                                className={inputCls(!!errors.bankInfo?.bankName)}
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={labelCls}>Account Name</label>
                            <input
                                {...register("bankInfo.accountName")}
                                className={inputCls(!!errors.bankInfo?.accountName)}
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={labelCls}>Account Number</label>
                            <input
                                {...register("bankInfo.accountNumber")}
                                className={cn(inputCls(!!errors.bankInfo?.accountNumber), "font-mono")}
                            />
                        </div>
                    </div>

                    {/* Billing Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-border/40">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Payment Cycle</label>
                            <select {...register("paymentCycle")} className={inputCls()}>
                                <option value="">Select Cycle</option>
                                {PAYMENT_CYCLES.map(cycle => (
                                    <option key={cycle} value={cycle}>{cycle}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Credit Terms</label>
                            <select {...register("creditTerms")} className={inputCls()}>
                                <option value="">Select Terms</option>
                                {CREDIT_TERMS.map(term => (
                                    <option key={term} value={term}>{term}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Expired Commission Fee</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-semibold text-body">%</div>
                                <input
                                    {...register("expiredCommissionFee", { valueAsNumber: true })}
                                    className={cn(inputCls(), "pl-9")}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* e-Invoice Settings */}
                    <div className="pt-6 border-t border-border/40 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:border-primary/20 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-faint group-hover:text-primary transition-colors">
                                        <Article size={18} weight="duotone" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-body font-medium text-foreground">Needs e-Invoice?</p>
                                        <p className="text-label text-subtle font-medium">Submission required</p>
                                    </div>
                                </div>
                                <Controller
                                    control={control}
                                    name="needsEInvoiceSubmission"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:border-primary/20 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-faint group-hover:text-primary transition-colors">
                                        <ShieldCheck size={18} weight="duotone" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-body font-medium text-foreground">Appointed Welluber?</p>
                                        <p className="text-label text-subtle font-medium">For submission</p>
                                    </div>
                                </div>
                                <Controller
                                    control={control}
                                    name="appointedForEInvoice"
                                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/5 border border-dashed border-border rounded-lg">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Classification Code</label>
                                <input
                                    {...register("classificationCode")}
                                    className={inputCls()}
                                    placeholder="e.g. 001"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Classification Descriptor</label>
                                <input
                                    {...register("classificationDescriptor")}
                                    className={inputCls()}
                                    placeholder="e.g. General"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Section: Service Portfolio */}
          <ServicePortfolioSection
            control={control}
            selectedMainServices={selectedMainServices}
            brandCategories={brandCategories}
            handleServicesChange={handleServicesChange}
            errors={errors}
            servicePortfolioTaxonomy={SERVICE_PORTFOLIO_TAXONOMY}
          />

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
        </form>
        
        {/* Spacer to allow last sections to scroll to top */}
        <div className="h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
