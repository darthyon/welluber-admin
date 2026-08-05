"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Buildings,
  NavigationArrow,
  WarningCircle,
  IdentificationCard,
  MapPin,
  Bank,
  CalendarBlank,
  CaretDown,
} from "@phosphor-icons/react"
import { format, parse, isValid } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Button } from "@/components/ui/button"
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav"
import { LocationPicker } from "@/components/shared/location-picker"
import type { LocationData } from "@/components/shared/location-picker"
import { DocumentUploadSection } from "@/components/shared/document-upload-section"
import { FormSelect } from "@/components/shared/form-select"
import { MALAYSIAN_BANKS } from "@/lib/constants/banks"
import { toast } from "sonner"
import { NewOrganizationStepTwo } from "@/components/host/organizations/new-organization-step-two"
import { NewOrganizationPageHeader } from "@/components/host/organizations/new-organization-page-header"

const STEP1_ANCHORS = [
  { id: "org-profile", label: "Organisation Profile" },
  { id: "registration-compliance", label: "Registration & Compliance" },
  { id: "business-address", label: "Business Address" },
  { id: "payment-details", label: "Payment Details" },
]

const STEP2_ANCHORS = [
  { id: "hq-identity", label: "HQ Branch Identity" },
  { id: "hq-location", label: "Location Mapping" },
  { id: "hq-account", label: "Account Configuration" },
]

const ORG_TYPES = [
  {
    id: "sole_proprietorship",
    label: "Sole Proprietorship",
    docs: "Form D / MyCoID",
  },
  {
    id: "partnership",
    label: "Partnership",
    docs: "Form A / Partnership Deed",
  },
  {
    id: "sdn_bhd",
    label: "Private Limited (Sdn. Bhd.)",
    docs: "SSM Section 14 & 17",
  },
  { id: "llp", label: "LLP", docs: "LLP Registration Certificate" },
  { id: "bhd", label: "Public Limited (Bhd.)", docs: "Prospectus & SSM Cert" },
  { id: "clbg", label: "CLBG", docs: "Memorandum & Articles" },
]

