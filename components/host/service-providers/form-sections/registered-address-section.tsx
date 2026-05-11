"use client";

import { MapPin } from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { LocationPicker } from "@/components/shared/location-picker";
import { z } from "zod";
import { createSpSchema } from "@/features/providers/schemas";

type SpFormData = z.input<typeof createSpSchema> & { brandName?: string; brandLogo?: File | string | null };

interface RegisteredAddressSectionProps {
  control: Control<SpFormData>;
  errors: FieldErrors<SpFormData>;
}

export function RegisteredAddressSection({
  control,
  errors,
}: RegisteredAddressSectionProps) {
  return (
    <div id="business-address" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Business Address</h3>
            <p className="text-label text-muted-foreground">Official business address as per SSM registration.</p>
          </div>
        </div>

        <div className="p-1">
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <LocationPicker
                value={field.value ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" }}
                onChange={(val) => field.onChange(val)}
                errors={errors.address}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
