"use client"

import {
  Article,
  Bank,
  CaretLeft,
  Globe,
  IdentificationCard,
  MapPin,
  ShieldCheck,
  Storefront,
} from "@phosphor-icons/react"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form"
import { z } from "zod"
import { DocumentUploadSection } from "@/components/shared/document-upload-section"
import { FormSelect } from "@/components/shared/form-select"
import { LocationPicker } from "@/components/shared/location-picker"
import { Switch } from "@/components/shared/switch"
import {
  BUSINESS_TYPES,
  CREDIT_TERMS,
  PAYMENT_CYCLES,
} from "@/features/providers/constants"
import type { createSpSchema } from "@/features/providers/schemas"
import { cn } from "@/lib/utils"

type SpFormValues = z.input<typeof createSpSchema>

interface EditServiceProviderSectionsProps {
  businessType: string
  control: Control<SpFormValues>
  currentStep: 1 | 2
  creditTermsValue?: string
  errors: FieldErrors<SpFormValues>
  inputCls: (hasError?: boolean) => string
  labelCls: string
  onBusinessTypeChange: (value: string) => void
  paymentCycleValue?: string
  register: UseFormRegister<SpFormValues>
  setValue: UseFormSetValue<SpFormValues>
}

export function EditServiceProviderHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
      >
        <CaretLeft size={16} />
        Back
      </button>
      <div>
        <h1 className="text-heading font-semibold text-balance text-foreground">
          Edit Service Provider
        </h1>
        <p className="mt-1 text-body text-subtle">
          Update profile, compliance details, and backend settings.
        </p>
      </div>
    </div>
  )
}

export function EditServiceProviderCoreSections({
  businessType,
  control,
  currentStep,
  creditTermsValue,
  errors,
  inputCls,
  labelCls,
  onBusinessTypeChange,
  paymentCycleValue,
  register,
  setValue,
}: EditServiceProviderSectionsProps) {
  return (
    <>
      {currentStep === 1 && (
        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6">
              <SectionTitle
                icon={<Storefront size={16} weight="fill" />}
                title="Provider Profile"
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-faint">
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

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
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
                      onChange={(value) => field.onChange(value)}
                      errors={errors.address}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6">
              <SectionTitle
                icon={<IdentificationCard size={16} weight="fill" />}
                title="Registration & Compliance"
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelCls}>Registration Number (BRN)</label>
                  <input
                    {...register("registrationNo")}
                    className={inputCls(!!errors.registrationNo)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>TIN Number</label>
                  <input {...register("tinNumber")} className={inputCls()} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelCls}>
                    SST Registration No.{" "}
                    <span className="font-normal text-muted-foreground">
                      (if applicable)
                    </span>
                  </label>
                  <input {...register("tinNumber")} className={inputCls()} />
                </div>
                <div className="space-y-6 border-t border-border/40 pt-4 sm:col-span-2">
                  <div className="space-y-3">
                    <label className={labelCls}>Business Type</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {BUSINESS_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => onBusinessTypeChange(type.id)}
                          className={cn(
                            "flex flex-col rounded-lg border bg-muted/5 p-3 text-left transition-all duration-200",
                            businessType === type.id
                              ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20"
                              : "hover:border-border-hover border-border"
                          )}
                        >
                          <span
                            className={cn(
                              "text-body font-semibold",
                              businessType === type.id
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {type.label}
                          </span>
                          <span className="mt-0.5 text-label leading-tight text-subtle">
                            {type.docs}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Controller
                      control={control}
                      name="documents"
                      render={({ field }) => {
                        const typeLabel =
                          BUSINESS_TYPES.find(
                            (type) => type.id === businessType
                          )?.label || "Provider"
                        return (
                          <DocumentUploadSection
                            documents={field.value || []}
                            onChange={field.onChange}
                            error={errors.documents?.message as string}
                            label={`${typeLabel} Documents`}
                          />
                        )
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6">
              <SectionTitle
                icon={<Bank size={16} weight="fill" />}
                title="Settlement & Tax"
              />
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      className={cn(
                        inputCls(!!errors.bankInfo?.accountNumber),
                        "font-mono"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 border-t border-border/40 pt-6 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Payment Cycle</label>
                    <FormSelect
                      value={paymentCycleValue}
                      onChange={(value) => setValue("paymentCycle", value)}
                      options={[
                        { label: "Select Cycle", value: "" },
                        ...PAYMENT_CYCLES.map((cycle) => ({
                          label: cycle,
                          value: cycle,
                        })),
                      ]}
                      placeholder="Select Cycle"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Credit Terms</label>
                    <FormSelect
                      value={creditTermsValue}
                      onChange={(value) => setValue("creditTerms", value)}
                      options={[
                        { label: "Select Terms", value: "" },
                        ...CREDIT_TERMS.map((term) => ({
                          label: term,
                          value: term,
                        })),
                      ]}
                      placeholder="Select Terms"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Expired Commission Fee</label>
                    <div className="relative">
                      <div className="absolute top-1/2 left-3 -translate-y-1/2 text-body font-semibold text-faint">
                        %
                      </div>
                      <input
                        {...register("expiredCommissionFee", {
                          valueAsNumber: true,
                        })}
                        className={cn(inputCls(), "pl-9")}
                        type="number"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t border-border/40 pt-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ToggleCard
                      icon={<Article size={18} weight="duotone" />}
                      title="Needs e-Invoice?"
                      subtitle="Submission required"
                    >
                      <Controller
                        control={control}
                        name="needsEInvoiceSubmission"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </ToggleCard>
                    <ToggleCard
                      icon={<ShieldCheck size={18} weight="duotone" />}
                      title="Appointed Welluber?"
                      subtitle="For submission"
                    >
                      <Controller
                        control={control}
                        name="appointedForEInvoice"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </ToggleCard>
                  </div>
                  <div className="grid grid-cols-1 gap-4 rounded-lg border border-dashed border-border bg-muted/5 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Classification Code</label>
                      <input
                        {...register("classificationCode")}
                        className={inputCls()}
                        placeholder="e.g. 001"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Classification Descriptor
                      </label>
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
        </div>
      )}
    </>
  )
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 pb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lead font-semibold text-foreground">{title}</h3>
    </div>
  )
}

function ToggleCard({
  children,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4 transition-all duration-300 hover:border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-faint transition-colors group-hover:text-primary">
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-body font-medium text-foreground">{title}</p>
          <p className="text-label font-medium text-subtle">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
