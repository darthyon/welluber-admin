"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { WarningCircle, Ticket, Buildings, MapPin } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
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
import { LogoUpload } from "@/components/shared/logo-upload"
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav"
import type { SpVoucher } from "@/types/provider"
import {
  VoucherFormActionBar,
  VoucherFormHeader,
} from "@/components/host/service-providers/sp-voucher-form-frame"
import {
  VoucherConfigurationSection,
  VoucherManageServicesSection,
} from "@/components/host/service-providers/sp-voucher-form-sections"

const ANCHOR_ITEMS = [
  { id: "details", label: "Details" },
  { id: "voucher-configuration", label: "Voucher Configuration" },
  { id: "manage-services", label: "Manage Services" },
]

interface SpVoucherFormProps {
  spId: string
  spServiceCategories: string[]
  spBranches: { id: string; name: string }[]
  voucher?: SpVoucher
  onSuccess: () => void
  onCancel: () => void
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
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<z.input<typeof createVoucherSchema>>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      name: voucher?.name || "",
      description: voucher?.description || "",
      bookingRequired: voucher?.bookingRequired || false,
      displayLocation: voucher?.displayLocation || { line: "" },
      photo: voucher?.photo || "",
      serviceLines: voucher?.serviceLines || [
        {
          service: "",
          subServices: [],
          description: "",
          descriptionList: "",
          price: 0,
        },
      ],
      currency: voucher?.currency || "MYR",
      initialPrice: voucher?.initialPrice || 0,
      discount: voucher?.discount || { type: "amount", value: 0 },
      finalPrice: voucher?.finalPrice || 0,
      voucherCount: voucher?.voucherCount,
      maxUsagePerUser: voucher?.maxUsagePerUser ?? 1,
      activationPeriod: voucher?.activationPeriod || {
        startDate: new Date().toISOString().split("T")[0],
      },
      redemptionPeriod: voucher?.redemptionPeriod || {
        mode: "after_purchase",
        unit: "day",
        value: 30,
      },
      branchScope: voucher?.branchScope || "all",
      branchIds: voucher?.branchIds || [],
      membershipStartDay: voucher?.membershipStartDay || "none",
    },
  })

  const {
    fields: serviceLineFields,
    append: appendLine,
    remove: removeLine,
  } = useFieldArray({ control, name: "serviceLines" })
  const redemptionMode = watch("redemptionPeriod.mode")
  const branchScope = watch("branchScope")
  const currency = watch("currency")

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

      <div className="relative flex flex-col items-start gap-8 xl:flex-row">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="sticky top-20 hidden w-52 shrink-0 self-start xl:block">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Details */}
            <div
              id="details"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
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
                          options={spBranches.map((b) => b.name)}
                          selected={(watch("branchIds") ?? []).map(
                            (id) =>
                              spBranches.find((b) => b.id === id)?.name || id
                          )}
                          onChange={(names) => {
                            const ids = names.map(
                              (name) =>
                                spBranches.find((b) => b.name === name)?.id ||
                                name
                            )
                            setValue("branchIds", ids)
                          }}
                          placeholder="Search branches..."
                        />
                        {errors.branchIds && (
                          <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                            <WarningCircle size={12} />{" "}
                            {errors.branchIds.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Currency — locked to the branch account wallet (MYR for v1). */}
                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">
                      Currency
                    </label>
                    <div className="flex w-full items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-body">
                      <span className="flex h-5 w-8 items-center justify-center rounded-sm bg-muted text-label font-medium text-muted-foreground">
                        {currency || "MYR"}
                      </span>
                      <span className="font-medium whitespace-nowrap text-foreground">
                        Malaysian Ringgit (RM)
                      </span>
                      <span className="ml-auto text-label font-medium text-faint">
                        From branch account · Locked
                      </span>
                    </div>
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
                    <div className="space-y-0.5">
                      <p className="text-body font-semibold text-foreground">
                        Booking Required
                      </p>
                      <p className="text-label text-faint">
                        Enable this if members must book a slot before
                        redemption.
                      </p>
                    </div>
                    <Switch
                      checked={watch("bookingRequired")}
                      onCheckedChange={(v) => setValue("bookingRequired", v)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <p className="text-body font-semibold text-foreground">
                        Display Image
                      </p>
                      <p className="text-label text-muted-foreground">
                        The primary image seen by users on the marketplace.
                      </p>
                    </div>
                    <LogoUpload
                      label="Display Image"
                      value={watch("photo")}
                      onChange={(file) => setValue("photo", file)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <VoucherConfigurationSection
              register={register}
              redemptionMode={redemptionMode}
              setValue={setValue}
              watch={watch}
            />

            <VoucherManageServicesSection
              appendLine={appendLine}
              currency={currency ?? "MYR"}
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
        </div>
      </div>

      <VoucherFormActionBar
        formIsSubmitting={formIsSubmitting}
        isEditing={isEditing}
        isPublishing={isPublishing}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onPublish={onPublish}
        voucher={voucher}
      />
    </form>
  )
}
