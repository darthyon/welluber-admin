"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building, MapPin, Tag, WarningCircle, Info } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createBranchSchema } from "@/features/providers/schemas"
import { createBranch, updateBranch } from "@/features/providers/actions"
import { Switch } from "@/components/shared/switch"
import { DEFAULT_OPERATING_HOURS } from "@/features/providers/constants"
import { buildBranchServiceCatalog } from "@/features/providers/service-taxonomy"
import { SuccessModal } from "@/components/shared/success-modal"
import { LocationPicker } from "@/components/shared/location-picker"
import { ServiceToggleCard } from "@/components/shared/service-toggle-card"
import type { SpBranch, CommissionSchemaRow } from "@/types/provider"
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav"
import { toast } from "sonner"
import {
  BranchFormActionBar,
  BranchFormHeader,
} from "@/components/host/service-providers/sp-branch-form-frame"
import {
  BranchBookingSection,
  BranchBenefitsSection,
  BranchGovernanceSection,
  BranchOperatingHoursSection,
} from "@/components/host/service-providers/sp-branch-form-sections"

const ANCHOR_ITEMS = [
  { id: "branch-identity", label: "Branch Identity" },
  { id: "location-mapping", label: "Location Mapping" },
  { id: "service-catalog", label: "Service Catalogue" },
  { id: "governance", label: "Governance" },
  { id: "booking-settings", label: "Booking Settings" },
  { id: "operating-hours", label: "Operating Hours" },
  { id: "benefits", label: "Benefits" },
]

interface SpBranchFormProps {
  spId: string
  serviceCategories: string[] // SP-level categories for grouping
  portfolio: CommissionSchemaRow[] // The defined service portfolio
  branch?: SpBranch // if editing
  onSuccess: () => void
  onCancel: () => void
}

