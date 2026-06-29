"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  WarningCircle,
  Ticket,
  Buildings,
  MapPin,
} from "@phosphor-icons/react"
import { cn, getCurrencyLabel } from "@/lib/utils"
import { Switch } from "@/components/shared/switch"
import { createVoucherSchema } from "@/features/providers/schemas"
import {
  createVoucher,
  updateVoucher,
  publishVoucher,
} from "@/features/providers/actions"
import { ChoiceCard } from "@/components/shared/choice-card"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { CustomMultiSelect } from "@/components/shared/custom-multi-select"
import { toast } from "sonner"
import type { SpBranchBookingSettings, SpVoucher } from "@/types/provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  VoucherFormHeader,
  VoucherStepIndicator,
  VoucherWizardActionBar,
} from "@/components/host/service-providers/sp-voucher-form-frame"
import {
  VoucherConfigurationSection,
  VoucherManageServicesSection,
} from "@/components/host/service-providers/sp-voucher-form-sections"

interface SpVoucherFormProps {
  spId: string
  spServiceCategories: string[]
  spBranches: {
    id: string
    name: string
    currency?: string
    booking: SpBranchBookingSettings
  }[]
  voucher?: SpVoucher
  onSuccess: () => void
  onCancel: () => void
}

const BOOKING_CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone Number",
  booking_website: "Booking Website",
} as const