export default function NewOrganizationPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fyOpen, setFyOpen] = useState(false)
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

  const getDocRequirements = (type: string) => {
    switch (type) {
      case "sole_proprietorship":
        return "Form D / MyCoID registration required"
      case "partnership":
        return "Form A and Partnership Deed required"
      case "sdn_bhd":
        return "SSM Certificate, Section 14 & Section 17 required"
      case "llp":
        return "LLP Registration Certificate required"
      case "bhd":
        return "Prospectus and SSM Certificate required"
      case "clbg":
        return "Memorandum and Articles of Association required"
      default:
        return "Supporting documents required"
    }
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        {/* Left Column: Navigation */}
        <aside className="sticky top-20 hidden w-52 shrink-0 self-start xl:block">
          <FloatingAnchorNav
            items={step === 1 ? STEP1_ANCHORS : STEP2_ANCHORS}
          />
        </aside>

        {/* Right Column */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            <NewOrganizationPageHeader
              onBack={() => (step === 1 ? router.back() : setStep(1))}
              orgName={pendingOrgData?.name}
              step={step}
            />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form
                id="newOrgForm"
                onSubmit={handleSubmit(onStep1Submit)}
                className="space-y-6"
              >
                {/* Organisation Profile */}
                <div
                  id="org-profile"
                  className="scroll-mt-24 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <div className="space-y-6 p-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Buildings size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">
                        Organisation Profile
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Company Name</label>
                        <input
                          {...register("name")}
                          className={inputCls(!!errors.name)}
                          placeholder="e.g. Acme Corporation Sdn Bhd"
                        />
                        {errors.name && (
                          <p className="mt-1 flex items-center gap-1 text-label text-destructive">
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

                      <div className="space-y-1.5">
                        <label className={labelCls}>Financial Year Start</label>
                        <Controller
                          control={control}
                          name="financialYearStart"
                          render={({ field }) => {
                            const parsed = field.value
                              ? parse(field.value, "yyyy-MM-dd", new Date())
                              : undefined
                            const selected =
                              parsed && isValid(parsed) ? parsed : undefined
                            return (
                              <Popover open={fyOpen} onOpenChange={setFyOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 text-body transition-all",
                                      "hover:border-primary/30 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 focus:outline-none",
                                      errors.financialYearStart
                                        ? "border-destructive"
                                        : "border-border"
                                    )}
                                  >
                                    <CalendarBlank
                                      size={16}
                                      className="shrink-0 text-faint"
                                    />
                                    <span
                                      className={
                                        selected
                                          ? "font-medium text-foreground"
                                          : "text-faint"
                                      }
                                    >
                                      {selected
                                        ? format(selected, "d MMM yyyy")
                                        : "Select date"}
                                    </span>
                                    <CaretDown
                                      size={14}
                                      className={cn(
                                        "ml-auto text-faint transition-transform",
                                        fyOpen && "rotate-180"
                                      )}
                                    />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-auto p-0"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={selected}
                                    onSelect={(date) => {
                                      field.onChange(
                                        date ? format(date, "yyyy-MM-dd") : ""
                                      )
                                      setFyOpen(false)
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration & Compliance */}
                <div
                  id="registration-compliance"
                  className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <div className="space-y-6 p-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IdentificationCard size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">
                        Registration & Compliance
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

                      <div className="space-y-2 border-t border-border/40 pt-4 sm:col-span-2">
                        <label className={labelCls}>Organisation Type</label>
                        <FormSelect
                          value={orgType || ""}
                          onChange={(v) =>
                            setValue(
                              "type",
                              v as CreateOrganizationData["type"]
                            )
                          }
                          options={[
                            { label: "Select type", value: "" },
                            ...ORG_TYPES.map((t) => ({
                              label: t.label,
                              value: t.id,
                            })),
                          ]}
                          error={!!errors.type}
                        />
                      </div>

                      <div className="border-t border-border/40 pt-4 sm:col-span-2">
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

                {/* Business Address */}
                <div
                  id="business-address"
                  className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <div className="space-y-6 p-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin size={16} weight="fill" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lead font-semibold text-foreground">
                          Business Address
                        </h3>
                        <p className="text-label text-muted-foreground">
                          Official business address as per SSM registration.
                        </p>
                      </div>
                    </div>
                    <div className="p-1">
                      <Controller
                        control={control}
                        name="address"
                        render={({ field }) => (
                          <LocationPicker
                            value={
                              field.value ?? {
                                line: "",
                                city: "",
                                state: "",
                                country: "Malaysia",
                                postalCode: "",
                              }
                            }
                            onChange={field.onChange}
                            errors={errors.address}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div
                  id="payment-details"
                  className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <div className="space-y-8 p-6">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bank size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">
                        Payment Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Bank Name</label>
                        <FormSelect
                          value={bankNameValue || ""}
                          onChange={(v) =>
                            setValue("bankAccountDetails.bankName", v)
                          }
                          options={[
                            { label: "Select bank", value: "" },
                            ...MALAYSIAN_BANKS.map((b) => ({
                              label: b,
                              value: b,
                            })),
                          ]}
                          error={!!errors.bankAccountDetails?.bankName}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Account Number</label>
                        <input
                          {...register("bankAccountDetails.accountNumber")}
                          className={cn(
                            inputCls(
                              !!errors.bankAccountDetails?.accountNumber
                            ),
                            "font-mono"
                          )}
                          placeholder="e.g. 5140 1234 5678"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Account Name</label>
                        <input
                          {...register("bankAccountDetails.accountName")}
                          className={inputCls(
                            !!errors.bankAccountDetails?.accountName
                          )}
                          placeholder="e.g. Acme Corporation Sdn Bhd"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Action Bar — Step 1 */}
                <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10 lg:left-[calc(50%+104px)] lg:translate-x-0">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-6 text-body font-semibold transition-colors"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <div className="h-6 w-px bg-border/40" />
                  <Button
                    type="submit"
                    size="lg"
                    className="flex items-center gap-2 px-8 text-body font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Next
                    <NavigationArrow
                      size={14}
                      weight="bold"
                      className="rotate-90"
                    />
                  </Button>
                </div>

                <div className="h-[60vh]" />
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <NewOrganizationStepTwo
                accountName={accountName}
                branchAddress={branchAddress}
                branchName={branchName}
                creditLimit={creditLimit}
                isSubmitting={isSubmitting}
                labelCls={labelCls}
                onAccountNameChange={setAccountName}
                onBack={() => setStep(1)}
                onBranchAddressChange={setBranchAddress}
                onBranchNameChange={setBranchName}
                onConfirm={handleConfirm}
                onCreditLimitChange={setCreditLimit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
