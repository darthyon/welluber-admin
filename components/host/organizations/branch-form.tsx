"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Building,
  CaretLeft,
  CheckCircle,
  IdentificationCard,
  MapPin,
  Wallet,
} from "@phosphor-icons/react"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import {
  FormStepIndicator,
  type FormWizardStep,
  WizardActionBar,
} from "@/components/shared/form-step-wizard"
import { LocationPicker } from "@/components/shared/location-picker"
import type { LocationData } from "@/components/shared/location-picker"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { MOCK_ACCOUNTS } from "@/lib/mock-data"

export interface BranchFormData {
  name: string
  address: {
    city: string
    country: string
    lat: string
    line: string
    lon: string
    postalCode: string
    state: string
  }
}

interface BranchFormProps {
  branchId?: string | null
  onCancel: () => void
  onSubmit: (data: BranchFormData) => void
}

interface ConfigurationErrors {
  accountName?: string
  creditLimit?: string
  existingAccountId?: string
}

const BRANCH_WIZARD_STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Configuration" },
] as const satisfies readonly FormWizardStep<1 | 2>[]

const STEP_FIELDS: Record<
  1 | 2,
  Array<keyof BranchFormData | `address.${keyof BranchFormData["address"]}`>
> = {
  1: [
    "name",
    "address.line",
    "address.city",
    "address.state",
    "address.postalCode",
    "address.country",
  ],
  2: [],
}

