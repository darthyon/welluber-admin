"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CaretLeft,
  Tag,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createSpSchema } from "@/features/providers/schemas";
import { createSp } from "@/features/providers/actions";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_BRANDS } from "@/lib/mock-data";
import { BrandSelectionModal } from "@/components/host/service-providers/brand-selection-modal";
import { Brand } from "@/types/brand";
import { FormActionBar, FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard";

type Step = "selection" | "details";
type BrandType = "new" | "existing";

const PROVIDER_STEPS = [
  { id: 1, label: "Provider Profile" },
  { id: 2, label: "Compliance And Address" },
  { id: 3, label: "Settlement And Services" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3>[];

import { BrandIdentitySection } from "@/components/host/service-providers/form-sections/brand-identity-section";
import { ProviderProfileSection } from "@/components/host/service-providers/form-sections/provider-profile-section";
import { RegistrationComplianceSection } from "@/components/host/service-providers/form-sections/registration-compliance-section";
import { RegisteredAddressSection } from "@/components/host/service-providers/form-sections/registered-address-section";
import { SettlementTaxSection } from "@/components/host/service-providers/form-sections/settlement-tax-section";
import { ServicePortfolioSection } from "@/components/host/service-providers/form-sections/service-portfolio-section";
import { SuccessModal } from "@/components/shared/success-modal";

export default function NewServiceProviderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("selection");
  const [detailsStep, setDetailsStep] = useState<1 | 2 | 3>(1);
  const [brandType, setBrandType] = useState<BrandType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>([]);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandCategories, setBrandCategories] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdSpId, setCreatedSpId] = useState<string | null>(null);
  const [createdSpName, setCreatedSpName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<(z.input<typeof createSpSchema>) & { brandName?: string; brandLogo?: File | string | null }>({
    resolver: zodResolver(createSpSchema),
    defaultValues: { 
        isActive: true, 
        mainServices: [], 
        serviceCategories: [],
        businessType: "sdn_bhd",
        needsEInvoiceSubmission: false,
        appointedForEInvoice: false,
        expiredCommissionFee: 0,
        commissionSchema: [],
        address: { country: "Malaysia" }
    },
  });

  const businessType = useWatch({ control, name: "businessType" });

  const onSubmit = async (data: (z.input<typeof createSpSchema>) & { brandName?: string }) => {
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

      const res = await createSp(payload);

      if (res.success) {
        setCreatedSpId(res.data.id);
        setCreatedSpName(data.name || data.brandName || "Service Provider");
        setIsSuccessModalOpen(true);
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

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandCategories(brand.serviceCategories || []);
    setIsBrandModalOpen(false);
    setDetailsStep(1);
    setStep("details");
  };

  const goNext = () => setDetailsStep((current) => Math.min(3, current + 1) as 1 | 2 | 3);

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

  if (step === "selection") {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors mb-4"
          >
            <CaretLeft size={16} /> Back
          </button>
          <h1 className="text-heading font-semibold text-foreground text-balance">Add Service Provider</h1>
          <p className="text-subtle text-body mt-1">Select how you want to categorize this service provider account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => { setBrandType("new"); setStep("details"); }}
            className="group flex flex-col p-6 bg-card border border-border/60 rounded-lg hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-left space-y-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Plus size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">New Brand</h3>
              <p className="text-label text-muted-foreground mt-1 leading-relaxed">Create a fresh brand record and link this service provider account to it.</p>
            </div>
          </button>

          <button
            onClick={() => { setBrandType("existing"); setIsBrandModalOpen(true); }}
            className="group flex flex-col p-6 bg-card border border-border/60 rounded-lg hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-left space-y-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Tag size={20} weight="fill" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Existing Brand</h3>
              <p className="text-label text-muted-foreground mt-1 leading-relaxed">Select from your existing portfolio of brands to link this service provider.</p>
            </div>
          </button>
        </div>

        <BrandSelectionModal 
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          onSelect={handleBrandSelect}
          brands={MOCK_BRANDS}
        />
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStep("selection")}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Change Brand Selection
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-heading font-semibold text-foreground text-balance">Account Details</h1>
                  <p className="text-subtle text-body mt-1">
                    {brandType === "new" ? "Registering a new brand and its first service provider." : `Adding a new provider under the ${selectedBrand?.name} brand.`}
                  </p>
                </div>
                {selectedBrand && (
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/40">
                    <Avatar className="h-6 w-6 rounded-full">
                      <AvatarImage src={selectedBrand.logo} />
                      <AvatarFallback className="text-label font-medium">{selectedBrand.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-label font-semibold text-subtle">{selectedBrand.name}</span>
                  </div>
                )}
              </div>
            </div>

            <FormStepIndicator currentStep={detailsStep} onStepClick={setDetailsStep} steps={PROVIDER_STEPS} />

            <form
              id="newSpForm"
              onSubmit={detailsStep === 3 ? handleSubmit(onSubmit) : (event) => {
                event.preventDefault();
                goNext();
              }}
              className="space-y-6"
            >
              {detailsStep === 1 && brandType === "new" && (
                <BrandIdentitySection 
                  register={register} 
                  control={control} 
                  errors={errors} 
                  labelCls={labelCls} 
                  inputCls={inputCls} 
                />
              )}

              {detailsStep === 1 && <ProviderProfileSection
                register={register} 
                errors={errors} 
                labelCls={labelCls} 
                inputCls={inputCls} 
              />}

              {detailsStep === 2 && <RegistrationComplianceSection
                register={register} 
                control={control} 
                errors={errors} 
                setValue={setValue} 
                businessType={businessType} 
                labelCls={labelCls} 
                inputCls={inputCls} 
              />}

              {detailsStep === 2 && <RegisteredAddressSection
                control={control} 
                errors={errors} 
              />}

              {detailsStep === 3 && <SettlementTaxSection
                register={register} 
                control={control} 
                setValue={setValue}
                errors={errors} 
                labelCls={labelCls} 
                inputCls={inputCls} 
              />}

              {detailsStep === 3 && <ServicePortfolioSection
                control={control}
                selectedMainServices={selectedMainServices}
                brandCategories={brandCategories}
                handleServicesChange={handleServicesChange}
                errors={errors}
                servicePortfolioTaxonomy={SERVICE_PORTFOLIO_TAXONOMY}
              />}

              <FormActionBar
                currentStep={detailsStep}
                totalSteps={3}
                mode="create"
                onCancel={() => router.back()}
                onBack={() => setDetailsStep((current) => Math.max(1, current - 1) as 1 | 2 | 3)}
                onNext={goNext}
                primaryLabel="Create Provider"
                primaryIcon="plus"
                formId="newSpForm"
                isSubmitting={isSubmitting}
              />
            </form>
            
            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={() => router.push("/service-providers")}
              title="Provider Registered"
              message={`${createdSpName} has been successfully created. Next, add their first branch to make them operational.`}
              primaryAction={{
                label: "Add First Branch",
                onClick: () => router.push(`/service-providers/${createdSpId}/branches/new`),
              }}
              secondaryAction={{
                label: "View Profile",
                onClick: () => router.push(`/service-providers/${createdSpId}`),
              }}
            />
          </div>
      </div>
    </div>
  );
}
