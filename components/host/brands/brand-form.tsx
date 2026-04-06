"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brand } from "@/types/brand";
import { LogoUpload } from "@/components/shared/logo-upload";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  logo: z.any().optional(),
  status: z.enum(["active", "inactive"]),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormData) => void;
  isSubmitting?: boolean;
}

export function BrandForm({ initialData, onSubmit, isSubmitting }: BrandFormProps) {
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
    },
  });

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Brand Name */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand Name</label>
          <input
            {...register("name")}
            className={inputCls(!!errors.name)}
            placeholder="e.g. Zenith Wellness Group"
          />
          {errors.name && (
            <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {errors.name.message}
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
              label="Brand Logo"
            />
          )}
        />

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <h4 className="text-[13px] font-semibold text-foreground">Activate Brand</h4>
            <p className="text-[11px] text-muted-foreground opacity-70">
              Only active brands can have new service providers assigned.
            </p>
          </div>
          <select
            {...register("status")}
            className="bg-background border border-border rounded px-2 py-1 text-[12px] font-medium outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-[13px] font-bold px-6"
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
