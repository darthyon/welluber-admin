"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createBranchSchema, CreateBranchData } from "@/features/providers/schemas";
import { createBranch, updateBranch } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import { BRANCH_CONTACT_TYPES, OPERATING_DAYS, DEFAULT_OPERATING_HOURS } from "@/features/providers/constants";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import type { SpBranch } from "@/types/provider";

// Build a mini taxonomy from SP service categories for the multi-select
function buildMiniTaxonomy(serviceCategories: string[]) {
  return [{ category: "Services", services: serviceCategories }];
}

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-2">

      {/* Basic Info */}
      <section className="space-y-4">
        <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Basic Info</h4>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Branch Name</label>
          <input {...register("name")} className={inputCls(!!errors.name)} placeholder="e.g. Zenith KLCC" />
          {errors.name && <p className="text-[11px] text-destructive flex items-center gap-1"><WarningCircle size={12} /> {errors.name.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-foreground">Active</p>
            <p className="text-[11px] text-muted-foreground">Inactive branches are hidden from the marketplace.</p>
          </div>
          <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
        </div>
      </section>

      {/* Services */}
      <section className="space-y-3">
        <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Services at this Branch</h4>
        <SearchableMultiSelect
          taxonomy={buildMiniTaxonomy(serviceCategories)}
          selected={selectedServices}
          onChange={handleServicesChange}
          placeholder="Select services offered at this branch..."
        />
        {errors.services && <p className="text-[11px] text-destructive flex items-center gap-1"><WarningCircle size={12} /> {errors.services.message}</p>}
      </section>

      {/* Address */}
      <section className="space-y-4">
        <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Address</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[13px] font-medium text-foreground">Street Address</label>
            <input {...register("address.line")} className={inputCls(!!errors.address?.line)} placeholder="Lot 5, Suria KLCC" />
            {errors.address?.line && <p className="text-[11px] text-destructive flex items-center gap-1"><WarningCircle size={12} /> {errors.address.line.message}</p>}
          </div>
          {(["city", "state", "country", "postalCode"] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground capitalize">{field === "postalCode" ? "Postal Code" : field}</label>
              <input {...register(`address.${field}`)} className={inputCls(!!(errors.address as any)?.[field])} />
              {(errors.address as any)?.[field] && <p className="text-[11px] text-destructive flex items-center gap-1"><WarningCircle size={12} /> {(errors.address as any)[field].message}</p>}
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
      </section>

      {/* Contacts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Contacts</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[12px] h-7 gap-1"
            onClick={() => appendContact({ name: "", type: "staff", phone: "", isPublic: false })}
          >
            <Plus size={13} /> Add Contact
          </Button>
        </div>

        {contactFields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-[1fr_130px_1fr_auto_auto] gap-3 items-end bg-muted/20 rounded-xl p-3 border border-border/50">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Name</label>
              <input {...register(`contacts.${i}.name`)} className={inputCls(!!(errors.contacts as any)?.[i]?.name)} placeholder="Contact name" />
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
            <button type="button" onClick={() => removeContact(i)} className="text-muted-foreground hover:text-destructive transition-colors pb-1.5">
              <Trash size={15} />
            </button>
          </div>
        ))}
        {errors.contacts && typeof errors.contacts === "object" && "message" in errors.contacts && (
          <p className="text-[11px] text-destructive flex items-center gap-1"><WarningCircle size={12} /> {(errors.contacts as any).message}</p>
        )}
      </section>

      {/* Operating Hours */}
      <section className="space-y-4">
        <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Operating Hours</h4>
        <div className="space-y-2">
          {OPERATING_DAYS.map(({ key, label }) => {
            const isClosed = watch(`operatingHours.${key}.isClosed`);
            return (
              <div key={key} className="grid grid-cols-[100px_1fr_100px_100px] gap-3 items-center">
                <span className="text-[13px] font-medium text-foreground">{label.slice(0, 3)}</span>
                <div className="flex items-center gap-1">
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
      </section>

      {/* Facilities */}
      <section className="space-y-4">
        <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Facilities</h4>
        <div className="flex gap-2">
          <input
            value={facilityInput}
            onChange={(e) => setFacilityInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFacility(); } }}
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
      </section>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} className="text-[13px]">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="text-[13px] gap-2">
          {isSubmitting ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : isEditing ? "Save Changes" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
}
