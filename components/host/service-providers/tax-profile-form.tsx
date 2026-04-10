"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { taxProfileSchema, TaxProfileData } from "@/features/providers/schemas";
import { saveTaxProfile } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import type { TaxProfile } from "@/types/provider";

interface TaxProfileFormProps {
  spId: string;
  initial: TaxProfile;
}

export function TaxProfileForm({ spId, initial }: TaxProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState({
    isTaxRegistered: initial.isTaxRegistered,
    taxRegNo: initial.taxRegNo ?? "",
    taxRate: initial.taxRate,
  });

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<TaxProfileData>({
    resolver: zodResolver(taxProfileSchema as any),
    shouldUnregister: true,
    defaultValues: {
      isTaxRegistered: initial.isTaxRegistered,
      taxRegNo: initial.taxRegNo ?? "",
      taxRate: initial.taxRate,
    },
  });

  const handleToggle = (checked: boolean) => {
    setValue("isTaxRegistered", checked, { shouldDirty: true, shouldValidate: false });
    if (!checked) {
      setValue("taxRegNo", "");
      clearErrors("taxRegNo");
    }
  };

  const onSubmit = async (data: TaxProfileData) => {
    setIsSaving(true);
    setSavedMessage(null);
    try {
      const res = await saveTaxProfile(spId, data);
      if (res.success) {
        setSavedMessage(res.message ?? "Saved.");
        setSavedProfile({
          isTaxRegistered: data.isTaxRegistered,
          taxRegNo: data.taxRegNo ?? "",
          taxRate: data.taxRate,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const currentRegistered = watch("isTaxRegistered", initial.isTaxRegistered);
  const currentTaxRegNo = watch("taxRegNo", initial.taxRegNo ?? "");
  const currentTaxRate = watch("taxRate", initial.taxRate);
  const isDirty =
    currentRegistered !== savedProfile.isTaxRegistered ||
    currentTaxRate !== savedProfile.taxRate ||
    (currentRegistered && currentTaxRegNo !== savedProfile.taxRegNo);

  const handleSaveClick = async () => {
    const valid = await trigger();
    if (!valid) return;
    await onSubmit(getValues());
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
      hasError ? "border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* SST Registered toggle */}
      <div className="flex items-center justify-between py-2 border-b border-border/50">
        <div>
          <p className="text-nav font-medium text-foreground">SST Registered</p>
          <p className="text-caption text-muted-foreground mt-0.5">
            Wellness centres above RM 500,000 taxable turnover must register for SST.
          </p>
        </div>
        <Switch checked={currentRegistered} onCheckedChange={handleToggle} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-end">
        {currentRegistered && (
          <div className="space-y-1.5 md:self-stretch">
            <label className="text-nav font-medium text-foreground">SST Registration Number</label>
            <input
              {...register("taxRegNo")}
              className={inputCls(!!errors.taxRegNo)}
              placeholder="e.g. SST-2024-001234"
            />
            {errors.taxRegNo && (
              <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                <WarningCircle size={12} /> {errors.taxRegNo.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-nav font-medium text-foreground flex items-center justify-between">
            Tax Rate
            <span className="text-caption font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Default: 8% (SST Group C)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              {...register("taxRate", { valueAsNumber: true })}
              className={inputCls(!!errors.taxRate)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-label text-muted-foreground pointer-events-none">
              (decimal, e.g. 0.08 = 8%)
            </span>
          </div>
          {errors.taxRate && (
            <p className="text-caption text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {errors.taxRate.message}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 md:self-end">
          {isDirty ? (
            <Button type="button" size="sm" disabled={isSaving} onClick={handleSaveClick} className="text-nav">
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  Save
                  <CheckCircle size={14} weight="bold" />
                </>
              )}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-label font-medium text-emerald-600">
              <CheckCircle size={14} weight="fill" /> Saved
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
