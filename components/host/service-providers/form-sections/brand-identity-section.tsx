"use client";

import { Tag } from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { LogoUpload } from "@/components/shared/logo-upload";
import { z } from "zod";
import { createSpSchema } from "@/features/providers/schemas";

type SpFormData = z.input<typeof createSpSchema> & { brandName?: string; brandLogo?: File | string | null };

interface BrandIdentitySectionProps {
  register: UseFormRegister<SpFormData>;
  control: Control<SpFormData>;
  errors: FieldErrors<SpFormData>;
  labelCls: string;
  inputCls: (hasError?: boolean) => string;
}

export function BrandIdentitySection({
  register,
  control,
  errors,
  labelCls,
  inputCls,
}: BrandIdentitySectionProps) {
  return (
    <div id="brand-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
      <div className="p-6 border-b border-border space-y-5 bg-muted/[0.03]">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Brand Identity</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="brandName" className={labelCls}>Brand Name</label>
            <input
              id="brandName"
              {...register("brandName")}
              className={inputCls()}
              placeholder="e.g. Zenith Wellness"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Controller
              control={control}
              name="brandLogo"
              render={({ field }) => (
                <LogoUpload
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.brandLogo?.message as string}
                  label="Brand Logo"
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
