"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Switch } from "@/components/shared/switch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brand, BrandStatus } from "@/types/brand";
import { LogoUpload } from "@/components/shared/logo-upload";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  logo: z.any().optional(),
  status: z.enum(["active", "inactive"]),
  serviceCategories: z.array(z.string()).min(1, "Select at least one service category"),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function BrandForm({ initialData, onSubmit, onCancel, isSubmitting }: BrandFormProps) {
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
      status: initialData?.status === "removed" ? "inactive" : initialData?.status || "active",
      serviceCategories: initialData?.serviceCategories || [],
    },
  });

  const CATEGORY_TAXONOMY = [
    {
      category: "Service Categories",
      services: MASTER_SERVICE_TAXONOMY.map((group) => group.category),
    },
  ];

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Brand name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Brand name</label>
          <input
            {...register("name")}
            className={inputCls(!!errors.name)}
            placeholder="e.g. Zenith Wellness Group"
          />
          {errors.name && (
            <p className="text-caption text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {errors.name.message}
            </p>
          )}
        </div>

        <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-1 text-primary">
            <Tag size={16} weight="fill" />
            <h3 className="text-nav font-semibold">Service categories</h3>
          </div>
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
            <p className="text-caption text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {errors.serviceCategories.message}
            </p>
          )}
        </div>

        {/* Logo Upload */}
        <Controller
          control={control}
          name="logo"
          render={({ field }) => (
            <LogoUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.logo?.message as string}
              label="Brand logo"
            />
          )}
        />

        {/* Brand status - Only show when editing */}
        {initialData && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground leading-tight">Brand status</h4>
              <p className="text-caption text-muted-foreground opacity-70">
                Only active brands can have new service providers assigned.
              </p>
            </div>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-micro font-semibold tracking-tight transition-colors",
                    field.value === "active" ? "text-emerald-600" : "text-muted-foreground/60"
                  )}>
                    {field.value === "active" ? "Active" : "Inactive"}
                  </span>
                  <Switch 
                    checked={field.value === "active"} 
                    onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                  />
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-nav font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-nav font-semibold px-6"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{initialData ? "Save Changes" : "Create Brand"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
