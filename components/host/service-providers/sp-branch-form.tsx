"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, Building, MapPin, Clock, Tag, Users, Plus, Trash, WarningCircle, CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createBranchSchema, CreateBranchData } from "@/features/providers/schemas";
import { createBranch, updateBranch } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import { DetailSection } from "@/components/shared/detail-section";
import { TwoColumnDetailLayout } from "@/components/shared/two-column-detail-layout";
import { BRANCH_CONTACT_TYPES, OPERATING_DAYS, DEFAULT_OPERATING_HOURS } from "@/features/providers/constants";
import { buildBranchServiceCatalog } from "@/features/providers/service-taxonomy";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { LocationPicker } from "@/components/shared/location-picker";
import { ServiceToggleCard } from "@/components/shared/service-toggle-card";
import { ItemSection } from "@/components/shared/item-section";
import type { SpBranch, ServiceLine, CommissionSchemaRow } from "@/types/provider";

interface SpBranchFormProps {
  spId: string;
  serviceCategories: string[]; // SP-level categories for grouping
  portfolio: CommissionSchemaRow[]; // The defined service portfolio
  branch?: SpBranch; // if editing
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpBranchForm({ spId, serviceCategories, portfolio, branch, onSuccess, onCancel }: SpBranchFormProps) {
  const isEditing = !!branch;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customServiceInputs, setCustomServiceInputs] = useState<Record<string, string>>({});

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<CreateBranchData>({
    resolver: zodResolver(createBranchSchema as any),
    defaultValues: {
      name: branch?.name ?? "",
      services: (branch?.services as any) ?? [],
      address: branch?.address ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" },
      contacts: branch?.contacts ?? [{ name: "", type: "branch_manager", phone: "", isPublic: true }],
      administrators: branch?.administrators ?? [{ name: "", email: "", role: "Administrator", designateAsPic: false }],
      isActive: branch?.isActive ?? true,
      operatingHours: branch?.operatingHours ?? DEFAULT_OPERATING_HOURS,
      benefits: (branch as any)?.benefits ?? (branch as any)?.facilities ?? [],
    },
  });

  const selectedServices = watch("services") || [];

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const { fields: adminFields, append: appendAdmin, remove: removeAdmin } = useFieldArray({
    control,
    name: "administrators",
  });

  const [benefitInput, setBenefitInput] = useState("");
  const [benefits, setBenefits] = useState<string[]>((branch as any)?.benefits ?? (branch as any)?.facilities ?? []);

  const addBenefit = () => {
    const val = benefitInput.trim();
    if (val && !benefits.includes(val)) {
      const updated = [...benefits, val];
      setBenefits(updated);
      setValue("benefits", updated);
    }
    setBenefitInput("");
  };

  const removeBenefit = (i: number) => {
    const updated = benefits.filter((_, idx) => idx !== i);
    setBenefits(updated);
    setValue("benefits", updated);
  };

  // Sync logic: When an administrator is designated as PIC, ensure they exist in the contacts list
  const watchedAdmins = watch("administrators") || [];
  const watchedContacts = watch("contacts") || [];

  const handleAdminPicSync = (index: number, isPic: boolean) => {
    const admin = watchedAdmins[index];
    if (isPic) {
      const alreadyExists = watchedContacts.some(c => c.email === admin.email);
      if (!alreadyExists && admin.email && admin.name) {
        appendContact({
          name: admin.name,
          email: admin.email,
          type: "branch_manager",
          phone: "",
          isPublic: true
        });
      }
    } else {
      // If unchecked, optionally remove or just let it stay. User didn't specify removal logic, 
      // but "separate admin and pic" usually implies manual cleanup or one-way sync.
      // I'll leave it for now to avoid accidental data loss.
    }
  };

  const serviceCatalog = useMemo(() => {
    const fullCatalog = buildBranchServiceCatalog(serviceCategories);
    const portfolioServiceNames = portfolio.map((r) => r.mainService);
    
    // Filter the catalog to only include Main Services in the portfolio
    return fullCatalog.map(category => ({
      ...category,
      services: category.services.filter(s => portfolioServiceNames.includes(s.name))
    })).filter(category => category.services.length > 0);
  }, [serviceCategories, portfolio]);

