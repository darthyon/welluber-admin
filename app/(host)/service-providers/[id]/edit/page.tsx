"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { createSpSchema } from "@/features/providers/schemas";
import { updateSp } from "@/features/providers/actions";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { MOCK_BRANDS, MOCK_SPS } from "@/lib/mock-data";
import { ServicePortfolioSection } from "@/components/host/service-providers/form-sections/service-portfolio-section";
import {
  EditServiceProviderActionBar,
  EditServiceProviderCoreSections,
  EditServiceProviderHeader,
  EditServiceProviderSidebar,
} from "@/components/host/service-providers/edit-service-provider-sections";
import { toast } from "sonner";

export default function EditServiceProviderPage() {
  const router = useRouter();
  const params = useParams();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((provider) => provider.id === spId) ?? MOCK_SPS[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>(sp.mainServices || []);
  const brand = MOCK_BRANDS.find((item) => item.id === sp.brandId);
  const brandCategories = brand?.serviceCategories || [];

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<z.input<typeof createSpSchema>>({
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
  const paymentCycleValue = useWatch({ control, name: "paymentCycle" });
  const creditTermsValue = useWatch({ control, name: "creditTerms" });

  const onSubmit = async (data: z.input<typeof createSpSchema>) => {
    setIsSubmitting(true);
    try {
      const derivedCategories = Array.from(new Set(selectedMainServices.map((serviceName) => {
        const group = MASTER_SERVICE_TAXONOMY.find((taxonomyGroup) => taxonomyGroup.services.some((service) => service.name === serviceName));
        return group?.category;
      }).filter(Boolean) as string[]));

      const payload = createSpSchema.parse({ ...data, mainServices: selectedMainServices, serviceCategories: derivedCategories });
      const response = await updateSp(spId, payload);
      if (response.success) {
        toast.success("Provider profile updated successfully");
        router.push(`/service-providers/${spId}`);
      }
    } catch (error) {
      console.error(error);
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
      hasError ? "border-destructive focus:ring-2 focus:ring-destructive/10" : "border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-muted/10"
    );

  const labelCls = "mb-1.5 block text-body font-semibold text-subtle";

  const servicePortfolioTaxonomy = MASTER_SERVICE_TAXONOMY
    .filter((group) => brandCategories.length === 0 || brandCategories.includes(group.category))
    .map((group) => ({ category: group.category, services: group.services.map((service) => service.name) }));

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <EditServiceProviderSidebar />

        <div className="flex-1">
          <div className="flex flex-col gap-6">
            <EditServiceProviderHeader onBack={() => router.back()} />

            <form id="editSpForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <EditServiceProviderCoreSections
                businessType={businessType ?? "sdn_bhd"}
                control={control}
                creditTermsValue={creditTermsValue}
                errors={errors}
                inputCls={inputCls}
                labelCls={labelCls}
                onBack={() => router.back()}
                onBusinessTypeChange={(value) => setValue("businessType", value as "sdn_bhd" | "sole_prop" | "partnership_llp")}
                paymentCycleValue={paymentCycleValue}
                register={register}
                setValue={setValue}
              />

              <ServicePortfolioSection
                control={control}
                selectedMainServices={selectedMainServices}
                brandCategories={brandCategories}
                handleServicesChange={handleServicesChange}
                errors={errors}
                servicePortfolioTaxonomy={servicePortfolioTaxonomy}
              />

              <EditServiceProviderActionBar isSubmitting={isSubmitting} onCancel={() => router.back()} />
            </form>

            <div className="h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
