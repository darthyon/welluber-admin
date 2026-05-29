"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Storefront, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Brand } from "@/types/brand"
import { LogoUpload } from "@/components/shared/logo-upload"
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy"
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select"

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  logo: z.any().optional(),
  status: z.enum(["active", "inactive"]),
  serviceCategories: z
    .array(z.string())
    .min(1, "Select at least one service category"),
})

export type BrandFormData = z.infer<typeof brandSchema>

interface BrandFormProps {
  initialData?: Brand
  onSubmit: (data: BrandFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  formId?: string
  showFooter?: boolean
}

export function BrandForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  showFooter = true,
}: BrandFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
      logo: initialData?.logo || "",
      status:
        initialData?.status === "removed"
          ? "inactive"
          : initialData?.status || "active",
      serviceCategories: initialData?.serviceCategories || [],
    },
  })

  const CATEGORY_TAXONOMY = [
    {
      category: "Service Categories",
      services: MASTER_SERVICE_TAXONOMY.map((group) => group.category),
    },
  ]

  const labelCls = "text-body font-semibold text-subtle mb-1.5 block"

  const inputCls = (hasError?: boolean) =>
    cn(
      "h-10 w-full rounded-lg border bg-background px-3 py-2 text-body transition-all outline-none",
      hasError
        ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/15"
        : "border-border hover:border-primary/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
    )

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Storefront size={16} weight="fill" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lead font-semibold text-foreground">
                  Brand Details
                </h3>
                <p className="text-label text-muted-foreground">
                  Configure the brand’s name, service categories, and logo.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] md:items-start">
            <div>
              <label className={labelCls}>Brand Logo</label>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <LogoUpload
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.logo?.message as string}
                    label=""
                    shape="avatar"
                    className="space-y-0"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Brand Name</label>
                <input
                  {...register("name")}
                  className={inputCls(!!errors.name)}
                  placeholder="e.g. Zenith Wellness Group"
                />
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Service Categories</label>
                <Controller
                  control={control}
                  name="serviceCategories"
                  render={({ field }) => (
                    <SearchableMultiSelect
                      taxonomy={CATEGORY_TAXONOMY}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select categories..."
                    />
                  )}
                />
                {errors.serviceCategories && (
                  <p className="mt-1 flex items-center gap-1 text-label text-destructive">
                    <WarningCircle size={12} />{" "}
                    {errors.serviceCategories.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFooter && (
        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-body font-medium text-subtle hover:text-foreground"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 text-body font-semibold"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>{initialData ? "Save Changes" : "Create Brand"}</>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
