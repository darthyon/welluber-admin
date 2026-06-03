"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  WarningCircle,
  CaretLeft,
  Ticket,
  CalendarBlank,
  ListBullets,
  Buildings,
  MapPin,
  Clock,
  Stack,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/shared/switch";
import { createVoucherSchema } from "@/features/providers/schemas";
import { createVoucher, updateVoucher, publishVoucher } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { SERVICE_TAXONOMY, SERVICE_SPEC_TAXONOMY } from "@/features/organizations/constants";
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select";
import { CustomMultiSelect } from "@/components/shared/custom-multi-select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { LogoUpload } from "@/components/shared/logo-upload";
import { FormSelect } from "@/components/shared/form-select";
import { ItemSection } from "@/components/shared/item-section";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import type { SpVoucher } from "@/types/provider";

const ANCHOR_ITEMS = [
  { id: "details", label: "Details" },
  { id: "voucher-configuration", label: "Voucher Configuration" },
  { id: "manage-services", label: "Manage Services" },
];

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

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting: formIsSubmitting } } = useForm<z.input<typeof createVoucherSchema>>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      name: voucher?.name || "",
      description: voucher?.description || "",
      bookingRequired: voucher?.bookingRequired || false,
      displayLocation: voucher?.displayLocation || { line: "" },
      photo: voucher?.photo || "",
      serviceLines: voucher?.serviceLines || [
        { service: "", subServices: [], description: "", descriptionList: "", price: 0 },
      ],
      currency: voucher?.currency || "MYR",
      initialPrice: voucher?.initialPrice || 0,
      discount: voucher?.discount || { type: "amount", value: 0 },
      finalPrice: voucher?.finalPrice || 0,
      voucherCount: voucher?.voucherCount,
      maxUsagePerUser: voucher?.maxUsagePerUser ?? 1,
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
  const redemptionMode = watch("redemptionPeriod.mode");
  const branchScope = watch("branchScope");
  const currency = watch("currency");

  // Subtotal = sum of each service's price. One overall discount (amount or %)
  // is applied to the subtotal to give the Final Price, rounded to a whole number.
  const serviceLinesWatch = useWatch({ control, name: "serviceLines" });
  const discountType = useWatch({ control, name: "discount.type" });
  const discountValue = Number(useWatch({ control, name: "discount.value" })) || 0;
  const subtotal = useMemo(
    () => (serviceLinesWatch || []).reduce((sum, l) => sum + (Number(l?.price) || 0), 0),
    [serviceLinesWatch]
  );
  const finalPrice = useMemo(() => {
    const raw =
      discountType === "percent"
        ? subtotal * (1 - discountValue / 100)
        : subtotal - discountValue;
    return Math.max(0, Math.round(raw));
  }, [subtotal, discountType, discountValue]);

  useEffect(() => {
    setValue("initialPrice", subtotal);
    setValue("finalPrice", finalPrice);
  }, [subtotal, finalPrice, setValue]);

  const onSave = async (data: z.input<typeof createVoucherSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = createVoucherSchema.parse(data);
      const res = isEditing
        ? await updateVoucher(spId, voucher!.id, payload)
        : await createVoucher(spId, payload);
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
    <form
      onSubmit={handleSubmit(onSave)}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Back + Title */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
        >
          <CaretLeft size={16} />
          Back to Voucher Package
        </button>

        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">
            {isEditing ? "Edit Voucher Package" : "Add Voucher Package"}
          </h1>
          <p className="text-subtle text-body mt-1">
            {isEditing
              ? "Update pricing, service lines, and activation periods for this voucher package."
              : "Create a new voucher package for services purchasable on the marketplace."}
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Details */}
            <div id="details" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Ticket size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Details</h3>
                </div>

                <div className="space-y-5">
                  {/* Branch — chosen first; its account wallet sets the currency that scopes line-item pricing. */}
                  <div className="space-y-3">
                    <label className="text-body font-medium text-foreground">Branch Assignment</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ChoiceCard
                        title="All Branches"
                        description=""
                        icon={Buildings}
                        selected={branchScope === "all"}
                        onSelect={() => {
                          setValue("branchScope", "all");
                          setValue("branchIds", []);
                        }}
                        className="p-3"
                      />
                      <ChoiceCard
                        title="Specific Branches"
                        description=""
                        icon={MapPin}
                        selected={branchScope === "specific"}
                        onSelect={() => setValue("branchScope", "specific")}
                        className="p-3"
                      />
                    </div>
                    {branchScope === "specific" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-label font-medium text-subtle">Select Branches</label>
                        <CustomMultiSelect
                          options={spBranches.map((b) => b.name)}
                          selected={(watch("branchIds") ?? []).map(
                            (id) => spBranches.find((b) => b.id === id)?.name || id
                          )}
                          onChange={(names) => {
                            const ids = names.map(
                              (name) => spBranches.find((b) => b.name === name)?.id || name
                            );
                            setValue("branchIds", ids);
                          }}
                          placeholder="Search branches..."
                        />
                        {errors.branchIds && (
                          <p className="text-label text-destructive flex items-center gap-1 mt-1">
                            <WarningCircle size={12} /> {errors.branchIds.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Currency — locked to the branch account wallet (MYR for v1). */}
                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">Currency</label>
                    <div className="flex items-center gap-3 w-full px-3 py-2 bg-muted/20 border border-border rounded-md text-body">
                      <span className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center text-label font-medium text-muted-foreground">{currency || "MYR"}</span>
                      <span className="text-foreground font-medium whitespace-nowrap">Malaysian Ringgit (RM)</span>
                      <span className="ml-auto text-label text-faint font-medium">From branch account · Locked</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">Package ID</label>
                      <div className="w-full px-3 py-2 bg-muted/10 border border-border rounded-md text-body font-mono text-faint cursor-not-allowed">
                        {voucher?.code}
                      </div>
                      <p className="text-label text-faint italic">Auto-generated format. Cannot be changed.</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">
                      Voucher Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className={cn(
                        "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                        errors.name
                          ? "border-destructive ring-1 ring-destructive/20"
                          : "border-border focus:border-foreground/30 focus:bg-muted/30"
                      )}
                      placeholder="e.g. Monthly Yoga Pass"
                    />
                    {errors.name && (
                      <p className="text-label text-destructive flex items-center gap-1 mt-1">
                        <WarningCircle size={12} /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">Description</label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={cn(
                        "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors resize-none",
                        "border-border focus:border-foreground/30 focus:bg-muted/30"
                      )}
                      placeholder="Detailed breakdown of what's included..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="space-y-0.5">
                      <p className="text-body font-semibold text-foreground">Booking Required</p>
                      <p className="text-label text-faint">Enable this if members must book a slot before redemption.</p>
                    </div>
                    <Switch checked={watch("bookingRequired")} onCheckedChange={(v) => setValue("bookingRequired", v)} />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <p className="text-body font-semibold text-foreground">Display Image</p>
                      <p className="text-label text-muted-foreground">The primary image seen by users on the marketplace.</p>
                    </div>
                    <LogoUpload
                      label="Search Result / Hero Image"
                      value={watch("photo")}
                      onChange={(file) => setValue("photo", file)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Configuration */}
            <div id="voucher-configuration" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Stack size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Voucher Configuration</h3>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">No. of Vouchers</label>
                      <input
                        type="number"
                        min={0}
                        {...register("voucherCount", { valueAsNumber: true })}
                        className={cn(
                          "w-full px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors",
                          "border-border focus:border-foreground/30 focus:bg-muted/30"
                        )}
                        placeholder="e.g. 500"
                      />
                      <p className="text-label text-faint">How many vouchers to generate for this package.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">Max Distribution Per User</label>
                      <input
                        type="number"
                        min={1}
                        {...register("maxUsagePerUser", { valueAsNumber: true })}
                        className={cn(
                          "w-full px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors",
                          "border-border focus:border-foreground/30 focus:bg-muted/30"
                        )}
                        placeholder="e.g. 5"
                      />
                      <p className="text-label text-faint">How many times each member can redeem this voucher.</p>
                    </div>
                  </div>

                  {/* Listing Period */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-body font-semibold text-foreground">Listing Period</h4>
                      <p className="text-label text-muted-foreground mt-0.5">Validity start–end shown on the member app.</p>
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

                  <div className="h-px bg-border/40" />

                  {/* Redemption Period */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-body font-semibold text-foreground">Redemption Period</h4>
                      <p className="text-label text-muted-foreground mt-0.5">When can customers use this voucher?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          <label className="text-label font-medium text-subtle">Valid For</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-16 px-3 py-1.5 bg-background border border-border rounded-md text-body text-center font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                              {...register("redemptionPeriod.value", { valueAsNumber: true })}
                            />
                            <FormSelect
                              value={watch("redemptionPeriod.unit")}
                              onChange={(v) => setValue("redemptionPeriod.unit", v as "hr" | "day" | "month")}
                              options={[
                                { label: "Hours", value: "hr" },
                                { label: "Days", value: "day" },
                                { label: "Months", value: "month" },
                              ]}
                              triggerClassName="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {redemptionMode === "exact_date" && (
                      <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-label font-medium text-subtle block">Expiry Date</label>
                        <DatePickerField
                          value={watch("redemptionPeriod.date") || ""}
                          onChange={(v: string) => setValue("redemptionPeriod.date", v)}
                          clearable
                        />
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-border/40" />

                  {/* Membership Start Day */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-body font-semibold text-foreground">Membership Start Day</h4>
                      <p className="text-label text-muted-foreground mt-0.5">When do membership periods begin?</p>
                    </div>
                    <FormSelect
                      value={watch("membershipStartDay")}
                      onChange={(v) => setValue("membershipStartDay", v as "none" | "1st" | "15th")}
                      options={[
                        { label: "None (immediate)", value: "none" },
                        { label: "1st of the month", value: "1st" },
                        { label: "15th of the month", value: "15th" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Manage Services */}
            <div id="manage-services" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 dark:bg-amber-500/20">
                    <ListBullets size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Manage Services</h3>
                    <p className="text-label text-muted-foreground">Add the services included in this voucher and set a price for each.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {errors.serviceLines && "message" in errors.serviceLines && (
                    <p className="text-label text-destructive flex items-center gap-1">
                      <WarningCircle size={12} /> {String(errors.serviceLines.message)}
                    </p>
                  )}

                  <div className="space-y-4">
                    {serviceLineFields.map((field, i) => (
                      <ItemSection
                        key={field.id}
                        index={i + 1}
                        label="Service"
                        onRemove={serviceLineFields.length > 1 ? () => removeLine(i) : undefined}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-label font-medium text-subtle">Service</label>
                            <SectionedSearchSelect
                              taxonomy={SERVICE_TAXONOMY.filter((cat) =>
                                spServiceCategories.includes(cat.category)
                              )}
                              value={watch(`serviceLines.${i}.service`)}
                              onChange={(val) => {
                                setValue(`serviceLines.${i}.service`, val);
                                setValue(`serviceLines.${i}.subServices`, []);
                              }}
                              placeholder="Search service..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-label font-medium text-subtle">Sub-services</label>
                            <CustomMultiSelect
                              options={SERVICE_SPEC_TAXONOMY[watch(`serviceLines.${i}.service`)] || []}
                              selected={watch(`serviceLines.${i}.subServices`) || []}
                              onChange={(val) => setValue(`serviceLines.${i}.subServices`, val)}
                              placeholder="Select or type custom..."
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-label font-medium text-subtle">Price ({currency || "MYR"})</label>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              {...register(`serviceLines.${i}.price`, { valueAsNumber: true })}
                              className={cn(
                                "w-full px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors",
                                "border-border focus:border-foreground/30 focus:bg-muted/30"
                              )}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-label font-medium text-subtle">Voucher Features</label>
                            <textarea
                              {...register(`serviceLines.${i}.descriptionList`)}
                              rows={3}
                              className={cn(
                                "w-full px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors resize-none",
                                "border-border focus:border-foreground/30 focus:bg-muted/30"
                              )}
                              placeholder={`List features separated by lines, e.g.
\u2022 Includes 5 sessions
\u2022 Peak hours access
\u2022 Valid at KL branches`}
                            />
                          </div>
                        </div>
                      </ItemSection>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-border h-14 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all bg-card rounded-lg font-semibold shadow-sm"
                      onClick={() =>
                        appendLine({ service: "", subServices: [], description: "", descriptionList: "", price: 0 })
                      }
                    >
                      <Plus size={18} weight="bold" className="mr-2" />
                      <span>Add Service</span>
                    </Button>
                  </div>

                  {/* Pricing summary — catalogue-style: subtotal of services, one overall discount, final price */}
                  <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-body text-subtle">Subtotal</p>
                      <p className="text-body font-medium text-foreground font-mono tabular-nums">
                        {currency || "MYR"} {subtotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <p className="text-body text-subtle shrink-0">Overall Discount</p>
                      <div className="flex items-stretch gap-2 max-w-[260px] w-full">
                        <FormSelect
                          value={discountType}
                          onChange={(v) => setValue("discount.type", v as "amount" | "percent")}
                          options={[
                            { label: "Amount", value: "amount" },
                            { label: "%", value: "percent" },
                          ]}
                          triggerClassName="w-28 shrink-0"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          {...register("discount.value", { valueAsNumber: true })}
                          className={cn(
                            "flex-1 min-w-0 px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors text-right",
                            "border-border focus:border-foreground/30 focus:bg-muted/30"
                          )}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-4 bg-primary/5">
                      <p className="text-body font-semibold text-foreground">Final Price</p>
                      <p className="text-heading font-semibold text-primary font-mono tabular-nums">
                        {currency || "MYR"} {finalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
        {isEditing && voucher?.status === "draft" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onPublish}
              disabled={isSubmitting || isPublishing || formIsSubmitting}
              className="text-body font-semibold px-6 text-primary"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              ) : null}
              Publish
            </Button>
            <div className="w-px h-6 bg-border/40" />
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onCancel}
          className="text-body font-semibold px-6"
        >
          Cancel
        </Button>
        <div className="w-px h-6 bg-border/40" />
        <Button
          type="submit"
          disabled={isSubmitting || formIsSubmitting}
          size="lg"
          className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting || formIsSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              {isEditing ? "Save Changes" : "Add Voucher"}
              <PaperPlaneTilt size={14} weight="bold" />
            </>
          )}
        </Button>
      </div>

      {/* Spacer to allow last sections to scroll to top */}
      <div className="h-64" />
    </form>
  );
}
