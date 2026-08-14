"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import {
  createOrganizationSchema,
  CreateOrganizationData,
  HqBranchData,
} from "@/features/organizations/schemas"
import {
  createOrganization,
  createHqBranch,
} from "@/features/organizations/actions"
import { orgStore, accountStore } from "@/lib/mock-data/store"
import { Registry } from "@/lib/mock-data/registry"
import type { Organization } from "@/features/organizations/types"
import type { Account } from "@/features/accounts/types"
import { FormActionBar, FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard"
import type { LocationData } from "@/components/shared/location-picker"
import { toast } from "sonner"
import { NewOrganizationStepOne } from "@/components/host/organizations/new-organization-step-one"
import { NewOrganizationStepTwo } from "@/components/host/organizations/new-organization-step-two"
import { NewOrganizationPageHeader } from "@/components/host/organizations/new-organization-page-header"

const ORGANIZATION_STEPS = [
  { id: 1, label: "Organization Details" },
  { id: 2, label: "HQ Branch And Account" },
] as const satisfies readonly FormWizardStep<1 | 2>[]

export default function NewOrganizationPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingOrgData, setPendingOrgData] =
    useState<CreateOrganizationData | null>(null)

  // HQ branch state
  const [branchName, setBranchName] = useState("")
  const [branchAddress, setBranchAddress] = useState<LocationData>({
    line: "",
    city: "",
    state: "",
    country: "Malaysia",
    postalCode: "",
  })
  const [accountName, setAccountName] = useState("")
  const [creditLimit, setCreditLimit] = useState("")

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationData>({
    resolver: zodResolver(
      createOrganizationSchema
    ) as Resolver<CreateOrganizationData>,
    // address must be seeded: left undefined, zod reports one object-level
    // error instead of per-field ones, and LocationPicker renders nothing —
    // the step silently refuses to advance with no visible reason.
    defaultValues: {
      type: "sdn_bhd",
      documents: [],
      address: { line: "", city: "", state: "", postalCode: "", country: "Malaysia" },
    },
  })

  const industryValue = watch("industry")
  const bankNameValue = watch("bankAccountDetails.bankName")
  const orgType = watch("type")

  const onStep1Submit = (data: CreateOrganizationData) => {
    setPendingOrgData(data)
    setBranchName(data.name ? `${data.name} HQ` : "")
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToStep = (targetStep: 1 | 2) => {
    if (targetStep === 1) {
      setStep(1)
      return
    }
    void handleSubmit(onStep1Submit)()
  }

  const handleConfirm = async () => {
    if (!pendingOrgData) return
    setIsSubmitting(true)
    try {
      const orgRes = await createOrganization(pendingOrgData)
      if (!orgRes.success) throw new Error("Organisation creation failed")

      const orgId = orgRes.data.id
      const hqBranchName = branchName || `${pendingOrgData.name} HQ`
      const branchData: HqBranchData = {
        name: hqBranchName,
        address: branchAddress,
        accountName: accountName || undefined,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
      }
      const branchRes = await createHqBranch(orgId, branchData)
      const branchId = branchRes.data.id

      // Register the new org (and its dedicated HQ account) in the client-side
      // mock registry so the detail and list pages render a real record.
      const now = new Date().toISOString()
      const newAccount: Account = {
        id: `ACC-${orgId.replace(/^ORG-(NEW-)?/, "")}`,
        name: accountName || `${hqBranchName} Account`,
        orgId,
        orgName: pendingOrgData.name,
        branchId,
        branchName: hqBranchName,
        type: "new",
        balance: 0,
        pendingDeductions: 0,
        status: "active",
        createdAt: now,
        updatedAt: now,
      }
      const newOrg: Organization = {
        id: orgId,
        name: pendingOrgData.name,
        registrationNumber: pendingOrgData.registrationNumber,
        industry: pendingOrgData.industry,
        subIndustry: pendingOrgData.subIndustry,
        type: pendingOrgData.type,
        financialYearStart:
          pendingOrgData.financialYearStart ||
          `${new Date().getFullYear()}-01-01`,
        subscription: {
          plan: pendingOrgData.subscription?.plan ?? "standard",
          startDate: now,
          status: "active",
        },
        status: "active",
        tinNumber: pendingOrgData.tinNumber,
        address: { ...pendingOrgData.address },
        bankAccountDetails: pendingOrgData.bankAccountDetails,
        employeeCount: 0,
        picId: null,
        utilizationRate: 0,
        claimsCount: 0,
        totalAccountBalance: 0,
        accountLimit: 0,
        creditLimit: creditLimit ? Number(creditLimit) : 0,
        needsAction: ["Missing PIC", "No Policies"],
        services: [],
        policies: [],
        branches: [branchId],
        documents: pendingOrgData.documents ?? [],
        employeesWithoutPolicy: 0,
        createdAt: now,
        updatedAt: now,
      }
      accountStore.add(newAccount)
      orgStore.add(newOrg)
      // The org list's Accounts column reads from the Registry maps, so keep it in sync.
      Registry.accounts.set(newAccount.id, newAccount)
      Registry.organizations.set(newOrg.id, newOrg)

      toast.success("Organisation and HQ branch created")
      router.push(`/organizations/${orgId}`)
    } catch (e) {
      console.error(e)
      toast.error("Failed to create organisation")
      setIsSubmitting(false)
    }
  }

  const inputCls = (hasError?: boolean) =>
    cn(
      "h-10 w-full rounded-lg border bg-background px-3 py-2 text-body transition-all duration-200 outline-none",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/10"
        : "border-border focus:border-primary/40 focus:bg-muted/10 focus:ring-2 focus:ring-primary/10"
    )

  const labelCls = "text-body font-semibold text-subtle mb-1.5 block"

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col gap-6">
            <NewOrganizationPageHeader
              onBack={() => (step === 1 ? router.back() : setStep(1))}
              orgName={pendingOrgData?.name}
              step={step}
            />

            <FormStepIndicator currentStep={step} onStepClick={goToStep} steps={ORGANIZATION_STEPS} />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <NewOrganizationStepOne
                control={control}
                errors={errors}
                inputCls={inputCls}
                labelCls={labelCls}
                onSubmit={handleSubmit(onStep1Submit)}
                register={register}
                setValue={setValue}
                values={{
                  bankNameValue,
                  industryValue,
                  orgType,
                }}
              />
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <NewOrganizationStepTwo
                accountName={accountName}
                branchAddress={branchAddress}
                branchName={branchName}
                creditLimit={creditLimit}
                labelCls={labelCls}
                onAccountNameChange={setAccountName}
                onBranchAddressChange={setBranchAddress}
                onBranchNameChange={setBranchName}
                onCreditLimitChange={setCreditLimit}
              />
            )}

            <FormActionBar
              currentStep={step}
              totalSteps={2}
              mode="create"
              onCancel={() => (step === 1 ? router.back() : setStep(1))}
              onBack={() => setStep(1)}
              onNext={() => void handleSubmit(onStep1Submit)()}
              onSave={step === 2 ? handleConfirm : undefined}
              primaryLabel="Confirm And Create"
              primaryIcon="check"
              formId={step === 1 ? "newOrgForm" : undefined}
              isSubmitting={isSubmitting}
            />
          </div>
      </div>
    </div>
  )
}
