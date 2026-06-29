"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { type FieldPath, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { createSpSchema } from "@/features/providers/schemas"
import { updateSp } from "@/features/providers/actions"
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy"
import {
  FormStepIndicator,
  type FormWizardStep,
  WizardActionBar,
} from "@/components/shared/form-step-wizard"
import { MOCK_BRANDS, MOCK_SPS } from "@/lib/mock-data"
import { ServicePortfolioSection } from "@/components/host/service-providers/form-sections/service-portfolio-section"
import {
  EditServiceProviderCoreSections,
  EditServiceProviderHeader,
} from "@/components/host/service-providers/edit-service-provider-sections"
import { toast } from "sonner"

const EDIT_SP_WIZARD_STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Compliance & Finance" },
  { id: 3, label: "Services" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3>[]

type SpFormValues = z.input<typeof createSpSchema>
type SpFieldPath = FieldPath<SpFormValues>

const STEP_FIELDS: Record<1 | 2 | 3, SpFieldPath[]> = {
  1: ["name", "website", "description", "address"],
  2: [
    "registrationNo",
    "tinNumber",
    "documents",
    "businessType",
    "bankInfo.bankName",
    "bankInfo.accountName",
    "bankInfo.accountNumber",
    "paymentCycle",
    "creditTerms",
    "expiredCommissionFee",
    "needsEInvoiceSubmission",
    "appointedForEInvoice",
    "classificationCode",
    "classificationDescriptor",
  ],
  3: ["mainServices", "commissionSchema"],
}

export default function EditServiceProviderPage() {
  const router = useRouter()
  const params = useParams()
  const spId = params.id as string
  const sp = MOCK_SPS.find((provider) => provider.id === spId) ?? MOCK_SPS[0]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>(
    sp.mainServices || []
  )
  const brand = MOCK_BRANDS.find((item) => item.id === sp.brandId)
  const brandCategories = brand?.serviceCategories || []

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
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
      bankInfo: sp.bankInfo ?? {
        bankName: "",
        accountNumber: "",
        accountName: "",
      },
      address: sp.address ?? {
        line: "",
        city: "",
        state: "",
        country: "Malaysia",
        postalCode: "",
      },
      needsEInvoiceSubmission: sp.needsEInvoiceSubmission ?? false,
      appointedForEInvoice: sp.appointedForEInvoice ?? false,
      expiredCommissionFee: sp.expiredCommissionFee ?? 0,
      paymentCycle: sp.paymentCycle ?? "",
      creditTerms: sp.creditTerms ?? "",
      commissionSchema: sp.commissionSchema ?? [],
    },
  })

  const businessType = useWatch({ control, name: "businessType" })
  const paymentCycleValue = useWatch({ control, name: "paymentCycle" })
  const creditTermsValue = useWatch({ control, name: "creditTerms" })

  const onSubmit = async (data: z.input<typeof createSpSchema>) => {
    setIsSubmitting(true)
    try {
      const derivedCategories = Array.from(
        new Set(
          selectedMainServices
            .map((serviceName) => {
              const group = MASTER_SERVICE_TAXONOMY.find((taxonomyGroup) =>
                taxonomyGroup.services.some(
                  (service) => service.name === serviceName
                )
              )
              return group?.category
            })
            .filter(Boolean) as string[]
        )
      )

      const payload = createSpSchema.parse({
        ...data,
        mainServices: selectedMainServices,
        serviceCategories: derivedCategories,
      })
      const response = await updateSp(spId, payload)
      if (response.success) {
        toast.success("Provider profile updated successfully")
        router.push(`/service-providers/${spId}`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the provider right now."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep = async (step: 1 | 2 | 3) => {
    const isValid = await trigger(STEP_FIELDS[step])
    if (!isValid) {
      toast.error(
        "Complete the required fields in this step before continuing."
      )
    }
    return isValid
  }

  const goToStep = async (targetStep: 1 | 2 | 3) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep)
      return
    }

    for (let step = currentStep; step < targetStep; step += 1) {
      const isValid = await validateStep(step as 1 | 2 | 3)
      if (!isValid) {
        return
      }
    }

    setCurrentStep(targetStep)
  }

  const goNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < 3) {
      setCurrentStep((step) => (step + 1) as 1 | 2 | 3)
    }
  }

  const handleFinalStepSave = async () => {
    const isValid = await validateStep(3)

    if (!isValid) {
      return
    }

    void handleSubmit(onSubmit)()
  }

  const handleServicesChange = (services: string[]) => {
    setSelectedMainServices(services)
    setValue("mainServices", services)
  }

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full rounded-lg border bg-background px-3 py-2.5 text-body transition-all duration-200 outline-none",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/10"
        : "border-border focus:border-primary/40 focus:bg-muted/10 focus:ring-2 focus:ring-primary/10"
    )

  const labelCls = "mb-1.5 block text-body font-semibold text-subtle"

  const servicePortfolioTaxonomy = MASTER_SERVICE_TAXONOMY.filter(
    (group) =>
      brandCategories.length === 0 || brandCategories.includes(group.category)
  ).map((group) => ({
    category: group.category,
    services: group.services.map((service) => service.name),
  }))

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex-1">
        <div className="flex flex-col gap-6">
          <EditServiceProviderHeader onBack={() => router.back()} />
          <FormStepIndicator
            currentStep={currentStep}
            onStepClick={goToStep}
            steps={EDIT_SP_WIZARD_STEPS}
          />

          <form
            id="editSpForm"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {currentStep < 3 && (
              <EditServiceProviderCoreSections
                businessType={businessType ?? "sdn_bhd"}
                control={control}
                currentStep={currentStep as 1 | 2}
                creditTermsValue={creditTermsValue}
                errors={errors}
                inputCls={inputCls}
                labelCls={labelCls}
                onBusinessTypeChange={(value) =>
                  setValue(
                    "businessType",
                    value as "sdn_bhd" | "sole_prop" | "partnership_llp"
                  )
                }
                paymentCycleValue={paymentCycleValue}
                register={register}
                setValue={setValue}
              />
            )}

            {currentStep === 3 && (
              <ServicePortfolioSection
                control={control}
                selectedMainServices={selectedMainServices}
                brandCategories={brandCategories}
                handleServicesChange={handleServicesChange}
                errors={errors}
                servicePortfolioTaxonomy={servicePortfolioTaxonomy}
              />
            )}

            <WizardActionBar
              createLabel="Save Changes"
              currentStep={currentStep}
              isEditing
              isSubmitting={isSubmitting}
              onBack={() =>
                setCurrentStep((step) => Math.max(1, step - 1) as 1 | 2 | 3)
              }
              onNext={goNext}
              onSave={() => {
                void handleFinalStepSave()
              }}
              saveLabel="Save Changes"
              totalSteps={3}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