function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) return ""

  const date = new Date(value)

  if (isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function createDefaultDateTime(offsetMinutes = 0): string {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMinutes(date.getMinutes() + offsetMinutes)

  return toDateTimeLocalValue(date.toISOString())
}

export function SpVoucherForm({
  spId,
  spServiceCategories,
  spBranches,
  voucher,
  onSuccess,
  onCancel,
}: SpVoucherFormProps) {
  const isEditing = !!voucher
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<z.input<typeof createVoucherSchema>>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      name: voucher?.name || "",
      description: voucher?.description || "",
      bookingRequired: voucher?.bookingRequired || false,
      serviceLines: voucher?.serviceLines || [
        {
          service: "",
          subServices: [],
          description: "",
          descriptionList: "",
          price: 0,
        },
      ],
      currency: getCurrencyLabel(voucher?.currency),
      initialPrice: voucher?.initialPrice || 0,
      discount: voucher?.discount || { type: "amount", value: 0 },
      finalPrice: voucher?.finalPrice || 0,
      voucherCount: voucher?.voucherCount,
      maxUsagePerUser: voucher?.maxUsagePerUser ?? 1,
      activationPeriod: {
        startDate:
          toDateTimeLocalValue(voucher?.activationPeriod.startDate) ||
          createDefaultDateTime(60),
        endDate:
          toDateTimeLocalValue(voucher?.activationPeriod.endDate) ||
          createDefaultDateTime(120),
      },
      expiryMode: voucher?.expiryMode ?? "days",
      expiryDays: voucher?.expiryDays,
      expiryDate: toDateTimeLocalValue(voucher?.expiryDate) || "",
      branchScope: voucher?.branchScope || "all",
      branchIds: voucher?.branchIds || [],
    },
  })

  const {
    fields: serviceLineFields,
    append: appendLine,
    remove: removeLine,
  } = useFieldArray({ control, name: "serviceLines" })
  const branchScope = watch("branchScope")
  const bookingRequired = watch("bookingRequired")
  const selectedBranchIds = useWatch({ control, name: "branchIds" })
  const displayCurrency = getCurrencyLabel(watch("currency"))
  const applicableBranches = useMemo(
    () =>
      branchScope === "all"
        ? spBranches
        : spBranches.filter((branch) =>
            (selectedBranchIds ?? []).includes(branch.id)
          ),
    [branchScope, selectedBranchIds, spBranches]
  )
  // Subtotal = sum of each service's price. One overall discount (amount or %)
  // is applied to the subtotal to give the Final Price, rounded to a whole number.
  const serviceLinesWatch = useWatch({ control, name: "serviceLines" })
  const discountType = useWatch({ control, name: "discount.type" })
  const discountValue =
    Number(useWatch({ control, name: "discount.value" })) || 0
  const subtotal = useMemo(
    () =>
      (serviceLinesWatch || []).reduce(
        (sum, l) => sum + (Number(l?.price) || 0),
        0
      ),
    [serviceLinesWatch]
  )
  const finalPrice = useMemo(() => {
    const raw =
      discountType === "percent"
        ? subtotal * (1 - discountValue / 100)
        : subtotal - discountValue
    return Math.max(0, Math.round(raw))
  }, [subtotal, discountType, discountValue])

  useEffect(() => {
    setValue("initialPrice", subtotal)
    setValue("finalPrice", finalPrice)
  }, [subtotal, finalPrice, setValue])

  const STEP_FIELDS: Record<1 | 2 | 3, string[]> = {
    1: ["name", "branchScope", "branchIds"],
    2: [
      "activationPeriod.startDate",
      "activationPeriod.endDate",
      "expiryMode",
      "expiryDays",
      "expiryDate",
    ],
    3: ["serviceLines"],
  }

  const goNext = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valid = await trigger(STEP_FIELDS[currentStep] as any)
    if (valid) setCurrentStep((s) => (s + 1) as 1 | 2 | 3)
  }

  const goPrev = () => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)

  const onSave = async (data: z.input<typeof createVoucherSchema>) => {
    setIsSubmitting(true)
    try {
      const payload = createVoucherSchema.parse(data)
      const res = isEditing
        ? await updateVoucher(spId, voucher!.id, payload)
        : await createVoucher(spId, payload)
      if (res.success) {
        setSuccessMessage(
          isEditing
            ? "Voucher updated successfully."
            : "A new voucher has been added to your draft."
        )
        setIsSuccess(true)
        setTimeout(onSuccess, 2000)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the voucher right now."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPublish = async () => {
    if (!isEditing) return
    setIsPublishing(true)
    const res = await publishVoucher(spId, voucher!.id)
    if (res.success) {
      setSuccessMessage("Voucher published successfully and is now active.")
      setIsSuccess(true)
      setTimeout(onSuccess, 2000)
    }
    setIsPublishing(false)
  }

  if (isSuccess) {
    return (
      <div className="animate-in rounded-lg border border-border bg-card py-20 duration-300 zoom-in-95">
        <SuccessCelebration
          title={isEditing ? "Changes Saved!" : "Voucher Added!"}
          message={successMessage}
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4"
    >
      <VoucherFormHeader isEditing={isEditing} onCancel={onCancel} />

      <VoucherStepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

      <div className="min-w-0">
        {/* Step 1 — Details */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm duration-300">
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Ticket size={16} weight="fill" />
                </div>
                <h3 className="text-lead font-semibold text-foreground">
                  Details
                </h3>
              </div>

              <div className="space-y-5">
                {/* Branch — chosen first; its account wallet sets the currency that scopes line-item pricing. */}
                <div className="space-y-3">
                  <label className="text-body font-medium text-foreground">
                    Branch Assignment
                  </label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ChoiceCard
                      title="All Branches"
                      description=""
                      icon={Buildings}
                      selected={branchScope === "all"}
                      onSelect={() => {
                        setValue("branchScope", "all")
                        setValue("branchIds", [])
                      }}
                      className="p-3"
                    />
                    <ChoiceCard
                      title="Specific Branches"
                      description=""
                      icon={MapPin}
                      selected={branchScope === "specific"}
                      onSelect={() => setValue("branchScope", "specific")}
                      className="p-3"
                    />
                  </div>
                  {branchScope === "specific" && (
                    <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-top-2">
                      <label className="text-label font-medium text-subtle">
                        Select Branches
                      </label>
                      <CustomMultiSelect
                        options={spBranches.map((branch) => ({
                          value: branch.id,
                          label: `${branch.name} · ${getCurrencyLabel(branch.currency)}`,
                          description: "Voucher pricing follows this branch currency",
                        }))}
                        selected={watch("branchIds") ?? []}
                        onChange={(branchIds) => setValue("branchIds", branchIds)}
                        placeholder="Search branches..."
                        allowCustom={false}
                      />
                      {errors.branchIds && (
                        <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                          <WarningCircle size={12} /> {errors.branchIds.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">
                      Package ID
                    </label>
                    <div className="w-full cursor-not-allowed rounded-md border border-border bg-muted/10 px-3 py-2 font-mono text-body text-faint">
                      {voucher?.code}
                    </div>
                    <p className="text-label text-faint italic">
                      Auto-generated format. Cannot be changed.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-body font-medium text-foreground">
                    Voucher Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register("name")}
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-2 text-body transition-colors outline-none",
                      errors.name
                        ? "border-destructive ring-1 ring-destructive/20"
                        : "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="e.g. Monthly Yoga Pass"
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                      <WarningCircle size={12} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-body font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className={cn(
                      "w-full resize-none rounded-md border bg-background px-3 py-2 text-body transition-colors outline-none",
                      "border-border focus:border-foreground/30 focus:bg-muted/30"
                    )}
                    placeholder="Detailed breakdown of what's included..."
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <p className="text-body font-semibold text-foreground">
                    Booking Required
                  </p>
                  <div className="flex items-center gap-3">
                    {bookingRequired && applicableBranches.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-label font-medium text-primary underline-offset-2 hover:underline"
                          >
                            View Booking Info
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Branch Booking Info</DialogTitle>
                          </DialogHeader>
                          <div className="divide-y divide-border pt-1">
                            {applicableBranches.map((branch) => (
                              <div
                                key={branch.id}
                                className="space-y-3 py-4 first:pt-0 last:pb-0"
                              >
                                <p className="text-body font-semibold text-foreground">
                                  {branch.name}
                                </p>
                                {(branch.booking.channels?.length ?? 0) === 0 ? (
                                  <p className="text-label text-destructive">
                                    No booking channels configured.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {branch.booking.channels.map((channel) => {
                                      const value =
                                        channel === "whatsapp"
                                          ? branch.booking.whatsapp?.phoneNumber
                                          : channel === "email"
                                            ? branch.booking.email?.email
                                            : channel === "phone"
                                              ? branch.booking.phone?.phoneNumber
                                              : branch.booking.link?.url
                                      return (
                                        <div
                                          key={channel}
                                          className="flex items-center justify-between gap-4"
                                        >
                                          <span className="text-label text-muted-foreground">
                                            {BOOKING_CHANNEL_LABELS[channel]}
                                          </span>
                                          <span className="font-mono text-label font-medium text-foreground">
                                            {value || "—"}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Switch
                      checked={watch("bookingRequired")}
                      onCheckedChange={(v: boolean) =>
                        setValue("bookingRequired", v)
                      }
                    />
                  </div>
                </div>

                <p className="text-label text-muted-foreground">
                  Branch currency is shown inline and applied automatically to
                  voucher pricing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Voucher Configuration */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <VoucherConfigurationSection
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </div>
        )}

        {/* Step 3 — Manage Services */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <VoucherManageServicesSection
              appendLine={appendLine}
              currency={displayCurrency}
              discountType={discountType ?? "amount"}
              errors={errors}
              finalPrice={finalPrice}
              register={register}
              removeLine={removeLine}
              serviceLineFields={serviceLineFields}
              setValue={setValue}
              spServiceCategories={spServiceCategories}
              subtotal={subtotal}
              watch={watch}
            />
          </div>
        )}
      </div>

      <VoucherWizardActionBar
        currentStep={currentStep}
        formIsSubmitting={formIsSubmitting}
        isEditing={isEditing}
        isPublishing={isPublishing}
        isSubmitting={isSubmitting}
        onBack={goPrev}
        onCancel={onCancel}
        onNext={goNext}
        onPublish={onPublish}
        voucher={voucher}
      />
    </form>
  )
}
