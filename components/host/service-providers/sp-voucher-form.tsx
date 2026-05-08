"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  WarningCircle,
  CaretLeft,
  Ticket,
  CalendarBlank,
  ListBullets,
  Buildings,
  CurrencyCircleDollar,
  MapPin,
  Clock,
  Stack,
  Image as ImageIcon,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inputCls } from "@/components/shared/styles";
import { Switch } from "@/components/shared/switch";
import { createVoucherSchema, CreateVoucherData } from "@/features/providers/schemas";
import { createVoucher, updateVoucher, publishVoucher } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { CURRENCIES } from "@/features/providers/constants";
import { SERVICE_TAXONOMY, SERVICE_SPEC_TAXONOMY } from "@/features/organizations/constants";
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select";
import { CustomMultiSelect } from "@/components/shared/custom-multi-select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { LogoUpload } from "@/components/shared/logo-upload";
import { ItemSection } from "@/components/shared/item-section";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import type { SpVoucher } from "@/types/provider";

const ANCHOR_ITEMS = [
  { id: "voucher-details", label: "Voucher Details" },
  { id: "commercials", label: "Commercials" },
  { id: "service-lines", label: "Service Line Items" },
  { id: "lifecycle", label: "Lifecycle & Validity" },
  { id: "branch-assignment", label: "Branch Assignment" },
  { id: "display-image", label: "Display Image" },
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

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting: formIsSubmitting } } = useForm<CreateVoucherData>({
    resolver: zodResolver(createVoucherSchema as any),
    defaultValues: {
      name: voucher?.name || "",
      description: voucher?.description || "",
      bookingRequired: voucher?.bookingRequired || false,
      displayLocation: voucher?.displayLocation || { line: "" },
      photo: voucher?.photo || "",
      serviceLines: (voucher?.serviceLines as any) || [
        { service: "", subServices: [], description: "", descriptionList: "" },
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

  const selectCls = () =>
    cn(inputCls(), "appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10");

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
            {/* Voucher Details */}
            <div id="voucher-details" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Ticket size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Voucher Details</h3>
                </div>

                <div className="space-y-5">
                  {isEditing && (
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">Voucher Code</label>
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

                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">Display Location</label>
                    <input
                      {...register("displayLocation.line")}
                      className={cn(
                        "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                        "border-border focus:border-foreground/30 focus:bg-muted/30"
                      )}
                      placeholder="e.g. KLCC Branch, Level 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Commercials */}
            <div id="commercials" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20">
                    <CurrencyCircleDollar size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Commercials</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-body font-medium text-foreground">Currency</label>
                    <select {...register("currency")} className={selectCls()}>
                      {Object.entries(CURRENCIES).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">Initial Price</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("initialPrice", { valueAsNumber: true })}
                        className={cn(
                          "w-full px-3 py-2 bg-background border rounded-md text-body font-mono outline-none transition-colors",
                          "border-border focus:border-foreground/30 focus:bg-muted/30"
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-body font-medium text-foreground">Final Price</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("finalPrice", { valueAsNumber: true })}
                        className={cn(
                          "w-full px-3 py-2 bg-background border rounded-md text-body font-mono font-semibold outline-none transition-colors",
                          errors.finalPrice
                            ? "border-destructive ring-1 ring-destructive/20"
                            : "border-primary/20 focus:border-primary/30 bg-primary/5"
                        )}
                      />
                      {errors.finalPrice && (
                        <p className="text-label text-destructive flex items-center gap-1 mt-1">
                          <WarningCircle size={12} /> {errors.finalPrice.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Line Items */}
            <div id="service-lines" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 dark:bg-amber-500/20">
                    <ListBullets size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Service Line Items</h3>
                    <p className="text-label text-muted-foreground">Specific services included in this voucher package.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {(errors.serviceLines as any)?.message && (
                    <p className="text-label text-destructive flex items-center gap-1">
                      <WarningCircle size={12} /> {(errors.serviceLines as any).message}
                    </p>
                  )}

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
                        appendLine({ service: "", subServices: [], description: "", descriptionList: "" })
                      }
                    >
                      <Plus size={18} weight="bold" className="mr-2" />
                      <span>Add Service Item</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifecycle & Validity */}
            <div id="lifecycle" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Stack size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Lifecycle & Validity</h3>
                </div>

                <div className="space-y-8">
                  {/* Activation Period */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-body font-semibold text-foreground">Activation Period</h4>
                      <p className="text-label text-muted-foreground mt-0.5">When is this voucher available for purchase?</p>
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
                          <label className="text-label font-medium text-subtle">Valid For</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-16 px-3 py-1.5 bg-background border border-border rounded-md text-body text-center font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                              {...register("redemptionPeriod.value", { valueAsNumber: true })}
                            />
                            <select
                              className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
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
                    <select
                      {...register("membershipStartDay")}
                      className={selectCls()}
                    >
                      <option value="none">None (immediate)</option>
                      <option value="1st">1st of the month</option>
                      <option value="15th">15th of the month</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Assignment */}
            <div id="branch-assignment" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Branch Assignment</h3>
                    <p className="text-label text-muted-foreground">Which locations accept this voucher?</p>
                  </div>
                </div>

                <div className="space-y-5">
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
                      <label className="text-label font-medium text-subtle">Select Branches</label>
                      <CustomMultiSelect
                        options={spBranches.map((b) => b.name)}
                        selected={watch("branchIds").map(
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
                      {(errors as any).branchIds && (
                        <p className="text-label text-destructive flex items-center gap-1 mt-1">
                          <WarningCircle size={12} /> {(errors as any).branchIds.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display Image */}
            <div id="display-image" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ImageIcon size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Display Image</h3>
                    <p className="text-label text-muted-foreground">The primary image seen by users on the marketplace.</p>
                  </div>
                </div>

                <div className="space-y-4">
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
