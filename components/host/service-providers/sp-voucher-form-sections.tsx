"use client"

import * as React from "react"
import {
  type FieldArrayWithId,
  type FieldErrors,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form"
import { z } from "zod"
import {
  CalendarBlank,
  Clock,
  ListBullets,
  Plus,
  Stack,
  WarningCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ChoiceCard } from "@/components/shared/choice-card"
import { DateTimePickerField } from "@/components/shared/date-time-picker-field"
import { FormSelect } from "@/components/shared/form-select"
import { ServiceLineRow } from "@/components/host/service-providers/sp-voucher-service-line-row"
import { createVoucherSchema } from "@/features/providers/schemas"
import { cn } from "@/lib/utils"

type VoucherFormValues = z.input<typeof createVoucherSchema>

interface VoucherConfigurationSectionProps {
  errors: FieldErrors<VoucherFormValues>
  register: UseFormRegister<VoucherFormValues>
  setValue: UseFormSetValue<VoucherFormValues>
  watch: UseFormWatch<VoucherFormValues>
}

export function VoucherConfigurationSection({
  errors,
  register,
  setValue,
  watch,
}: VoucherConfigurationSectionProps) {
  const usageStartDate = watch("activationPeriod.startDate")
  const expiryMode = watch("expiryMode")

  return (
    <div
      id="voucher-configuration"
      className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stack size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">
            Voucher Configuration
          </h3>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-body font-medium text-foreground">
                No. of Vouchers
              </label>
              <input
                type="number"
                min={0}
                {...register("voucherCount", { valueAsNumber: true })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-body transition-colors outline-none focus:border-foreground/30 focus:bg-muted/30"
                placeholder="e.g. 500"
              />
              <p className="text-label text-faint">
                How many vouchers to generate for this package.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-body font-medium text-foreground">
                Max Distribution Per User
              </label>
              <input
                type="number"
                min={1}
                {...register("maxUsagePerUser", { valueAsNumber: true })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-body transition-colors outline-none focus:border-foreground/30 focus:bg-muted/30"
                placeholder="e.g. 5"
              />
              <p className="text-label text-faint">
                How many times each member can redeem this voucher.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-0.5">
              <h4 className="text-body font-semibold text-foreground">
                Listing Period
              </h4>
              <p className="text-label text-muted-foreground">
                Set the window when this voucher is visible and buyable in the
                marketplace.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <label className="text-label font-medium text-subtle">
                  Start Date & Time
                </label>
                <div className="hidden md:block" />
                <label className="text-label font-medium text-subtle">
                  End Date & Time
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
                <DateTimePickerField
                  value={watch("activationPeriod.startDate") ?? ""}
                  onChange={(value) =>
                    setValue("activationPeriod.startDate", value)
                  }
                  placeholder="Select start date & time"
                  clearable={false}
                />

                <div className="hidden items-center justify-center md:flex">
                  <span className="text-body text-faint">—</span>
                </div>

                <DateTimePickerField
                  value={watch("activationPeriod.endDate") ?? ""}
                  min={usageStartDate || undefined}
                  onChange={(value) => setValue("activationPeriod.endDate", value)}
                  placeholder="Select end date & time"
                  clearable={false}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div>
                  {errors.activationPeriod?.startDate ? (
                    <p className="flex items-center gap-1 text-label text-destructive">
                      <WarningCircle size={12} />
                      {errors.activationPeriod.startDate.message}
                    </p>
                  ) : null}
                </div>
                <div className="hidden md:block" />
                <div>
                  {errors.activationPeriod?.endDate ? (
                    <p className="flex items-center gap-1 text-label text-destructive">
                      <WarningCircle size={12} />
                      {errors.activationPeriod.endDate.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-4">
            <div className="space-y-0.5">
              <h4 className="text-body font-semibold text-foreground">
                Voucher Expiry
              </h4>
              <p className="text-label text-muted-foreground">
                When a purchased voucher expires and can no longer be redeemed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ChoiceCard
                title="Days After Purchase"
                description="Expires a set number of days after each member buys it."
                icon={Clock}
                selected={expiryMode === "days"}
                onSelect={() => setValue("expiryMode", "days")}
                className="p-3"
              />
              <ChoiceCard
                title="Fixed Date"
                description="Expires on one calendar date for all buyers."
                icon={CalendarBlank}
                selected={expiryMode === "date"}
                onSelect={() => setValue("expiryMode", "date")}
                className="p-3"
              />
            </div>

            {expiryMode === "date" ? (
              <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-top-2">
                <label className="text-label font-medium text-subtle">
                  Expiry Date & Time
                </label>
                <DateTimePickerField
                  value={watch("expiryDate") ?? ""}
                  min={watch("activationPeriod.endDate") || undefined}
                  onChange={(value) => setValue("expiryDate", value)}
                  placeholder="Select expiry date & time"
                />
                {errors.expiryDate ? (
                  <p className="flex items-center gap-1 text-label text-destructive">
                    <WarningCircle size={12} />
                    {errors.expiryDate.message}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-2">
                <label className="text-label font-medium text-subtle">
                  Days After Purchase
                </label>
                <div className="relative max-w-[220px]">
                  <input
                    type="number"
                    min={1}
                    {...register("expiryDays", { valueAsNumber: true })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pr-14 font-mono text-body transition-colors outline-none focus:border-foreground/30 focus:bg-muted/30"
                    placeholder="e.g. 30"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-label text-faint">
                    days
                  </span>
                </div>
                {errors.expiryDays ? (
                  <p className="flex items-center gap-1 text-label text-destructive">
                    <WarningCircle size={12} />
                    {errors.expiryDays.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface VoucherManageServicesSectionProps {
  appendLine: UseFieldArrayAppend<VoucherFormValues, "serviceLines">
  currency: string
  discountType: "amount" | "percent"
  errors: FieldErrors<VoucherFormValues>
  finalPrice: number
  register: UseFormRegister<VoucherFormValues>
  removeLine: UseFieldArrayRemove
  serviceLineFields: FieldArrayWithId<VoucherFormValues, "serviceLines", "id">[]
  setValue: UseFormSetValue<VoucherFormValues>
  spServiceCategories: string[]
  subtotal: number
  watch: UseFormWatch<VoucherFormValues>
}

export function VoucherManageServicesSection({
  appendLine,
  currency,
  discountType,
  errors,
  finalPrice,
  register,
  removeLine,
  serviceLineFields,
  setValue,
  spServiceCategories,
  subtotal,
  watch,
}: VoucherManageServicesSectionProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    const ids = new Set<string>()
    serviceLineFields.forEach((field, i) => {
      if (!watch(`serviceLines.${i}.service`)) ids.add(field.id)
    })
    return ids
  })
  const [autoFocusId, setAutoFocusId] = React.useState<string | null>(null)
  const prevCount = React.useRef(serviceLineFields.length)

  // A newly appended row opens expanded and grabs focus.
  React.useEffect(() => {
    if (serviceLineFields.length > prevCount.current) {
      const newField = serviceLineFields[serviceLineFields.length - 1]
      if (newField) {
        setExpandedIds((prev) => new Set(prev).add(newField.id))
        setAutoFocusId(newField.id)
      }
    }
    prevCount.current = serviceLineFields.length
  }, [serviceLineFields.length, serviceLineFields])

  // Surface hidden problems: expand any line that fails validation on submit.
  React.useEffect(() => {
    const lineErrors = errors.serviceLines as unknown as
      | Array<unknown>
      | undefined
    if (!Array.isArray(lineErrors)) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      serviceLineFields.forEach((field, i) => {
        if (lineErrors[i]) next.add(field.id)
      })
      return next
    })
  }, [errors.serviceLines, serviceLineFields])

  const toggleRow = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleAddService = () => {
    // Collapse completed rows so the list stays short by default.
    setExpandedIds((prev) => {
      const next = new Set(prev)
      serviceLineFields.forEach((field, i) => {
        const svc = watch(`serviceLines.${i}.service`)
        const linePrice = Number(watch(`serviceLines.${i}.price`))
        if (svc && linePrice > 0) next.delete(field.id)
      })
      return next
    })
    appendLine({
      service: "",
      subServices: [],
      description: "",
      descriptionList: "",
      price: 0,
    })
  }

  const lineHasError = (i: number) => {
    const lineErrors = errors.serviceLines as unknown as
      | Array<unknown>
      | undefined
    return Array.isArray(lineErrors) ? Boolean(lineErrors[i]) : false
  }

  return (
    <div
      id="manage-services"
      className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <ListBullets size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">
              Manage Services
            </h3>
            <p className="text-label text-muted-foreground">
              Add the services included in this voucher and set a price for
              each.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {errors.serviceLines && "message" in errors.serviceLines && (
            <p className="flex items-center gap-1 text-label text-destructive">
              <WarningCircle size={12} />
              {String(errors.serviceLines.message)}
            </p>
          )}

          <div className="space-y-3">
            {serviceLineFields.map((field, index) => (
              <ServiceLineRow
                key={field.id}
                index={index}
                currency={currency}
                spServiceCategories={spServiceCategories}
                expanded={expandedIds.has(field.id)}
                hasError={lineHasError(index)}
                autoFocus={autoFocusId === field.id}
                onToggle={() => toggleRow(field.id)}
                onRemove={
                  serviceLineFields.length > 1
                    ? () => removeLine(index)
                    : undefined
                }
                register={register}
                setValue={setValue}
                watch={watch}
              />
            ))}

            <Button
              type="button"
              variant="ghost"
              onClick={handleAddService}
              className="h-9 w-auto gap-2 px-2 font-semibold text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Plus size={16} weight="bold" />
              <span>Add service</span>
            </Button>
          </div>

          <div className="divide-y divide-border/60 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-body text-subtle">Subtotal</p>
              <p className="font-mono text-body font-medium text-foreground tabular-nums">
                {currency || "RM"} {subtotal.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="shrink-0 text-body text-subtle">Overall Discount</p>
              <div className="flex w-full max-w-[260px] items-stretch gap-2">
                <FormSelect
                  value={discountType}
                  onChange={(value) =>
                    setValue("discount.type", value as "amount" | "percent")
                  }
                  options={[
                    { label: "Amount", value: "amount" },
                    { label: "%", value: "percent" },
                  ]}
                  triggerClassName="w-28 shrink-0"
                />
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("discount.value", { valueAsNumber: true })}
                  className={cn(
                    "min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-right font-mono text-body transition-colors outline-none",
                    "focus:border-foreground/30 focus:bg-muted/30"
                  )}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between bg-primary/5 px-4 py-4">
              <p className="text-body font-semibold text-foreground">
                Final Price
              </p>
              <p className="font-mono text-heading font-semibold text-primary tabular-nums">
                {currency || "RM"} {finalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
