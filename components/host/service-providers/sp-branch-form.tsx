"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { SuccessModal } from "@/components/shared/success-modal";
import { LocationPicker } from "@/components/shared/location-picker";
import { ServiceToggleCard } from "@/components/shared/service-toggle-card";
import { PhoneInput } from "@/components/shared/phone-input";
import type { SpBranch, ServiceLine, CommissionSchemaRow } from "@/types/provider";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { toast } from "sonner";

const ANCHOR_ITEMS = [
  { id: "branch-identity", label: "Branch Identity" },
  { id: "location-mapping", label: "Location Mapping" },
  { id: "service-catalog", label: "Service Catalogue" },
  { id: "governance", label: "Governance" },
  { id: "operating-hours", label: "Operating Hours" },
  { id: "benefits", label: "Benefits" },
];

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [benefits, setBenefits] = useState<string[]>(branch?.benefits ?? (branch as any)?.facilities ?? []);
  const [benefitInput, setBenefitInput] = useState("");
  const [hasAdminChanges, setHasAdminChanges] = useState(false);
  const [customServiceInputs, setCustomServiceInputs] = useState<Record<string, string>>({});

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, dirtyFields, isSubmitting } } = useForm<CreateBranchData>({
    resolver: zodResolver(createBranchSchema as any),
    defaultValues: {
      name: branch?.name ?? "",
      services: (branch?.services as any) ?? [],
      address: branch?.address ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" },
      contacts: branch?.contacts ?? [{ name: "", email: "", type: "branch_manager", phone: "", isPublic: true }],
      administrators: branch?.administrators ?? [],
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
    // Determine if admins changed or were added
    const adminsChanged = !!dirtyFields.administrators;
    setHasAdminChanges(adminsChanged);

    try {
      const payload = { ...data, benefits };
      const res = isEditing
        ? await updateBranch(spId, branch!.id, payload as any)
        : await createBranch(spId, payload as any);
      
      if (res.success) {
        if (isEditing) {
          const msg = adminsChanged 
            ? "Branch updated. New invitations sent to administrators." 
            : "Branch details updated successfully";
          toast.success(msg);
          onSuccess();
        } else {
          setIsSuccess(true);
        }
      } else {
        toast.error((res as any).message || "Failed to save branch. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
      hasError ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  if (isSuccess && !isEditing) {
    const adminMsg = "Invitation emails have been dispatched to the local administrators.";
    return (
      <SuccessModal
        isOpen={isSuccess}
        onClose={onCancel}
        title="Branch Registered"
        message={`New location is now operational. ${adminMsg}`}
        primaryAction={{
          label: "Add Another Branch",
          onClick: () => {
            setIsSuccess(false);
            reset();
            setBenefits([]);
            setBenefitInput("");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        secondaryAction={{
          label: "View Branch List",
          onClick: onSuccess
        }}
      />
    );
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error("Validation Errors:", errors);
        const errorFields = Object.keys(errors);
        toast.error(`Form incomplete: Missing or invalid data in ${errorFields.join(", ")}.`);
      })} 
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-nav font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <CaretLeft size={16} />
          Back to Branches
        </button>
        
        <div>
          <h1 className="text-heading font-semibold tracking-tight text-foreground">
            {isEditing ? "Edit Branch" : "Add New Branch"}
          </h1>
          <p className="text-muted-foreground text-nav mt-1">Configure location, access, and operating details.</p>
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
            {/* Branch Identity */}
            <div id="branch-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building size={16} weight="fill" />
                  </div>
                  <h3 className="text-subtitle font-semibold text-foreground">Branch Identity</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-nav font-semibold text-foreground">Branch Name <span className="text-destructive">*</span></label>
                    <input {...register("name")} className={inputCls(!!errors.name)} placeholder="e.g. Zenith KLCC" />
                    {errors.name && (
                      <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                        <WarningCircle size={12} /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-nav font-semibold text-foreground">Active</p>
                      <p className="text-caption text-muted-foreground">Inactive branches are hidden from the marketplace.</p>
                    </div>
                    <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Mapping */}
            <div id="location-mapping" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <MapPin size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-subtitle font-semibold text-foreground">Location Mapping</h3>
                    <p className="text-label text-muted-foreground">Address and map coordinates for this branch.</p>
                  </div>
                </div>
                <div className="p-1">
                  <LocationPicker 
                    value={watch("address")}
                    onChange={(val) => setValue("address", val as any, { shouldValidate: true })}
                    errors={errors.address}
                  />
                </div>
              </div>
            </div>

            {/* Service Catalog */}
            <div id="service-catalog" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Tag size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-subtitle font-semibold text-foreground">Service Catalog</h3>
                    <p className="text-label text-muted-foreground">Select services and manage specific sub-types.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-8">
                    {(serviceCatalog as any[]).map((group: any) => (
                      <div key={group.category} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-label font-semibold text-muted-foreground tracking-wider uppercase">{group.category}</h4>
                          <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
                    <p className="text-caption text-destructive flex items-center gap-1">
                      <WarningCircle size={12} /> {errors.services.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Governance */}
            <div id="governance" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Users size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-subtitle font-semibold text-foreground">Branch Governance</h3>
                      <p className="text-label text-muted-foreground">Administrators and PICs for this location.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-label gap-1.5"
                      onClick={() => appendAdmin({ name: "", email: "", role: "Administrator", designateAsPic: false })}
                    >
                      <Plus size={14} weight="bold" /> Add Admin
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-label gap-1.5"
                      onClick={() => appendContact({ name: "", email: "", type: "staff", phone: "", isPublic: true })}
                    >
                      <Plus size={14} weight="bold" /> Add PIC
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Administrators Section */}
                  <div className="space-y-4">
                    <p className="text-micro font-semibold text-muted-foreground/50 uppercase tracking-widest px-1">Local Administrators</p>
                    <div className="space-y-4">
                      {adminFields.map((field, i) => (
                        <div key={field.id} className="p-4 rounded-lg border border-border bg-muted/10 space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => removeAdmin(i)}
                            className="absolute top-4 right-4 text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Name</label>
                              <input {...register(`administrators.${i}.name`)} className={inputCls(!!(errors.administrators as any)?.[i]?.name)} placeholder="Full name" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Corporate Email</label>
                              <input type="email" {...register(`administrators.${i}.email`)} className={inputCls(!!(errors.administrators as any)?.[i]?.email)} placeholder="name@company.com" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={watch(`administrators.${i}.designateAsPic`)} 
                                onCheckedChange={(v) => {
                                  setValue(`administrators.${i}.designateAsPic`, v);
                                  handleAdminPicSync(i, v);
                                }} 
                              />
                              <span className="text-label font-semibold text-foreground">Designate as PIC</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PICs Section */}
                  <div className="space-y-4">
                    <p className="text-micro font-semibold text-muted-foreground/50 uppercase tracking-widest px-1">Persons In Charge (PIC)</p>
                    <div className="space-y-4">
                      {contactFields.map((field, i) => (
                        <div key={field.id} className="p-4 rounded-lg border border-border bg-muted/10 space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => removeContact(i)}
                            className="absolute top-4 right-4 text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Name <span className="text-destructive">*</span></label>
                              <input {...register(`contacts.${i}.name`)} className={inputCls(!!(errors.contacts as any)?.[i]?.name)} placeholder="Full name" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Corporate Email <span className="text-destructive">*</span></label>
                              <input type="email" {...register(`contacts.${i}.email`)} className={inputCls(!!(errors.contacts as any)?.[i]?.email)} placeholder="name@company.com" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Job Role</label>
                              <select {...register(`contacts.${i}.type`)} className={cn(inputCls(), "appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10")}>
                                {BRANCH_CONTACT_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-caption font-semibold text-muted-foreground tracking-tight">Phone <span className="text-destructive">*</span></label>
                              <Controller
                                control={control}
                                name={`contacts.${i}.phone`}
                                render={({ field }) => (
                                  <PhoneInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={!!(errors.contacts as any)?.[i]?.phone}
                                    placeholder="Enter mobile number"
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                            <Switch checked={watch(`contacts.${i}.isPublic`)} onCheckedChange={(v) => setValue(`contacts.${i}.isPublic`, v)} />
                            <span className="text-label font-semibold text-foreground">Public profile visibility</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div id="operating-hours" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Clock size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-subtitle font-semibold text-foreground">Operating Hours</h3>
                    <p className="text-label text-muted-foreground">Weekly open and close schedule.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {OPERATING_DAYS.map(({ key, label }) => {
                    const isClosed = watch(`operatingHours.${key}.isClosed`);
                    return (
                      <div key={key} className="grid grid-cols-[90px_1fr] md:grid-cols-[100px_1fr_120px_120px] gap-3 items-center py-1.5">
                        <span className="text-nav font-medium text-foreground">{label.slice(0, 3)}</span>
                        <div className="flex items-center gap-2">
                          <Switch checked={!isClosed} onCheckedChange={(v) => setValue(`operatingHours.${key}.isClosed`, !v)} />
                          <span className="text-caption text-muted-foreground ml-1">{isClosed ? "Closed" : "Open"}</span>
                        </div>
                        {!isClosed && (
                          <>
                            <input type="time" {...register(`operatingHours.${key}.open`)} disabled={isClosed} className={cn(inputCls(!!errors.operatingHours?.[key]?.open), "text-center text-label font-mono")} />
                            <input type="time" {...register(`operatingHours.${key}.close`)} disabled={isClosed} className={cn(inputCls(!!errors.operatingHours?.[key]?.close), "text-center text-label font-mono")} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div id="benefits" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-subtitle font-semibold text-foreground">Benefits</h3>
                    <p className="text-label text-muted-foreground">Amenities and benefits available at this branch.</p>
                  </div>
                </div>
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
                    <Button type="button" variant="ghost" size="sm" className="shrink-0 h-10" onClick={addBenefit}>
                      <Plus size={14} />
                    </Button>
                  </div>
                  {benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-label px-2.5 py-1 bg-muted border border-border rounded-lg font-medium">
                          {f}
                          <button type="button" onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-white/80 backdrop-blur-2xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
        <Button 
          type="button" 
          variant="ghost" 
          size="lg"
          onClick={onCancel}
          className="text-nav font-semibold px-6"
        >
          Cancel
        </Button>
        <div className="w-px h-6 bg-border/40" />
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="text-nav font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              {isEditing ? "Save Branch" : "Create Branch"}
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
