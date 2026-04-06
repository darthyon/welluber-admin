"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, WarningCircle, CheckCircle, Info } from "@phosphor-icons/react";
import { commissionSchemaSchema, CommissionSchemaData } from "@/features/providers/schemas";
import { saveCommissionSchema } from "@/features/providers/actions";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { inputCls } from "../../shared/styles";

interface CommissionSchemaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spId: string;
  serviceCategories: string[];
  initialRows: any[];
}

export function CommissionSchemaSheet({
  isOpen,
  onClose,
  spId,
  serviceCategories,
  initialRows,
}: CommissionSchemaSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainService, setSelectedMainService] = useState("");

  // Derive available Main Services from SP's categories
  const availableMainServices = useMemo(() => {
    return MASTER_SERVICE_TAXONOMY.filter((cat) => serviceCategories.includes(cat.category))
      .flatMap((cat) => cat.services.map((s) => s.name))
      .sort();
  }, [serviceCategories]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CommissionSchemaData>({
    resolver: zodResolver(commissionSchemaSchema),
    defaultValues: {
      rows: initialRows ?? [],
    },
  });

  const { fields: rows, append: rowsAppend, remove: rowsRemove } = useFieldArray({
    control,
    name: "rows",
  });

  const onSubmit = async (data: CommissionSchemaData) => {
    setIsSubmitting(true);
    try {
      const res = await saveCommissionSchema(spId, data);
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Service Portfolio & Commissions"
      description="Define the main services offered by this provider and configure their commission rates."
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Portfolio"}
          </Button>
        </>
      }
    >
      <div className="space-y-8 pb-8">
        {/* Add Main Service to Portfolio Section */}
        <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Plus size={16} weight="bold" />
            <span className="text-[13px] font-semibold">Add Service to Portfolio</span>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMainService}
              onChange={(e) => setSelectedMainService(e.target.value)}
              className={inputCls(false, "h-10 text-[13px]")}
            >
              <option value="">Select a main service...</option>
              {availableMainServices
                .filter((ms) => !watch("rows")?.some((row) => row.mainService === ms))
                .map((ms) => (
                  <option key={ms} value={ms}>
                    {ms}
                  </option>
                ))}
            </select>
            <Button
              type="button"
              disabled={!selectedMainService}
              onClick={() => {
                rowsAppend({ mainService: selectedMainService, tiers: [{ limit: 0, rate: 0.1 }] });
                setSelectedMainService("");
              }}
              className="h-10 px-4 gap-2"
            >
              Add to Portfolio
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Only services from the provider's assigned categories ({serviceCategories.join(", ")}) are available.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/5">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
              <Plus size={24} className="text-muted-foreground/60" />
            </div>
            <p className="text-[13px] font-medium text-foreground">No services in portfolio</p>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px] mx-auto">
              Add the services this provider offers to start configuring commissions.
            </p>
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <ServiceSchemaRow
              key={row.id}
              rowIndex={rowIndex}
              mainService={row.mainService}
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              onRemove={() => rowsRemove(rowIndex)}
            />
          ))
        )}
      </div>
    </Sheet>
  );
}

function ServiceSchemaRow({
  rowIndex,
  mainService,
  control,
  register,
  errors,
  watch,
  onRemove,
}: {
  rowIndex: number;
  mainService: string;
  control: any;
  register: any;
  errors: any;
  watch: any;
  onRemove: () => void;
}) {
  const { fields: tiers, append, remove } = useFieldArray({
    control,
    name: `rows.${rowIndex}.tiers`,
  });

  const watchedTiers = watch(`rows.${rowIndex}.tiers`);

  return (
    <div className="space-y-3 p-4 border border-border rounded-xl bg-muted/5">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          {mainService}
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
            Main Service
          </span>
        </h4>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-[11px] gap-1.5"
            onClick={() => append({ limit: (watchedTiers[watchedTiers.length - 1]?.limit ?? 0) + 100, rate: 0.1 })}
          >
            <Plus size={12} /> Add Tier
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash size={15} />
          </Button>
        </div>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
        <div className="grid grid-cols-[140px_1fr_60px] gap-4 px-3 py-2 bg-muted/30 border-b border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Starts From (Qty)</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Commission Rate (%)</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Delete</p>
        </div>

        <div className="divide-y divide-border/30">
          {tiers.map((tier, tierIndex) => {
            const tierError = errors.rows?.[rowIndex]?.tiers?.[tierIndex];
            const isBase = tierIndex === 0;

            return (
              <div key={tier.id} className="grid grid-cols-[140px_1fr_60px] gap-4 items-start px-3 py-3 hover:bg-muted/5">
                {/* Limit / Starts From */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="number"
                      {...register(`rows.${rowIndex}.tiers.${tierIndex}.limit`, { valueAsNumber: true })}
                      disabled={isBase}
                      className={inputCls(!!tierError?.limit, "h-9 text-[13px] font-mono")}
                    />
                    {isBase && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Info size={12} className="text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  {tierError?.limit && (
                    <p className="text-[10px] text-destructive flex items-center gap-0.5">
                      <WarningCircle size={10} /> {tierError.limit.message}
                    </p>
                  )}
                  {isBase && <p className="text-[10px] text-muted-foreground italic">Base tier starts at 0</p>}
                </div>

                {/* Rate */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`rows.${rowIndex}.tiers.${tierIndex}.rate`, { valueAsNumber: true })}
                      className={inputCls(!!tierError?.rate, "h-9 text-[13px] font-mono pl-3 pr-8")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground font-mono">
                      × 100
                    </span>
                  </div>
                  {tierError?.rate && (
                    <p className="text-[10px] text-destructive flex items-center gap-0.5">
                      <WarningCircle size={10} /> {tierError.rate.message}
                    </p>
                  )}
                </div>

                {/* Remove */}
                <div className="flex justify-end">
                  {!isBase && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(tierIndex)}
                    >
                      <Trash size={14} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Array-level validation error (e.g. non-sequential limits) */}
      {errors.rows?.[rowIndex]?.tiers && "message" in (errors.rows[rowIndex].tiers as any) && (
        <p className="text-[11px] text-destructive flex items-center gap-1.5 mt-2 bg-destructive/5 px-2 py-1.5 rounded-lg border border-destructive/10">
          <WarningCircle size={14} /> {(errors.rows[rowIndex].tiers as any).message}
        </p>
      )}
    </div>
  );
}
