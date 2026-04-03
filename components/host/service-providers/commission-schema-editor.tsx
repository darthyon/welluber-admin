"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarBlank, CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { commissionSchemaSchema, CommissionSchemaData } from "@/features/providers/schemas";
import { saveCommissionSchema } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { COMMISSION_RATE_MIN, COMMISSION_RATE_MAX } from "@/features/providers/constants";
import type { CommissionSchemaRow } from "@/types/provider";

interface CommissionSchemaEditorProps {
  spId: string;
  serviceCategories: string[];
  initialRows: CommissionSchemaRow[];
}

export function CommissionSchemaEditor({ spId, serviceCategories, initialRows }: CommissionSchemaEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const defaultRows = serviceCategories.map((cat) => {
    const existing = initialRows.find((r) => r.serviceCategory === cat);
    return {
      serviceCategory: cat,
      commissionRate: existing?.commissionRate ?? COMMISSION_RATE_MIN,
      expiredCommissionRate: existing?.expiredCommissionRate ?? COMMISSION_RATE_MIN,
      effectiveFrom: existing?.effectiveFrom ?? "",
    };
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CommissionSchemaData>({
    resolver: zodResolver(commissionSchemaSchema as any),
    defaultValues: { rows: defaultRows },
  });

  const watchedRows = watch("rows");

  const onSubmit = async (data: CommissionSchemaData) => {
    setIsSaving(true);
    setSavedMessage(null);
    try {
      const res = await saveCommissionSchema(spId, data);
      if (res.success) {
        setSavedMessage(res.message ?? "Saved.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const rateInputCls = (hasError?: boolean) =>
    cn(
      "w-full px-2 py-1.5 bg-background border rounded-md text-[13px] font-mono outline-none transition-colors text-right",
      hasError ? "border-destructive" : "border-border focus:border-foreground/30"
    );

  if (serviceCategories.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground italic">
        No service categories assigned. Add categories to configure commission rates.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Notice */}
      <p className="text-[12px] text-muted-foreground bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Commission changes apply to new transactions only. Past transactions retain their original rates.
      </p>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_120px_160px] gap-3 px-4 py-2.5 bg-muted/30 border-b border-border">
          {["Service Category", "Rate (Redeemed)", "Rate (Expired)", "Effective From"].map((h) => (
            <p key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {defaultRows.map((row, i) => {
          const effectiveFrom = watchedRows?.[i]?.effectiveFrom ?? "";
          const isFutureDated = effectiveFrom && new Date(effectiveFrom) > new Date();
          const rowErrors = (errors.rows as any)?.[i];

          return (
            <div key={row.serviceCategory} className="grid grid-cols-[1fr_120px_120px_160px] gap-3 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
              {/* Category name */}
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-foreground">{row.serviceCategory}</p>
                {isFutureDated && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    <Clock size={9} /> Scheduled
                  </span>
                )}
              </div>

              {/* Redeemed rate */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={COMMISSION_RATE_MIN}
                    max={COMMISSION_RATE_MAX}
                    {...register(`rows.${i}.commissionRate`, { valueAsNumber: true })}
                    className={rateInputCls(!!rowErrors?.commissionRate)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">×</span>
                </div>
                {rowErrors?.commissionRate && (
                  <p className="text-[10px] text-destructive flex items-center gap-0.5">
                    <WarningCircle size={10} /> {rowErrors.commissionRate.message}
                  </p>
                )}
              </div>

              {/* Expired rate */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={COMMISSION_RATE_MIN}
                    max={COMMISSION_RATE_MAX}
                    {...register(`rows.${i}.expiredCommissionRate`, { valueAsNumber: true })}
                    className={rateInputCls(!!rowErrors?.expiredCommissionRate)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">×</span>
                </div>
                {rowErrors?.expiredCommissionRate && (
                  <p className="text-[10px] text-destructive flex items-center gap-0.5">
                    <WarningCircle size={10} /> {rowErrors.expiredCommissionRate.message}
                  </p>
                )}
              </div>

              {/* Effective from */}
              <div className="relative">
                <CalendarBlank size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  {...register(`rows.${i}.effectiveFrom`)}
                  className="w-full pl-8 pr-2 py-1.5 bg-background border border-border rounded-md text-[12px] outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              {/* Hidden category */}
              <input type="hidden" {...register(`rows.${i}.serviceCategory`)} value={row.serviceCategory} />
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {savedMessage ? (
          <p className="text-[12px] text-emerald-600 flex items-center gap-1.5 font-medium">
            <CheckCircle size={14} weight="fill" /> {savedMessage}
          </p>
        ) : (
          <div />
        )}
        <Button type="submit" size="sm" disabled={isSaving} className="text-[13px]">
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            "Save Commission Schema"
          )}
        </Button>
      </div>
    </form>
  );
}