  const onSubmit = async (data: CreateBranchData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, benefits };
      const res = isEditing
        ? await updateBranch(spId, branch!.id, payload as any)
        : await createBranch(spId, payload as any);
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
                title="Setup Progress"
                icon={<CheckCircle size={18} weight="fill" />}
                description="Status of essential branch details."
              >
                <div className="space-y-3">
                  {[
                    { label: "Branch identity set", status: !!watch("name") },
                    { label: "Services configured", status: selectedServices.length > 0 },
                    { label: "PICs added", status: contactFields.length > 0 },
                    { label: "Operating hours set", status: true },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground">{step.label}</span>
                      <div className={cn("w-2 h-2 rounded-full", step.status ? "bg-emerald-500" : "bg-muted")} title={step.status ? "Completed" : "Pending"} />
                    </div>
                  ))}
                </div>
              </DetailSection>
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
            description="Select the services offered at this location and manage specific sub-types."
          >
            <div className="space-y-6">
              <div className="space-y-8">
                {(serviceCatalog as any[]).map((group: any) => (
                  <div key={group.category} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-[12px] font-bold text-muted-foreground tracking-wider">{group.category}</h4>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {group.services.filter((s: any) => selectedServices.some(ls => ls.service === s.name)).length} Main Services
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {group.services.map((service: any) => {
                        const line = selectedServices.find(ls => ls.service === service.name);
                        const isSelected = !!line;

                        return (
                          <ServiceToggleCard
                            key={service.name}
                            name={service.name}
                            isSelected={isSelected}
                            onToggle={(checked) => {
                              if (!checked) {
                                setValue("services", selectedServices.filter(ls => ls.service !== service.name));
                              } else {
                                setValue("services", [...selectedServices, { service: service.name, subServices: service.subServices }]);
                              }
                            }}
                            selectedSubServices={line?.subServices || []}
                            masterlistSubServices={service.subServices}
                            onAddSubService={(val) => {
                              if (line && !line.subServices.includes(val)) {
                                setValue("services", selectedServices.map(ls => 
                                  ls.service === service.name ? { ...ls, subServices: [...ls.subServices, val] } : ls
                                ));
                                setCustomServiceInputs(prev => ({ ...prev, [service.name]: "" }));
                              }
                            }}
                            onRemoveSubService={(val) => {
                              if (line) {
                                setValue("services", selectedServices.map(ls => 
                                  ls.service === service.name ? { ...ls, subServices: ls.subServices.filter(s => s !== val) } : ls
                                ));
                              }
                            }}
                            placeholder={`Add custom ${service.name} sub-service...`}
                          />
                        );
                      })}
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
            <div className="p-1">
              <LocationPicker 
                value={watch("address")}
                onChange={(val) => setValue("address", val as any, { shouldValidate: true })}
                errors={errors.address}
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Branch Governance"
            icon={<Users size={16} weight="fill" />}
            description="Local administrators with branch management access."
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] gap-1"
                onClick={() => appendAdmin({ name: "", email: "", role: "Administrator", designateAsPic: false })}
              >
                <Plus size={13} /> Add Administrator
              </Button>
            }
          >
            <div className="space-y-4">
              {adminFields.map((field, i) => (
                <ItemSection
                  key={field.id}
                  index={i + 1}
                  label="Branch Administrator"
                  onRemove={() => removeAdmin(i)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Name</label>
                      <input {...register(`administrators.${i}.name`)} className={inputCls(!!(errors.administrators as any)?.[i]?.name)} placeholder="Full name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Corporate Email</label>
                      <input type="email" {...register(`administrators.${i}.email`)} className={inputCls(!!(errors.administrators as any)?.[i]?.email)} placeholder="name@company.com" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={watch(`administrators.${i}.designateAsPic`)} 
                          onCheckedChange={(v) => {
                            setValue(`administrators.${i}.designateAsPic`, v);
                            handleAdminPicSync(i, v);
                          }} 
                        />
                        <span className="text-[12px] font-medium text-foreground">Designate as PIC</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 gap-2 text-[12px] font-bold border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all rounded-full"
                      onClick={() => console.log("Invite sent to", watch(`administrators.${i}.email`))}
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      Send Invite
                    </Button>
                  </div>
                </ItemSection>
              ))}
              {errors.administrators && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <WarningCircle size={12} /> {(errors.administrators as any).message}
                </p>
              )}
            </div>
          </DetailSection>

          <DetailSection
            title="Persons In Charge (PIC)"
            icon={<Users size={16} weight="fill" />}
            description="Public-facing contact persons for this branch."
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] gap-1"
                onClick={() => appendContact({ name: "", email: "", type: "staff", phone: "", isPublic: true })}
              >
                <Plus size={13} /> Add PIC
              </Button>
            }
          >
            <div className="space-y-4">
              {contactFields.map((field, i) => (
                <ItemSection
                  key={field.id}
                  index={i + 1}
                  label="Branch PIC"
                  onRemove={() => removeContact(i)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Name</label>
                      <input {...register(`contacts.${i}.name`)} className={inputCls(!!(errors.contacts as any)?.[i]?.name)} placeholder="Full name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Corporate Email</label>
                      <input type="email" {...register(`contacts.${i}.email`)} className={inputCls(!!(errors.contacts as any)?.[i]?.email)} placeholder="name@company.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Job Role</label>
                      <select {...register(`contacts.${i}.type`)} className={cn(inputCls(), "appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10")}>
                        {BRANCH_CONTACT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground tracking-tight">Phone</label>
                      <input {...register(`contacts.${i}.phone`)} className={inputCls()} placeholder="+601XXXXXXXX" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={watch(`contacts.${i}.isPublic`)} onCheckedChange={(v) => setValue(`contacts.${i}.isPublic`, v)} />
                        <span className="text-[12px] font-medium text-foreground">Public profile</span>
                      </div>
                    </div>
                  </div>
                </ItemSection>
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
            title="Benefits"
            icon={<CheckCircle size={16} weight="fill" />}
            description="Optional amenities and benefits available at this branch."
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  className={inputCls()}
                  placeholder="e.g. Free WiFi"
                />
                <Button type="button" variant="outline" size="sm" className="shrink-0 h-10" onClick={addBenefit}>
                  <Plus size={14} />
                </Button>
              </div>
              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 bg-muted border border-border rounded-lg font-medium">
                      {f}
                      <button type="button" onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive transition-colors">
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
