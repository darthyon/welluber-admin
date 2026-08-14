"use client"

import { useState } from "react"
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form"
import {
  Bank,
  Buildings,
  CalendarBlank,
  CaretDown,
  IdentificationCard,
  MapPin,
  WarningCircle,
} from "@phosphor-icons/react"
import { format, parse, isValid } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CreateOrganizationData } from "@/features/organizations/schemas"
import { LocationPicker } from "@/components/shared/location-picker"
import { DocumentUploadSection } from "@/components/shared/document-upload-section"
import { FormSelect } from "@/components/shared/form-select"
import { MALAYSIAN_BANKS } from "@/lib/constants/banks"

interface NewOrganizationStepOneProps {
  control: Control<CreateOrganizationData>
  errors: FieldErrors<CreateOrganizationData>
  inputCls: (hasError?: boolean) => string
  labelCls: string
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  register: UseFormRegister<CreateOrganizationData>
  setValue: UseFormSetValue<CreateOrganizationData>
  values: {
    bankNameValue?: string
    industryValue?: string
    orgType?: string
  }
}

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

export function NewOrganizationStepOne({
  control,
  errors,
  inputCls,
  labelCls,
  onSubmit,
  register,
  setValue,
  values,
}: NewOrganizationStepOneProps) {
  const [fyOpen, setFyOpen] = useState(false)

  const getDocRequirements = (type?: string) => {
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
    <form
      id="newOrgForm"
      onSubmit={onSubmit}
      className="space-y-6 animate-in duration-400 fade-in slide-in-from-bottom-4"
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
                value={values.industryValue || ""}
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
                value={values.orgType || ""}
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
                    description={getDocRequirements(values.orgType)}
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
                value={values.bankNameValue || ""}
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
    </form>
  )
}