export function BranchForm({ branchId, onCancel, onSubmit }: BranchFormProps) {
  const isEditing = !!branchId
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [accountType, setAccountType] = useState<"new" | "existing">("new")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [accountName, setAccountName] = useState("")
  const [creditLimit, setCreditLimit] = useState("")
  const [existingAccountId, setExistingAccountId] = useState("")
  const [configurationErrors, setConfigurationErrors] =
    useState<ConfigurationErrors>({})

  const defaultValues: BranchFormData = {
    name: branchId
      ? branchId === "br_1"
        ? "ACME HQ (Kuala Lumpur)"
        : "ACME Subang Jaya"
      : "",
    address: {
      city: branchId ? "Kuala Lumpur" : "",
      country: "Malaysia",
      lat: branchId ? "3.1390" : "",
      line: branchId ? "Level 12, Menara South" : "",
      lon: branchId ? "101.7036" : "",
      postalCode: branchId ? "55100" : "",
      state: branchId ? "Wilayah Persekutuan" : "",
    },
  }

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
  } = useForm<BranchFormData>({
    defaultValues,
    mode: "onTouched",
  })

  const formData = watch()

  const goToStep = async (step: 1 | 2) => {
    if (step <= currentStep) {
      setCurrentStep(step)
      return
    }

    const isValid = await trigger(STEP_FIELDS[currentStep])
    if (isValid) {
      setCurrentStep(step)
    }
  }

  const goNext = async () => {
    const isValid = await trigger(STEP_FIELDS[currentStep])
    if (isValid) {
      setCurrentStep(2)
    }
  }

  const validateConfigurationStep = () => {
    const nextErrors: ConfigurationErrors = {}

    if (accountType === "new") {
      if (!accountName.trim()) {
        nextErrors.accountName = "Enter an account name."
      }

      if (!creditLimit.trim()) {
        nextErrors.creditLimit = "Enter a credit limit."
      } else if (Number.isNaN(Number(creditLimit)) || Number(creditLimit) < 0) {
        nextErrors.creditLimit = "Enter a valid non-negative credit limit."
      }
    }

    if (accountType === "existing" && !existingAccountId) {
      nextErrors.existingAccountId = "Select an existing account."
    }

    setConfigurationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onFormSubmit = async (data: BranchFormData) => {
    if (!validateConfigurationStep()) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)

    setTimeout(() => {
      onSubmit(data)
    }, 2500)
  }

  const handleFinalStepSave = () => {
    if (!validateConfigurationStep()) {
      return
    }

    void handleSubmit(onFormSubmit)()
  }

  if (isSuccess) {
    return (
      <div className="animate-in space-y-8 duration-400 fade-in slide-in-from-bottom-2">
        <div className="animate-in rounded-lg border border-border bg-card py-20 duration-300 zoom-in-95">
          <SuccessCelebration
            title={isEditing ? "Changes Saved!" : "Branch Created!"}
            message={
              isEditing
                ? `${formData.name} has been successfully updated.`
                : `A new chapter begins for ${formData.name}. Top up the account from the branch detail page.`
            }
          />
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="animate-in space-y-8 pb-24 duration-500 fade-in slide-in-from-bottom-4"
      noValidate
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
        >
          <CaretLeft size={16} />
          Back
        </button>

        <div>
          <h1 className="text-heading font-semibold text-balance text-foreground">
            {isEditing ? "Edit Branch" : "Add New Branch"}
          </h1>
          <p className="mt-1 text-body text-subtle">
            Configure location, personnel, and financial mapping for this
            branch.
          </p>
        </div>
      </div>

      <FormStepIndicator
        currentStep={currentStep}
        onStepClick={goToStep}
        steps={BRANCH_WIZARD_STEPS}
      />

      <div className="min-w-0">
        {currentStep === 1 && (
          <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Branch Identity
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Basic identifiers and branch classification.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-body font-semibold text-subtle">
                      Branch Name
                    </label>
                    <input
                      {...register("name", {
                        required: "Enter a branch name.",
                      })}
                      placeholder="e.g. ACME Subang Jaya"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-body font-medium text-foreground transition-all outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                    {errors.name && (
                      <p className="text-label text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Location Mapping
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Geographical data and coordinate pinning.
                    </p>
                  </div>
                </div>

                <div className="p-1">
                  <LocationPicker
                    value={
                      (formData.address as LocationData) ?? {
                        line: "",
                        city: "",
                        state: "",
                        country: "Malaysia",
                        postalCode: "",
                      }
                    }
                    onChange={(addr) => {
                      setValue("address.line", addr.line ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue("address.city", addr.city ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue("address.state", addr.state ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue("address.postalCode", addr.postalCode ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue("address.country", addr.country ?? "Malaysia", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue(
                        "address.lat",
                        addr.lat !== undefined ? String(addr.lat) : "",
                        { shouldDirty: true }
                      )
                      setValue(
                        "address.lon",
                        addr.lon !== undefined ? String(addr.lon) : "",
                        { shouldDirty: true }
                      )
                    }}
                  />
                </div>

                <input
                  type="hidden"
                  {...register("address.line", {
                    required: "Enter an address line.",
                  })}
                />
                <input
                  type="hidden"
                  {...register("address.city", {
                    required: "Enter a city.",
                  })}
                />
                <input
                  type="hidden"
                  {...register("address.state", {
                    required: "Enter a state.",
                  })}
                />
                <input
                  type="hidden"
                  {...register("address.postalCode", {
                    required: "Enter a postal code.",
                  })}
                />
                <input
                  type="hidden"
                  {...register("address.country", {
                    required: "Enter a country.",
                  })}
                />
                <input type="hidden" {...register("address.lat")} />
                <input type="hidden" {...register("address.lon")} />

                {(errors.address?.line ||
                  errors.address?.city ||
                  errors.address?.state ||
                  errors.address?.postalCode ||
                  errors.address?.country) && (
                  <p className="text-label text-destructive">
                    Complete the branch address before moving to configuration.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in duration-300 fade-in slide-in-from-right-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wallet size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Configuration
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Define how this branch is funded. Top up after creation
                      from the branch detail page.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ChoiceCard
                    title="New Account"
                    description="Create a dedicated standalone account for this branch. Funds are isolated."
                    selected={accountType === "new"}
                    onSelect={() => {
                      setAccountType("new")
                      setConfigurationErrors({})
                    }}
                    icon={Wallet}
                  />
                  <ChoiceCard
                    title="Existing Account"
                    description="Link this branch to an existing account (e.g. Shared with HQ or another cluster)."
                    selected={accountType === "existing"}
                    onSelect={() => {
                      setAccountType("existing")
                      setConfigurationErrors({})
                    }}
                    icon={IdentificationCard}
                  />
                </div>

                <div className="space-y-6">
                  {accountType === "new" ? (
                    <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="mb-1.5 block text-body font-semibold text-subtle">
                          Account Name
                        </label>
                        <input
                          value={accountName}
                          onChange={(e) => {
                            setAccountName(e.target.value)
                            if (configurationErrors.accountName) {
                              setConfigurationErrors((prev) => ({
                                ...prev,
                                accountName: undefined,
                              }))
                            }
                          }}
                          placeholder="e.g. PJ Ops Account"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-body font-semibold text-foreground transition-all outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                        />
                        {configurationErrors.accountName && (
                          <p className="text-label text-destructive">
                            {configurationErrors.accountName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="mb-1.5 block text-body font-semibold text-subtle">
                          Credit Limit (RM)
                        </label>
                        <input
                          type="number"
                          value={creditLimit}
                          onChange={(e) => {
                            setCreditLimit(e.target.value)
                            if (configurationErrors.creditLimit) {
                              setConfigurationErrors((prev) => ({
                                ...prev,
                                creditLimit: undefined,
                              }))
                            }
                          }}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-body font-semibold text-foreground transition-all outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                        />
                        {configurationErrors.creditLimit && (
                          <p className="text-label text-destructive">
                            {configurationErrors.creditLimit}
                          </p>
                        )}
                        <p className="text-label font-medium text-faint">
                          Max overdraft this branch may use beyond its balance.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="mb-1.5 block text-body font-semibold text-subtle">
                          Default Currency
                        </label>
                        <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-body">
                          <span className="flex h-5 w-8 items-center justify-center rounded-sm bg-muted text-label font-medium text-muted-foreground">
                            MYR
                          </span>
                          <span className="font-semibold whitespace-nowrap text-foreground">
                            Malaysian Ringgit (RM)
                          </span>
                          <span className="ml-auto text-label font-semibold text-faint">
                            Locked
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-2">
                      <label className="mb-1.5 block text-body font-semibold text-subtle">
                        Bridge to Existing Account
                      </label>
                      <FormSelect
                        value={existingAccountId}
                        onChange={(value) => {
                          setExistingAccountId(value)
                          if (configurationErrors.existingAccountId) {
                            setConfigurationErrors((prev) => ({
                              ...prev,
                              existingAccountId: undefined,
                            }))
                          }
                        }}
                        options={[
                          { label: "Select an account...", value: "" },
                          ...MOCK_ACCOUNTS.map((acc) => ({
                            label: `${acc.name} — RM ${acc.balance.toLocaleString()} MYR`,
                            value: acc.id,
                          })),
                        ]}
                        placeholder="Select an account..."
                      />
                      {configurationErrors.existingAccountId && (
                        <p className="text-label text-destructive">
                          {configurationErrors.existingAccountId}
                        </p>
                      )}
                      <p className="mt-1.5 text-label font-medium text-faint italic">
                        * This branch will consume funds from the selected
                        centralized liquidity pool.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-start gap-3 text-body text-subtle">
                      <CheckCircle
                        size={18}
                        weight="fill"
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      <span>
                        Administrative fees are consolidated at the parent
                        organization level for all linked accounts.
                      </span>
                    </div>

                    {accountType === "new" && (
                      <div className="flex animate-in items-start gap-3 text-body text-subtle duration-300 fade-in">
                        <CheckCircle
                          size={18}
                          weight="fill"
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        <span>
                          A 1.5% administrative fee applies to all standalone
                          accounts.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <WizardActionBar
        createLabel="Create Branch"
        currentStep={currentStep}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onBack={() => setCurrentStep(1)}
        onNext={goNext}
        onSave={handleFinalStepSave}
        saveLabel="Save Changes"
        totalSteps={2}
      />
    </form>
  )
}
