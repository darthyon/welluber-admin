"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, WarningCircle, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createVoucherSchema, CreateVoucherData } from "@/features/providers/schemas";
import { createVoucher, updateVoucher, publishVoucher } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { ChoiceCard } from "@/components/shared/choice-card";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import {
  DURATION_UNITS,
  VALIDATION_UNITS,
  REDEMPTION_UNITS,
  MEMBERSHIP_START_DAYS,
  CURRENCIES,
} from "@/features/providers/constants";
import { SERVICE_TAXONOMY } from "@/features/organizations/constants";
import type { SpVoucher } from "@/types/provider";
import { CalendarBlank, Timer } from "@phosphor-icons/react";

const ALL_SERVICES = SERVICE_TAXONOMY.flatMap((c) => c.services);

interface SpVoucherFormProps {
  spId: string;
  spServiceCategories: string[];
  spBranches: { id: string; name: string }[];
  voucher?: SpVoucher;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpVoucherForm({
  spId,
  spServiceCategories,
  spBranches,
  voucher,
  onSuccess,
  onCancel,
}: SpVoucherFormProps) {
  const isEditing = !!voucher;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<CreateVoucherData>({
    resolver: zodResolver(createVoucherSchema as any),
    defaultValues: {
      name: voucher?.name ?? "",
      description: voucher?.description ?? "",
      serviceLines: voucher?.serviceLines ?? [
        { serviceCategory: spServiceCategories[0] ?? "", subServiceLabel: "", description: "", duration: { unit: "session", value: 1 }, weight: 1.0 },
      ],
      currency: voucher?.currency ?? "MYR",
      initialPrice: voucher?.initialPrice ?? 0,
      finalPrice: voucher?.finalPrice ?? 0,
      activationPeriod: {
        startDate: voucher?.activationPeriod.startDate?.slice(0, 10) ?? "",
        endDate: voucher?.activationPeriod.endDate?.slice(0, 10) ?? "",
      },
      validationDuration: { unit: voucher?.validationDuration.unit ?? "months", value: voucher?.validationDuration.value ?? 1 },
      redemptionPeriod: {
        mode: voucher?.redemptionPeriod.mode ?? "after_purchase",
        date: voucher?.redemptionPeriod.date?.slice(0, 10) ?? "",
        unit: voucher?.redemptionPeriod.unit ?? "day",
        value: voucher?.redemptionPeriod.value ?? 30,
      },
      membershipStartDay: voucher?.membershipStartDay ?? "none",
      branchScope: voucher?.branchScope ?? "all",
      branchIds: voucher?.branchIds ?? [],
    },
  });

  const { fields: serviceLineFields, append: appendLine, remove: removeLine } = useFieldArray({ control, name: "serviceLines" });

  const watchedLines = useWatch({ control, name: "serviceLines" });
  const redemptionMode = watch("redemptionPeriod.mode");
  const branchScope = watch("branchScope");

  const weightSum = watchedLines?.reduce((acc, l) => acc + (Number(l.weight) || 0), 0) ?? 0;
  const weightValid = Math.abs(weightSum - 1) < 0.001;

  const onSave = async (data: CreateVoucherData) => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateVoucher(spId, voucher!.id, data)
        : await createVoucher(spId, data);
      if (res.success) {
        setSuccessMessage(isEditing ? "Voucher updated." : "Voucher saved as draft.");
        setIsSuccess(true);
        setTimeout(onSuccess, 1800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPublish = async () => {
    if (!isEditing) return;
    setIsPublishing(true);
    const res = await publishVoucher(spId, voucher!.id);
    if (res.success) {
      setSuccessMessage("Voucher published successfully.");
      setIsSuccess(true);
      setTimeout(onSuccess, 1800);
    }
    setIsPublishing(false);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError ? "border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  const selectCls = () => cn(inputCls(), "appearance-none");

  if (isSuccess) {
    return (
      <div className="py-8">
        <SuccessCelebration title="Done" message={successMessage} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-10">

      {/* Section 1: Basic Info */}
      <section className="space-y-4">
        <SectionHeading>Basic Info</SectionHeading>
        {isEditing && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Voucher Code</label>
            <input value={voucher?.code} disabled className="w-full px-3 py-2 bg-muted border border-border rounded-md text-[14px] font-mono text-muted-foreground cursor-not-allowed" />
            <p className="text-[11px] text-muted-foreground">Auto-generated. Format: PAC&#123;SPID&#125;NNNN</p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Voucher Name</label>
          <input {...register("name")} className={inputCls(!!errors.name)} placeholder="e.g. Monthly Yoga Pass" />
          {errors.name && <FieldError msg={errors.name.message} />}
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea {...register("description")} rows={3} className={cn(inputCls(), "resize-none")} placeholder="What does this voucher cover?" />
        </div>
      </section>

      {/* Section 2: Service Lines */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Included Services</SectionHeading>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[12px] h-7 gap-1"
            onClick={() => appendLine({ serviceCategory: spServiceCategories[0] ?? "", subServiceLabel: "", description: "", duration: { unit: "session", value: 1 }, weight: 0 })}
          >
            <Plus size={13} /> Add Service Line
          </Button>
        </div>

        {/* Weight sum indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium",
          weightValid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
        )}>
          <Info size={13} />
          Weight sum: {weightSum.toFixed(2)} / 1.00 — {weightValid ? "Valid" : "Must equal exactly 1.00"}
        </div>

        {(errors.serviceLines as any)?.message && <FieldError msg={(errors.serviceLines as any).message} />}

        {serviceLineFields.map((field, i) => (
          <div key={field.id} className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Line {i + 1}</span>
              {serviceLineFields.length > 1 && (
                <button type="button" onClick={() => removeLine(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Service Category</label>
                <select {...register(`serviceLines.${i}.serviceCategory`)} className={selectCls()}>
                  {spServiceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Sub-service Label</label>
                <input {...register(`serviceLines.${i}.subServiceLabel`)} className={inputCls(!!(errors.serviceLines as any)?.[i]?.subServiceLabel)} placeholder="e.g. Group Yoga Class" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-muted-foreground">Description <span className="font-normal">(optional)</span></label>
                <input {...register(`serviceLines.${i}.description`)} className={inputCls()} placeholder="e.g. Unlimited drop-in sessions" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Duration</label>
                <div className="flex gap-2">
                  <input type="number" min={1} {...register(`serviceLines.${i}.duration.value`, { valueAsNumber: true })} className={cn(inputCls(), "w-20 text-center")} />
                  <select {...register(`serviceLines.${i}.duration.unit`)} className={cn(selectCls(), "flex-1")}>
                    {DURATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Weight
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">(0–1, all lines must sum to 1.0)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  {...register(`serviceLines.${i}.weight`, { valueAsNumber: true })}
                  className={cn(inputCls(!!(errors.serviceLines as any)?.[i]?.weight), "font-mono")}
                  placeholder="e.g. 0.6"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section 3: Pricing */}
      <section className="space-y-4">
        <SectionHeading>Pricing</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Currency</label>
            <select {...register("currency")} className={selectCls()}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Initial Price (RM)</label>
            <input type="number" min={0} step="0.01" {...register("initialPrice", { valueAsNumber: true })} className={inputCls(!!errors.initialPrice)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground flex items-center gap-1">
              Final Price (RM)
              <span className="text-[10px] font-normal text-muted-foreground">(whole number)</span>
            </label>
            <input type="number" min={0} step="1" {...register("finalPrice", { valueAsNumber: true })} className={inputCls(!!errors.finalPrice)} />
            {errors.finalPrice && <FieldError msg={errors.finalPrice.message} />}
            <p className="text-[10px] text-muted-foreground">Round: ≥0.50 → up, &lt;0.50 → down</p>
          </div>
        </div>
      </section>

      {/* Section 4: Activation Period */}
      <section className="space-y-4">
        <SectionHeading>Activation Period</SectionHeading>
        <p className="text-[12px] text-muted-foreground">When this voucher appears in the Welluber app marketplace.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Start Date</label>
            <input type="date" {...register("activationPeriod.startDate")} className={inputCls(!!(errors.activationPeriod as any)?.startDate)} />
            {(errors.activationPeriod as any)?.startDate && <FieldError msg={(errors.activationPeriod as any).startDate.message} />}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              End Date <span className="text-muted-foreground font-normal">(optional — open-ended if blank)</span>
            </label>
            <input type="date" {...register("activationPeriod.endDate")} className={inputCls()} />
          </div>
        </div>
      </section>

      {/* Section 5: Validation Duration */}
      <section className="space-y-4">
        <SectionHeading>Validation Duration</SectionHeading>
        <p className="text-[12px] text-muted-foreground">How long the purchased voucher is valid for use.</p>
        <div className="flex gap-3 items-end">
          <div className="space-y-1.5 w-24">
            <label className="text-[13px] font-medium text-foreground">Value</label>
            <input type="number" min={1} {...register("validationDuration.value", { valueAsNumber: true })} className={inputCls()} />
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-[13px] font-medium text-foreground">Unit</label>
            <select {...register("validationDuration.unit")} className={selectCls()}>
              {VALIDATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Section 6: Redemption Period */}
      <section className="space-y-4">
        <SectionHeading>Redemption Period</SectionHeading>
        <p className="text-[12px] text-muted-foreground">When the voucher can be redeemed at the provider.</p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            title="On Exact Date"
            description="Member must redeem on a specific date"
            icon={CalendarBlank}
            selected={redemptionMode === "exact_date"}
            onSelect={() => setValue("redemptionPeriod.mode", "exact_date")}
          />
          <ChoiceCard
            title="After Purchase"
            description="Member can redeem within a duration from purchase"
            icon={Timer}
            selected={redemptionMode === "after_purchase"}
            onSelect={() => setValue("redemptionPeriod.mode", "after_purchase")}
          />
        </div>

        {redemptionMode === "exact_date" && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Redemption Date</label>
            <input type="date" {...register("redemptionPeriod.date")} className={inputCls()} />
          </div>
        )}

        {redemptionMode === "after_purchase" && (
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5 w-24">
              <label className="text-[13px] font-medium text-foreground">Value</label>
              <input type="number" min={1} {...register("redemptionPeriod.value", { valueAsNumber: true })} className={inputCls()} />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-[13px] font-medium text-foreground">Unit</label>
              <select {...register("redemptionPeriod.unit")} className={selectCls()}>
                {REDEMPTION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Section 7: Membership Start Day */}
      <section className="space-y-4">
        <SectionHeading>Membership Start Day</SectionHeading>
        <div className="flex gap-3">
          {MEMBERSHIP_START_DAYS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("membershipStartDay", value)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all",
                watch("membershipStartDay") === value
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Section 8: Branches */}
      <section className="space-y-4">
        <SectionHeading>Available At</SectionHeading>
        <div className="flex gap-3">
          {(["all", "specific"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setValue("branchScope", scope)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all capitalize",
                watch("branchScope") === scope
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {scope === "all" ? "All Branches" : "Specific Branches"}
            </button>
          ))}
        </div>

        {branchScope === "specific" && (
          <div className="space-y-2">
            {spBranches.length === 0 ? (
              <p className="text-[12px] text-muted-foreground italic">No branches configured for this SP.</p>
            ) : (
              spBranches.map((branch) => {
                const branchIds = watch("branchIds") ?? [];
                const isSelected = branchIds.includes(branch.id);
                return (
                  <label key={branch.id} className="flex items-center gap-3 py-2.5 px-4 bg-muted/20 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = isSelected
                          ? branchIds.filter((id) => id !== branch.id)
                          : [...branchIds, branch.id];
                        setValue("branchIds", next);
                      }}
                      className="rounded"
                    />
                    <span className="text-[13px] font-medium text-foreground">{branch.name}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} className="text-[13px]">Cancel</Button>
        <div className="flex items-center gap-2">
          {isEditing && voucher?.status === "draft" && (
            <Button
              type="button"
              variant="outline"
              onClick={onPublish}
              disabled={isPublishing}
              className="text-[13px] text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-2"
            >
              {isPublishing ? <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /> : null}
              Publish
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="text-[13px] gap-2">
            {isSubmitting ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : "Save as Draft"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border/50">
      {children}
    </h4>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1">
      <WarningCircle size={12} /> {msg}
    </p>
  );
}
