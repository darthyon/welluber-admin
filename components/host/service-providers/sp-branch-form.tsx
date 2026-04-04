"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, Building, MapPin, Clock, Tag, Users, Plus, Trash, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createBranchSchema, CreateBranchData } from "@/features/providers/schemas";
import { createBranch, updateBranch } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import { DetailSection } from "@/components/shared/detail-section";
import { TwoColumnDetailLayout } from "@/components/shared/two-column-detail-layout";
import { BRANCH_CONTACT_TYPES, OPERATING_DAYS, DEFAULT_OPERATING_HOURS } from "@/features/providers/constants";
import { buildBranchServiceTaxonomy } from "@/features/providers/service-taxonomy";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import type { SpBranch } from "@/types/provider";

interface SpBranchFormProps {
  spId: string;
  serviceCategories: string[]; // SP-level categories to constrain branch service options
  branch?: SpBranch; // if editing
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpBranchForm({ spId, serviceCategories, branch, onSuccess, onCancel }: SpBranchFormProps) {
  const isEditing = !!branch;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(branch?.services ?? []);
  const [customServiceInputs, setCustomServiceInputs] = useState<Record<string, string>>({});

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<CreateBranchData>({
    resolver: zodResolver(createBranchSchema as any),
    defaultValues: {
      name: branch?.name ?? "",
      services: branch?.services ?? [],
      address: branch?.address ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" },
      contacts: branch?.contacts ?? [{ name: "", type: "branch_manager", phone: "", isPublic: false }],
      isActive: branch?.isActive ?? true,
      operatingHours: branch?.operatingHours ?? DEFAULT_OPERATING_HOURS,
      facilities: branch?.facilities ?? [],
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const [facilityInput, setFacilityInput] = useState("");
  const [facilities, setFacilities] = useState<string[]>(branch?.facilities ?? []);

  const addFacility = () => {
    const val = facilityInput.trim();
    if (val && !facilities.includes(val)) {
      const updated = [...facilities, val];
      setFacilities(updated);
      setValue("facilities", updated);
    }
    setFacilityInput("");
  };

  const removeFacility = (i: number) => {
    const updated = facilities.filter((_, idx) => idx !== i);
    setFacilities(updated);
    setValue("facilities", updated);
  };

  const handleServicesChange = (svcs: string[]) => {
    setSelectedServices(svcs);
    setValue("services", svcs);
  };

  const serviceTaxonomy = buildBranchServiceTaxonomy(serviceCategories);

  const toggleService = (service: string) => {
    const next = selectedServices.includes(service)
      ? selectedServices.filter((item) => item !== service)
      : [...selectedServices, service];
    handleServicesChange(next);
  };

  const addCustomService = (category: string) => {
    const raw = customServiceInputs[category]?.trim();
    if (!raw) return;

    const next = selectedServices.includes(raw) ? selectedServices : [...selectedServices, raw];
    handleServicesChange(next);
    setCustomServiceInputs((prev) => ({ ...prev, [category]: "" }));
  };

  const onSubmit = async (data: CreateBranchData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, services: selectedServices, facilities };
      const res = isEditing
        ? await updateBranch(spId, branch!.id, payload)
        : await createBranch(spId, payload);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(onSuccess, 1800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError ? "border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  if (isSuccess) {
    return (
      <div className="py-8 px-4">
        <SuccessCelebration
          title={isEditing ? "Branch Updated" : "Branch Created"}
          message={isEditing ? "Branch details have been saved." : "The new branch has been added."}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <CaretLeft size={16} />
          Back to Branches
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Building size={24} weight="fill" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {isEditing ? "Edit Branch" : "Add New Branch"}
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Configure location, access, and operating details for this branch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting || isSuccess}
              className="text-[13px] font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="text-[13px] font-medium gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditing ? "Save Changes" : "Create Branch"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-card rounded-2xl border border-border py-20 shadow-sm">
          <SuccessCelebration
            title={isEditing ? "Branch Updated" : "Branch Created"}
            message={isEditing ? "Branch details have been saved." : "The new branch has been added."}
          />
        </div>
      ) : (
        <TwoColumnDetailLayout
          sidebar={
            <>
              <DetailSection
                title="Branch Setup Guide"
                icon={<CheckCircle size={18} weight="fill" />}
                description="Quick checklist to keep the branch configuration on track."
              >
                <div className="space-y-3">
                  {[
                    { label: "Basic identity completed", status: !!watch("name") },
                    { label: "Services selected", status: selectedServices.length > 0 },
                    { label: "Administrators added", status: contactFields.length > 0 },
                    { label: "Operating hours configured", status: true },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground">{step.label}</span>
                      <div className={cn("w-2 h-2 rounded-full", step.status ? "bg-emerald-500" : "bg-zinc-200")} />
                    </div>
                  ))}
                </div>
              </DetailSection>

              <div className="rounded-xl border border-border bg-card shadow-sm p-4">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Branch Notes</h4>
                <p className="text-[13px] text-muted-foreground leading-6">
                  Branches inherit the service categories from the parent service provider, but each location can still choose which services it offers and how it runs day to day.
                </p>
              </div>
            </>
          }
        >
          <DetailSection
            title="Branch Identity"
            icon={<Building size={16} weight="fill" />}
            description="Basic identifiers and branch status."
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Branch Name</label>
                <input {...register("name")} className={inputCls(!!errors.name)} placeholder="e.g. Zenith KLCC" />
                {errors.name && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Active</p>
                  <p className="text-[11px] text-muted-foreground">Inactive branches are hidden from the marketplace.</p>
                </div>
                <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Services at this Branch"
            icon={<Tag size={16} weight="fill" />}
            description="Choose from the master service list allowed by the provider's account categories."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 bg-muted border border-border rounded-lg font-medium"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => toggleService(service)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {serviceTaxonomy.map((group) => (
                  <div key={group.category} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-[13px] font-semibold text-foreground">{group.category}</h4>
                        <p className="text-[11px] text-muted-foreground">Masterlist services for this provider category.</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {group.services.length} options
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.services.map((service) => {
                        const isSelected = selectedServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors",
                              isSelected
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                            )}
                          >
                            {service}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={customServiceInputs[group.category] ?? ""}
                        onChange={(e) =>
                          setCustomServiceInputs((prev) => ({ ...prev, [group.category]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomService(group.category);
                          }
                        }}
                        className={cn(inputCls(), "flex-1")}
                        placeholder="Add custom subservice..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-10"
                        onClick={() => addCustomService(group.category)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.services && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <WarningCircle size={12} /> {errors.services.message}
                </p>
              )}
            </div>
          </DetailSection>

          <DetailSection
            title="Location Mapping"
            icon={<MapPin size={16} weight="fill" />}
            description="Address and map coordinates for this branch."
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Street Address</label>
                <input {...register("address.line")} className={inputCls(!!errors.address?.line)} placeholder="Lot 5, Suria KLCC" />
                {errors.address?.line && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.address.line.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["city", "state", "country", "postalCode"] as const).map((field) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-[13px] font-medium text-foreground capitalize">{field === "postalCode" ? "Postal Code" : field}</label>
                    <input {...register(`address.${field}`)} className={inputCls(!!(errors.address as any)?.[field])} />
                    {(errors.address as any)?.[field] && (
                      <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                        <WarningCircle size={12} /> {(errors.address as any)[field].message}
                      </p>
                    )}
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Latitude <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="number" step="any" {...register("address.lat", { valueAsNumber: true })} className={inputCls()} placeholder="e.g. 3.1579" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Longitude <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="number" step="any" {...register("address.lon", { valueAsNumber: true })} className={inputCls()} placeholder="e.g. 101.7123" />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Administrators"
            icon={<Users size={16} weight="fill" />}
            description="Local branch administrators with management access."
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] gap-1"
                onClick={() => appendContact({ name: "", type: "staff", phone: "", isPublic: false })}
              >
                <Plus size={13} /> Add Administrator
              </Button>
            }
          >
            <div className="space-y-3">
              {contactFields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_1fr_auto_auto] gap-3 items-end bg-muted/20 rounded-xl p-3 border border-border/50">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Name</label>
                    <input {...register(`contacts.${i}.name`)} className={inputCls(!!(errors.contacts as any)?.[i]?.name)} placeholder="Administrator name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Role</label>
                    <select {...register(`contacts.${i}.type`)} className={inputCls()}>
                      {BRANCH_CONTACT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Phone</label>
                    <input {...register(`contacts.${i}.phone`)} className={inputCls()} placeholder="+601XXXXXXXX" />
                  </div>
                  <div className="space-y-1 text-center">
                    <label className="text-[11px] font-medium text-muted-foreground block">Public</label>
                    <Switch checked={watch(`contacts.${i}.isPublic`)} onCheckedChange={(v) => setValue(`contacts.${i}.isPublic`, v)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors pb-1.5 justify-self-end"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))}
              {errors.contacts && typeof errors.contacts === "object" && "message" in errors.contacts && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <WarningCircle size={12} /> {(errors.contacts as any).message}
                </p>
              )}
            </div>
          </DetailSection>

          <DetailSection
            title="Operating Hours"
            icon={<Clock size={16} weight="fill" />}
            description="Weekly open and close schedule."
          >
            <div className="space-y-2">
              {OPERATING_DAYS.map(({ key, label }) => {
                const isClosed = watch(`operatingHours.${key}.isClosed`);
                return (
                  <div key={key} className="grid grid-cols-[90px_1fr] md:grid-cols-[100px_1fr_120px_120px] gap-3 items-center py-1.5">
                    <span className="text-[13px] font-medium text-foreground">{label.slice(0, 3)}</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={!isClosed} onCheckedChange={(v) => setValue(`operatingHours.${key}.isClosed`, !v)} />
                      <span className="text-[11px] text-muted-foreground ml-1">{isClosed ? "Closed" : "Open"}</span>
                    </div>
                    {!isClosed && (
                      <>
                        <input type="time" {...register(`operatingHours.${key}.open`)} disabled={isClosed} className={cn(inputCls(), "text-center text-[12px] font-mono")} />
                        <input type="time" {...register(`operatingHours.${key}.close`)} disabled={isClosed} className={cn(inputCls(), "text-center text-[12px] font-mono")} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </DetailSection>

          <DetailSection
            title="Facilities"
            icon={<CheckCircle size={16} weight="fill" />}
            description="Optional amenities available at this branch."
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFacility();
                    }
                  }}
                  className={inputCls()}
                  placeholder="e.g. Free WiFi"
                />
                <Button type="button" variant="outline" size="sm" className="shrink-0 h-10" onClick={addFacility}>
                  <Plus size={14} />
                </Button>
              </div>
              {facilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {facilities.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 bg-muted border border-border rounded-lg font-medium">
                      {f}
                      <button type="button" onClick={() => removeFacility(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </DetailSection>
        </TwoColumnDetailLayout>
      )}
    </form>
  );
}
