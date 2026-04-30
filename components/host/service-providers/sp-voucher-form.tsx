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
  Stack,
  Image as ImageIcon,
  PencilSimpleLine
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inputCls } from "@/components/shared/styles";
import { Switch } from "@/components/shared/switch";
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
import { LogoUpload } from "@/components/shared/logo-upload";
import { ItemSection } from "@/components/shared/item-section";
import type { SpVoucher } from "@/types/provider";

interface SpVoucherFormProps {
  spId: string;
  spServiceCategories: string[];
  spBranches: { id: string; name: string }[];
  voucher?: SpVoucher;
  isReadOnly?: boolean;
  onEdit?: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpVoucherForm({
  spId,
  spServiceCategories,
  spBranches,
  voucher,
  isReadOnly = false,
  onEdit,
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
      bookingRequired: voucher?.bookingRequired || false,
      displayLocation: voucher?.displayLocation || { line: "" },
      photo: voucher?.photo || "",
      serviceLines: (voucher?.serviceLines as any) || [
        { service: "", subServices: [], description: "", descriptionList: "" }
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
      membershipStartDay: voucher?.membershipStartDay || "none",
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

  const selectCls = () => cn(inputCls(), "appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10");

  if (isSuccess) {
    return (
      <div className="bg-card rounded-lg border border-border py-20 animate-in zoom-in-95 duration-300">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-heading font-semibold text-foreground text-balance">
              {isReadOnly ? "Voucher Details" : (isEditing ? "Edit Voucher" : "Add Voucher")}
            </h2>
            <p className="text-body text-subtle mt-1">
              {isReadOnly 
                ? "Review the pricing and configuration details for this voucher."
                : (isEditing 
                  ? "Update pricing, service lines, and activation periods for this voucher."
                  : "Create a new voucher entry for services purchasable on the marketplace.")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isReadOnly ? (
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={onEdit}
              className="text-body font-semibold rounded-full gap-2 transition-all px-6 h-10 border border-border/60"
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Voucher
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={onCancel} 
                disabled={isSubmitting || isPublishing}
                className="text-muted-foreground font-semibold hover:text-foreground hover:bg-muted h-10 px-5"
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
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          <DetailSection 
            title="Voucher Details" 
            icon={<Ticket size={18} weight="duotone" />}
            description="Basic transparency and description seen by your users"
          >
            <div className="space-y-5 p-1">
              {isEditing && (
                <div className="space-y-1.5">
                  <label className="text-label font-semibold text-faint">Voucher code</label>
                  <div className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-body font-mono text-faint cursor-not-allowed">
                    {voucher?.code}
                  </div>
                  <p className="text-label text-faint italic">Auto-generated format. Cannot be changed.</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-label font-semibold text-faint">
                  Voucher name <span className="text-destructive">*</span>
                </label>
                <input 
                  {...register("name")} 
                  className={inputCls(!!errors.name)} 
                  placeholder="e.g. Monthly Yoga Pass" 
                  disabled={isReadOnly}
                />
                {errors.name && <FieldError msg={errors.name.message} />}
              </div>
              <div className="space-y-1.5">
                <label className="text-label font-semibold text-faint">Description</label>
                <textarea 
                  {...register("description")} 
                  rows={4} 
                  className={cn(inputCls(), "resize-none bg-muted/10")} 
                  placeholder="Detailed breakdown of what's included..." 
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="space-y-0.5">
                  <p className="text-body font-semibold text-foreground">Booking Required</p>
                  <p className="text-label text-faint">Enable this if members must book a slot before redemption.</p>
                </div>
                <Switch 
                  checked={watch("bookingRequired")} 
                  onCheckedChange={(v) => setValue("bookingRequired", v)} 
                  disabled={isReadOnly}
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
                  <ItemSection
                    key={field.id}
                    index={i + 1}
                    label="Service Line Item"
                    onRemove={serviceLineFields.length > 1 ? () => removeLine(i) : undefined}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-label font-medium text-faint">Service</label>
                        <SectionedSearchSelect
                          taxonomy={SERVICE_TAXONOMY.filter(cat => spServiceCategories.includes(cat.category))}
                          value={watch(`serviceLines.${i}.service`)}
                          onChange={(val) => {
                            if (isReadOnly) return;
                            setValue(`serviceLines.${i}.service`, val);
                            setValue(`serviceLines.${i}.subServices`, []);
                          }}
                          placeholder="Search service..."
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label font-medium text-faint">Sub-services</label>
                        <CustomMultiSelect
                          options={SERVICE_SPEC_TAXONOMY[watch(`serviceLines.${i}.service`)] || []}
                          selected={watch(`serviceLines.${i}.subServices`) || []}
                          onChange={(val) => !isReadOnly && setValue(`serviceLines.${i}.subServices`, val)}
                          placeholder="Select or type custom..."
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-label font-medium text-faint">Voucher features</label>
                        <textarea 
                          {...register(`serviceLines.${i}.descriptionList`)} 
                          rows={3} 
                          className={cn(inputCls(), "resize-none font-mono text-body bg-card")} 
                          placeholder="List features separated by lines, e.g.
• Includes 5 sessions
• Peak hours access
• Valid at KL branches" 
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </ItemSection>
                ))}

                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-border h-14 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all bg-card rounded-lg font-semibold shadow-sm"
                    onClick={() => appendLine({ service: "", subServices: [], description: "", descriptionList: "" })}
                  >
                    <Plus size={18} weight="bold" className="mr-2" /> 
                    <span>Add Service Item</span>
                  </Button>
                )}
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
                  <h4 className="text-body font-semibold text-foreground tracking-tight">Activation period</h4>
                  <p className="text-label text-faint mt-0.5">When is this voucher available for purchase?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePickerField
                    placeholder="Start Date"
                    value={watch("activationPeriod.startDate")}
                    onChange={(v: string) => !isReadOnly && setValue("activationPeriod.startDate", v)}
                    clearable={false}
                    disabled={isReadOnly}
                  />
                  <DatePickerField
                    placeholder="End Date (Optional)"
                    value={watch("activationPeriod.endDate") || ""}
                    onChange={(v: string) => !isReadOnly && setValue("activationPeriod.endDate", v)}
                    clearable
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Redemption Period */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-body font-semibold text-foreground tracking-tight">Redemption period</h4>
                  <p className="text-label text-faint mt-0.5">When can customers use this voucher?</p>
                </div>

                <div className="flex flex-col gap-2">
                  <ChoiceCard
                    title="Relative"
                    description="Valid after purchase."
                    icon={Clock}
                    selected={redemptionMode === "after_purchase"}
                    onSelect={() => !isReadOnly && setValue("redemptionPeriod.mode", "after_purchase")}
                    className="p-3"
                    disabled={isReadOnly}
                  />
                  <ChoiceCard
                    title="Fixed"
                    description="Set expiry date."
                    icon={CalendarBlank}
                    selected={redemptionMode === "exact_date"}
                    onSelect={() => !isReadOnly && setValue("redemptionPeriod.mode", "exact_date")}
                    className="p-3"
                    disabled={isReadOnly}
                  />
                </div>

                {redemptionMode === "after_purchase" && (
                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-2">
                      <label className="text-label font-semibold text-faint">Valid for</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-16 px-3 py-1.5 bg-card border border-border rounded-lg text-body text-center font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                          {...register("redemptionPeriod.value", { valueAsNumber: true })}
                          disabled={isReadOnly}
                        />
                        <select
                          className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                          {...register("redemptionPeriod.unit")}
                          disabled={isReadOnly}
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
                    <label className="text-label font-semibold text-faint block">Expiry date</label>
                    <DatePickerField
                      value={watch("redemptionPeriod.date") || ""}
                      onChange={(v: string) => setValue("redemptionPeriod.date", v)}
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
            title="Display Image" 
            icon={<ImageIcon size={18} weight="duotone" />}
            description="The primary image seen by users on the marketplace"
          >
            <div className="p-1 space-y-4">
              <LogoUpload
                label="Search Result / Hero Image"
                value={watch("photo")}
                onChange={(file) => !isReadOnly && setValue("photo", file)}
                disabled={isReadOnly}
                className="w-full"
              />
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
                    if (isReadOnly) return;
                    setValue("branchScope", "all");
                    setValue("branchIds", []);
                  }}
                  className="p-3"
                  disabled={isReadOnly}
                />
                <ChoiceCard
                  title="Local"
                  description="Selected branches only"
                  icon={MapPin}
                  selected={branchScope === "specific"}
                  onSelect={() => !isReadOnly && setValue("branchScope", "specific")}
                  className="p-3"
                  disabled={isReadOnly}
                />
              </div>

              {branchScope === "specific" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-label font-medium text-faint">Select branches</label>
                  <CustomMultiSelect
                    options={spBranches.map(b => b.name)}
                    selected={watch("branchIds").map(id => spBranches.find(b => b.id === id)?.name || id)}
                    onChange={(names) => {
                      if (isReadOnly) return;
                      const ids = names.map(name => spBranches.find(b => b.name === name)?.id || name);
                      setValue("branchIds", ids);
                    }}
                    placeholder="Search branches..."
                    disabled={isReadOnly}
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
                <label className="text-label font-semibold text-faint">Currency</label>
                <select {...register("currency")} className={selectCls()} disabled={isReadOnly}>
                  {Object.entries(CURRENCIES).map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-label font-semibold text-faint">Initial price</label>
                  <input type="number" step="0.01" {...register("initialPrice", { valueAsNumber: true })} className={cn(inputCls(), "font-mono")} disabled={isReadOnly} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-semibold text-faint">Final price</label>
                  <input type="number" step="0.01" {...register("finalPrice", { valueAsNumber: true })} className={cn(inputCls(!!errors.finalPrice), "font-mono font-semibold text-primary bg-primary/5 border-primary/20")} disabled={isReadOnly} />
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
    <div className="flex items-center gap-1.5 text-rose-500 text-label mt-1 font-medium animate-in fade-in slide-in-from-top-1">
      <WarningCircle size={14} weight="fill" />
      <span>{msg}</span>
    </div>
  );
}