export function SpBranchForm({
  spId,
  serviceCategories,
  portfolio,
  branch,
  onSuccess,
  onCancel,
}: SpBranchFormProps) {
  const isEditing = !!branch
  const [isSuccess, setIsSuccess] = useState(false)
  const [benefits, setBenefits] = useState<string[]>(branch?.benefits ?? [])
  const [benefitInput, setBenefitInput] = useState("")
  const [, setHasAdminChanges] = useState(false)
  const [, setCustomServiceInputs] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<z.input<typeof createBranchSchema>>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: branch?.name ?? "",
      services: branch?.services ?? [],
      address: branch?.address ?? {
        line: "",
        city: "",
        state: "",
        country: "Malaysia",
        postalCode: "",
      },
      contacts: branch?.contacts ?? [],
      administrators: branch?.administrators ?? [],
      booking: branch?.booking ?? {
        channels: [],
        whatsapp: { phoneNumber: "" },
        email: { email: "" },
        phone: { phoneNumber: "" },
        link: { url: "" },
      },
      isActive: branch?.isActive ?? true,
      operatingHours: branch?.operatingHours ?? DEFAULT_OPERATING_HOURS,
      benefits: branch?.benefits ?? [],
    },
  })

  const selectedServices = useWatch({ control, name: "services" }) || []
  const operatingHours = useWatch({ control, name: "operatingHours" })
  const isActiveValue = useWatch({ control, name: "isActive" })
  const addressValue = useWatch({ control, name: "address" })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "contacts",
  })

  const {
    fields: adminFields,
    append: appendAdmin,
    remove: removeAdmin,
  } = useFieldArray({
    control,
    name: "administrators",
  })

  const addBenefit = () => {
    const val = benefitInput.trim()
    if (val && !benefits.includes(val)) {
      const updated = [...benefits, val]
      setBenefits(updated)
      setValue("benefits", updated)
    }
    setBenefitInput("")
  }

  const removeBenefit = (i: number) => {
    const updated = benefits.filter((_, idx) => idx !== i)
    setBenefits(updated)
    setValue("benefits", updated)
  }

  // Sync logic: When an administrator is designated as PIC, ensure they exist in the contacts list
  const watchedAdmins = useWatch({ control, name: "administrators" }) || []
  const watchedContacts = useWatch({ control, name: "contacts" }) || []

  const handleAdminPicSync = (index: number, isPic: boolean) => {
    const admin = watchedAdmins[index]
    if (isPic) {
      const alreadyExists = watchedContacts.some((c) => c.email === admin.email)
      if (!alreadyExists && admin.email && admin.name) {
        appendContact({
          name: admin.name,
          email: admin.email,
          type: "branch_manager",
          phone: "",
          isPublic: true,
        })
      }
    }
  }

  const serviceCatalog = useMemo(() => {
    const fullCatalog = buildBranchServiceCatalog(serviceCategories)
    const portfolioServiceNames = portfolio.map((r) => r.mainService)

    // Filter the catalog to only include Main Services in the portfolio
    return fullCatalog
      .map((category) => ({
        ...category,
        services: category.services.filter((s) =>
          portfolioServiceNames.includes(s.name)
        ),
      }))
      .filter((category) => category.services.length > 0)
  }, [serviceCategories, portfolio])

  const onSubmit = async (data: z.input<typeof createBranchSchema>) => {
    // Determine if admins changed or were added
    const adminsChanged = !!dirtyFields.administrators
    setHasAdminChanges(adminsChanged)

    try {
      const payload = createBranchSchema.parse({ ...data, benefits })
      const res = isEditing
        ? await updateBranch(spId, branch.id, payload)
        : await createBranch(spId, payload)

      if (res.success) {
        if (isEditing) {
          const msg = adminsChanged
            ? "Branch updated. New invitations sent to administrators."
            : "Branch details updated successfully"
          toast.success(msg)
          onSuccess()
        } else {
          setIsSuccess(true)
        }
      } else {
        toast.error("Failed to save branch. Please try again.")
      }
    } catch (error) {
      console.error("Submission Error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full rounded-md border bg-background px-3 py-2 text-body transition-colors outline-none",
      hasError
        ? "border-destructive ring-1 ring-destructive/20"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    )

  const normalizedAddress = {
    line: addressValue?.line ?? "",
    city: addressValue?.city ?? "",
    state: addressValue?.state ?? "",
    country: addressValue?.country ?? "Malaysia",
    postalCode: addressValue?.postalCode ?? "",
    lat:
      typeof addressValue?.lat === "string" ||
      typeof addressValue?.lat === "number"
        ? addressValue.lat
        : undefined,
    lon:
      typeof addressValue?.lon === "string" ||
      typeof addressValue?.lon === "number"
        ? addressValue.lon
        : undefined,
  }

  if (isSuccess && !isEditing) {
    const adminMsg =
      "Invitation emails have been dispatched to the local administrators."
    return (
      <SuccessModal
        isOpen={isSuccess}
        onClose={onCancel}
        title="Branch Registered"
        message={`New location is now operational. ${adminMsg}`}
        primaryAction={{
          label: "Add Another Branch",
          onClick: () => {
            setIsSuccess(false)
            reset()
            setBenefits([])
            setBenefitInput("")
            window.scrollTo({ top: 0, behavior: "smooth" })
          },
        }}
        secondaryAction={{
          label: "View Branch List",
          onClick: onSuccess,
        }}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error("Validation Errors:", errors)
        const errorFields = Object.keys(errors)
        toast.error(
          `Form incomplete: Missing or invalid data in ${errorFields.join(", ")}.`
        )
      })}
      className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4"
    >
      <BranchFormHeader isEditing={isEditing} onCancel={onCancel} />

      <div className="relative flex flex-col items-start gap-8 xl:flex-row">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="sticky top-20 hidden w-52 shrink-0 self-start xl:block">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Branch Identity */}
            <div
              id="branch-identity"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building size={16} weight="fill" />
                    </div>
                    <h3 className="text-lead font-semibold text-foreground">
                      Branch Identity
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-medium text-foreground">
                      Active
                    </span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-faint transition-colors hover:text-foreground"
                            aria-label="About active status"
                          >
                            <Info size={12} weight="regular" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-56">
                          <p className="text-label text-muted-foreground">
                            Inactive branches are hidden from the marketplace.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Switch
                      checked={Boolean(isActiveValue)}
                      onCheckedChange={(v: boolean) => setValue("isActive", v)}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">
                      Branch Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className={inputCls(!!errors.name)}
                      placeholder="e.g. Zenith KLCC"
                    />
                    {errors.name && (
                      <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                        <WarningCircle size={12} /> {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Mapping */}
            <div
              id="location-mapping"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <MapPin size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Location Mapping
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Address and map coordinates for this branch.
                    </p>
                  </div>
                </div>
                <div className="p-1">
                  <LocationPicker
                    value={normalizedAddress}
                    onChange={(val) =>
                      setValue("address", val, { shouldValidate: true })
                    }
                    errors={errors.address}
                  />
                </div>
              </div>
            </div>

            {/* Service Catalog */}
            <div
              id="service-catalog"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Tag size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Service Catalog
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Select services and manage specific sub-types.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-8">
                    {serviceCatalog.map((group) => (
                      <div key={group.category} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-label font-semibold tracking-wider text-muted-foreground uppercase">
                            {group.category}
                          </h4>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-micro font-medium text-muted-foreground">
                            {
                              group.services.filter((s) =>
                                selectedServices.some(
                                  (ls) => ls.service === s.name
                                )
                              ).length
                            }{" "}
                            Main Services
                          </span>
                        </div>

                        <div className="space-y-2 pt-1">
                          {group.services.map((service) => {
                            const line = selectedServices.find(
                              (ls) => ls.service === service.name
                            )
                            const isSelected = !!line

                            return (
                              <ServiceToggleCard
                                key={service.name}
                                name={service.name}
                                isSelected={isSelected}
                                onToggle={(checked) => {
                                  if (!checked) {
                                    setValue(
                                      "services",
                                      selectedServices.filter(
                                        (ls) => ls.service !== service.name
                                      )
                                    )
                                  } else {
                                    setValue("services", [
                                      ...selectedServices,
                                      {
                                        service: service.name,
                                        subServices: service.subServices,
                                      },
                                    ])
                                  }
                                }}
                                selectedSubServices={line?.subServices || []}
                                masterlistSubServices={service.subServices}
                                onAddSubService={(val) => {
                                  if (line && !line.subServices.includes(val)) {
                                    setValue(
                                      "services",
                                      selectedServices.map((ls) =>
                                        ls.service === service.name
                                          ? {
                                              ...ls,
                                              subServices: [
                                                ...ls.subServices,
                                                val,
                                              ],
                                            }
                                          : ls
                                      )
                                    )
                                    setCustomServiceInputs((prev) => ({
                                      ...prev,
                                      [service.name]: "",
                                    }))
                                  }
                                }}
                                onRemoveSubService={(val) => {
                                  if (line) {
                                    setValue(
                                      "services",
                                      selectedServices.map((ls) =>
                                        ls.service === service.name
                                          ? {
                                              ...ls,
                                              subServices:
                                                ls.subServices.filter(
                                                  (s) => s !== val
                                                ),
                                            }
                                          : ls
                                      )
                                    )
                                  }
                                }}
                                placeholder={`Add custom ${service.name} sub-service...`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.services && (
                    <p className="flex items-center gap-1 text-label text-destructive">
                      <WarningCircle size={12} /> {errors.services.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <BranchGovernanceSection
              adminFields={adminFields}
              appendAdmin={() =>
                appendAdmin({
                  name: "",
                  email: "",
                  role: "Administrator",
                  designateAsPic: false,
                })
              }
              appendContact={() =>
                appendContact({
                  name: "",
                  email: "",
                  type: "staff",
                  phone: "",
                  isPublic: true,
                })
              }
              contactFields={contactFields}
              control={control}
              errors={errors}
              inputCls={inputCls}
              onAdminPicSync={handleAdminPicSync}
              register={register}
              removeAdmin={removeAdmin}
              removeContact={removeContact}
            />

            <BranchBookingSection
              control={control}
              errors={errors}
              inputCls={inputCls}
              register={register}
              setValue={setValue}
              watch={watch}
            />

            <BranchOperatingHoursSection
              errors={errors}
              inputCls={inputCls}
              operatingHours={operatingHours}
              register={register}
              setValue={setValue}
            />

            <BranchBenefitsSection
              addBenefit={addBenefit}
              benefitInput={benefitInput}
              benefits={benefits}
              inputCls={inputCls}
              onBenefitInputChange={setBenefitInput}
              removeBenefit={removeBenefit}
            />
          </div>
        </div>
      </div>

      <BranchFormActionBar
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  )
}
