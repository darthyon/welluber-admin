"use client";

import { IdentificationCard } from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { BUSINESS_TYPES } from "@/features/providers/constants";

interface RegistrationComplianceSectionProps {
  register: any;
  control: any;
  errors: any;
  setValue: any;
  businessType?: string;
  labelCls: string;
  inputCls: (hasError?: boolean) => string;
}

export function RegistrationComplianceSection({
  register,
  control,
  errors,
  setValue,
  businessType,
  labelCls,
  inputCls,
}: RegistrationComplianceSectionProps) {
  return (
    <div id="registration-compliance" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <IdentificationCard size={16} weight="fill" />
          </div>
          <h3 className="text-subtitle font-semibold text-foreground">Registration & Compliance</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="registrationNo" className={labelCls}>Registration Number (BRN)</label>
            <input
              id="registrationNo"
              {...register("registrationNo")}
              className={inputCls(!!errors.registrationNo)}
              placeholder="e.g. 1122334-A"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tinNumber" className={labelCls}>TIN Number</label>
            <input
              id="tinNumber"
              {...register("tinNumber")}
              className={inputCls()}
              placeholder="e.g. TR-882910-01"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="taxRegNo" className={labelCls}>SST Registration No. <span className="text-muted-foreground font-normal">(if applicable)</span></label>
            <input
              id="taxRegNo"
              {...register("taxProfile.taxRegNo")}
              className={inputCls()}
              placeholder="e.g. W10-1808-32000123"
            />
          </div>

          <div className="sm:col-span-2 pt-4 space-y-6 border-t border-border/40">
            <div className="space-y-3">
              <label className={labelCls}>Business Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("businessType", type.id as any)}
                    className={cn(
                      "flex flex-col p-3 border rounded-lg text-left transition-all duration-200",
                      businessType === type.id 
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20" 
                        : "border-border hover:border-border-hover bg-muted/5"
                    )}
                  >
                    <span className={cn("text-nav font-semibold", businessType === type.id ? "text-primary" : "text-foreground")}>{type.label}</span>
                    <span className="text-micro text-muted-foreground mt-0.5 leading-tight">{type.docs}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Controller
                control={control}
                name="documents"
                render={({ field }) => {
                  const typeInfo = BUSINESS_TYPES.find(t => t.id === businessType);
                  return (
                    <DocumentUploadSection
                      documents={field.value || []}
                      onChange={field.onChange}
                      error={errors.documents?.message as string}
                      label={`${typeInfo?.label || "Provider"} Documents`}
                      description={`Please upload the required documents for ${typeInfo?.label || "this provider"}: ${typeInfo?.docs}`}
                    />
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
