"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  Trash, 
  WarningCircle, 
  Info, 
  CaretLeft, 
  Ticket, 
  CalendarBlank, 
  ListBullets,
  ClockAfternoon,
  Buildings,
  CurrencyCircleDollar,
  Timer,
  MapPin,
  Lightning,
  CalendarPlus,
  Clock,
  Stack
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createVoucherSchema, CreateVoucherData } from "@/features/providers/schemas";
import { createVoucher, updateVoucher, publishVoucher } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { DetailSection } from "@/components/shared/detail-section";
import { ChoiceCard } from "@/components/shared/choice-card";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { 
  DURATION_UNITS,
  REDEMPTION_UNITS,
  CURRENCIES,
} from "@/features/providers/constants";
import { 
  SERVICE_TAXONOMY, 
  SERVICE_SPEC_TAXONOMY 
} from "@/features/organizations/constants";
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import { CustomMultiSelect } from "@/components/shared/custom-multi-select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { SpVoucher } from "@/types/provider";

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
      name: voucher?.name || "",
      description: voucher?.description || "",
      serviceLines: voucher?.serviceLines || [
        { service: "", subServices: [], description: "", duration: { unit: "session", value: 1 } }
      ],
      currency: voucher?.currency || "MYR",
      initialPrice: voucher?.initialPrice || 0,
      finalPrice: voucher?.finalPrice || 0,
      activationPeriod: voucher?.activationPeriod || {
        startDate: new Date().toISOString().split("T")[0],
      },
      redemptionPeriod: voucher?.redemptionPeriod || {
        mode: "after_purchase",
        unit: "day",
        value: 30,
      },
      branchScope: voucher?.branchScope || "all",
      branchIds: voucher?.branchIds || [],
    },
  });

  const { fields: serviceLineFields, append: appendLine, remove: removeLine } = useFieldArray({ control, name: "serviceLines" });

  const watchedLines = useWatch({ control, name: "serviceLines" });
  const redemptionMode = watch("redemptionPeriod.mode");
  const branchScope = watch("branchScope");

  const onSave = async (data: CreateVoucherData) => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateVoucher(spId, voucher!.id, data)
        : await createVoucher(spId, data);
      if (res.success) {
        setSuccessMessage(isEditing ? "Voucher updated successfully." : "A new voucher has been added to your draft.");
        setIsSuccess(true);
        setTimeout(onSuccess, 2000);
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
      setSuccessMessage("Voucher published successfully and is now active.");
      setIsSuccess(true);
      setTimeout(onSuccess, 2000);
    }
    setIsPublishing(false);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-white border rounded-lg text-[14px] outline-none transition-all font-medium text-zinc-700",
      hasError 
        ? "border-rose-300 ring-2 ring-rose-50" 
        : "border-zinc-200 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 hover:border-zinc-300"
    );

  const selectCls = () => cn(inputCls(), "appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10");

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 py-20 animate-in zoom-in-95 duration-300">
        <SuccessCelebration 
          title={isEditing ? "Changes Saved!" : "Voucher Added!"} 
          message={successMessage} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors bg-white shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {isEditing ? "Edit Voucher" : "Add Voucher"}
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              {isEditing 
                ? "Update pricing, service lines, and activation periods for this voucher."
                : "Create a new voucher entry for services purchasable on the marketplace."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onCancel} 
            disabled={isSubmitting || isPublishing}
            className="text-zinc-600 font-medium"
          >
            Cancel
          </Button>
          
          {isEditing && voucher?.status === "draft" && (
            <Button
              type="button"
              variant="outline"
              onClick={onPublish}
              disabled={isSubmitting || isPublishing}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-medium px-6 shadow-sm min-w-[120px] gap-2 rounded-full h-10"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
              ) : null}
              <span>Publish</span>
            </Button>
          )}

          <Button 
            disabled={isSubmitting || isPublishing}
            onClick={handleSubmit(onSave)}
            className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 shadow-sm shadow-primary/20 min-w-[160px] rounded-full h-10 gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              isEditing ? "Save Changes" : "Add voucher"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          <DetailSection 
            title="Voucher Identity" 
            icon={<Ticket size={18} weight="duotone" />}
            description="Basic naming and description seen by your users"
          >
            <div className="space-y-5 p-1">
              {isEditing && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Voucher Code</label>
                  <div className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[14px] font-mono text-zinc-500 cursor-not-allowed">
                    {voucher?.code}
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">Auto-generated format. Cannot be changed.</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Voucher Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  {...register("name")} 
                  className={inputCls(!!errors.name)} 
                  placeholder="e.g. Monthly Yoga Pass" 
                />
                {errors.name && <FieldError msg={errors.name.message} />}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea 
                  {...register("description")} 
                  rows={3} 
                  className={cn(inputCls(), "resize-none")} 
                  placeholder="What does this voucher cover?" 
                />
              </div>
            </div>
          </DetailSection>

          <DetailSection 
            title="Service Line Items" 
            icon={<ListBullets size={18} weight="duotone" />}
            description="Specific services included in this voucher package"
          >
            <div className="space-y-5 p-1">
              {(errors.serviceLines as any)?.message && <FieldError msg={(errors.serviceLines as any).message} />}

              <div className="space-y-4">
                {serviceLineFields.map((field, i) => (
                  <div key={field.id} className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-200/60 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {i + 1}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Service Line</span>
                      </div>
                      {serviceLineFields.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeLine(i)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Service</label>
                        <SectionedSearchSelect
                          taxonomy={SERVICE_TAXONOMY.filter(cat => spServiceCategories.includes(cat.category))}
                          value={watch(`serviceLines.${i}.service`)}
                          onChange={(val) => {
                            setValue(`serviceLines.${i}.service`, val);
                            setValue(`serviceLines.${i}.subServices`, []);
                          }}
                          placeholder="Search service..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sub-services</label>
                        <CustomMultiSelect
                          options={SERVICE_SPEC_TAXONOMY[watch(`serviceLines.${i}.service`)] || []}
                          selected={watch(`serviceLines.${i}.subServices`) || []}
                          onChange={(val) => setValue(`serviceLines.${i}.subServices`, val)}
                          placeholder="Select or type custom..."
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Item Description</label>
                        <input 
                          {...register(`serviceLines.${i}.description`)} 
                          className={inputCls()} 
                          placeholder="e.g. Unlimited drop-in sessions" 
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Package Quantity</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            min={1} 
                            {...register(`serviceLines.${i}.duration.value`, { valueAsNumber: true })} 
                            className={cn(inputCls(), "w-24 text-center font-mono")} 
                          />
                          <select {...register(`serviceLines.${i}.duration.unit`)} className={cn(selectCls(), "flex-1")}>
                            {DURATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-zinc-200 h-12 text-zinc-400 hover:text-primary hover:border-primary/30 transition-all bg-white"
                  onClick={() => appendLine({ service: "", subServices: [], description: "", duration: { unit: "session", value: 1 } })}
                >
                  <Plus size={16} className="mr-2" /> Add Another Service Item
                </Button>
              </div>
            </div>
          </DetailSection>

          {/* Lifecycle & Validity */}
          <DetailSection 
            title="Lifecycle & Validity" 
            icon={<Stack size={18} weight="duotone" />}
            description="Activation period and redemption settings"
          >
            <div className="p-1 space-y-8">
              {/* Activation Period */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[14px] font-bold text-zinc-900">Activation Period</h4>
                  <p className="text-[12px] text-zinc-500 mt-0.5">When is this voucher available for purchase?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePickerField
                    placeholder="Start Date"
                    value={watch("activationPeriod.startDate")}
                    onChange={(v: string) => setValue("activationPeriod.startDate", v)}
                    clearable={false}
                  />
                  <DatePickerField
                    placeholder="End Date (Optional)"
                    value={watch("activationPeriod.endDate") || ""}
                    onChange={(v: string) => setValue("activationPeriod.endDate", v)}
                    clearable
                  />
                </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Redemption Period */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[14px] font-bold text-zinc-900">Redemption Period</h4>
                  <p className="text-[12px] text-zinc-500 mt-0.5">When can customers use this voucher?</p>
                </div>

                <div className="flex flex-col gap-2">
                  <ChoiceCard
                    title="Relative"
                    description="Valid after purchase."
                    icon={Clock}
                    selected={redemptionMode === "after_purchase"}
                    onSelect={() => setValue("redemptionPeriod.mode", "after_purchase")}
                    className="p-3"
                  />
                  <ChoiceCard
                    title="Fixed"
                    description="Set expiry date."
                    icon={CalendarBlank}
                    selected={redemptionMode === "exact_date"}
                    onSelect={() => setValue("redemptionPeriod.mode", "exact_date")}
                    className="p-3"
                  />
                </div>

                {redemptionMode === "after_purchase" && (
                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Valid for</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-16 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-center font-bold outline-none focus:ring-2 focus:ring-primary/10"
                          {...register("redemptionPeriod.value", { valueAsNumber: true })}
                        />
                        <select
                          className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[14px] font-semibold text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10"
                          {...register("redemptionPeriod.unit")}
                        >
                          <option value="hr">Hours</option>
                          <option value="day">Days</option>
                          <option value="month">Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {redemptionMode === "exact_date" && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Expiry Date</label>
                    <DatePickerField
                      value={watch("redemptionPeriod.date") || ""}
                      onChange={(v: string) => setValue("redemptionPeriod.date", v)}
                      className="bg-white"
                      clearable
                    />
                  </div>
                )}
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <DetailSection 
            title="Voucher Hero" 
            icon={<Info size={18} weight="duotone" />}
            description="Header image for marketplace listing"
          >
            <div className="p-1 space-y-4">
              <div className="aspect-[16/10] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-primary/30 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Plus size={20} weight="bold" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-zinc-900">Upload Header</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection 
            title="Assigned Branch" 
            icon={<Buildings size={18} weight="duotone" />}
            description="Which locations accept this voucher?"
          >
            <div className="p-1 space-y-5">
              <div className="grid grid-cols-1 gap-2">
                <ChoiceCard
                  title="Global"
                  description="All branch locations"
                  icon={Buildings}
                  selected={branchScope === "all"}
                  onSelect={() => {
                    setValue("branchScope", "all");
                    setValue("branchIds", []);
                  }}
                  className="p-3"
                />
                <ChoiceCard
                  title="Local"
                  description="Selected branches only"
                  icon={MapPin}
                  selected={branchScope === "specific"}
                  onSelect={() => setValue("branchScope", "specific")}
                  className="p-3"
                />
              </div>

              {branchScope === "specific" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Branches</label>
                  <CustomMultiSelect
                    options={spBranches.map(b => b.name)}
                    selected={watch("branchIds").map(id => spBranches.find(b => b.id === id)?.name || id)}
                    onChange={(names) => {
                      const ids = names.map(name => spBranches.find(b => b.name === name)?.id || name);
                      setValue("branchIds", ids);
                    }}
                    placeholder="Search branches..."
                  />
                  {(errors as any).branchIds && <FieldError msg={(errors as any).branchIds.message} />}
                </div>
              )}
            </div>
          </DetailSection>

          <DetailSection 
            title="Commercials" 
            icon={<CurrencyCircleDollar size={18} weight="duotone" />}
            description="Pricing and customer charges"
          >
            <div className="p-1 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Currency</label>
                <select {...register("currency")} className={selectCls()}>
                  {Object.entries(CURRENCIES).map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Initial Price</label>
                  <input type="number" step="0.01" {...register("initialPrice", { valueAsNumber: true })} className={cn(inputCls(), "font-mono")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Final Price</label>
                  <input type="number" step="0.01" {...register("finalPrice", { valueAsNumber: true })} className={cn(inputCls(!!errors.finalPrice), "font-mono font-bold text-primary bg-primary/5 border-primary/20")} />
                </div>
              </div>
              {errors.finalPrice && <FieldError msg={errors.finalPrice.message} />}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1 font-medium animate-in fade-in slide-in-from-top-1">
      <WarningCircle size={14} weight="fill" />
      <span>{msg}</span>
    </div>
  );
}
