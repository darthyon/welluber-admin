"use client";

import { Storefront, Globe, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ProviderProfileSectionProps {
  register: any;
  errors: any;
  labelCls: string;
  inputCls: (hasError?: boolean) => string;
}

export function ProviderProfileSection({
  register,
  errors,
  labelCls,
  inputCls,
}: ProviderProfileSectionProps) {
  return (
    <div id="provider-profile" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Storefront size={16} weight="fill" />
          </div>
          <h3 className="text-subtitle font-semibold text-foreground">Provider Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="name" className={labelCls}>Service Provider Name</label>
            <input
              id="name"
              {...register("name")}
              className={inputCls(!!errors.name)}
              placeholder="e.g. Zenith Yoga Studio Sdn Bhd"
            />
            {errors.name && (
              <p className="text-caption text-destructive flex items-center gap-1 mt-1 font-medium">
                <WarningCircle size={12} weight="fill" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="website" className={labelCls}>Website Link</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                <Globe size={16} />
              </div>
              <input
                id="website"
                {...register("website")}
                className={cn(inputCls(!!errors.website), "pl-9")}
                placeholder="https://yoursite.my"
                type="url"
              />
            </div>
            {errors.website && (
              <p className="text-caption text-destructive flex items-center gap-1 mt-1 font-medium">
                <WarningCircle size={12} weight="fill" /> {errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="description" className={labelCls}>Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className={cn(inputCls(), "resize-none")}
              placeholder="Brief description of services offered..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
