"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { CheckCircle, Clock, Plus, Trash, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/shared/switch";
import { BRANCH_CONTACT_TYPES, OPERATING_DAYS } from "@/features/providers/constants";
import { FormSelect } from "@/components/shared/form-select";
import { PhoneInput } from "@/components/shared/phone-input";
import { createBranchSchema } from "@/features/providers/schemas";
import { cn } from "@/lib/utils";

type BranchFormValues = z.input<typeof createBranchSchema>;

interface BranchGovernanceSectionProps {
  adminFields: Array<{ id: string }>;
  appendAdmin: () => void;
  appendContact: () => void;
  contactFields: Array<{ id: string }>;
  control: Control<BranchFormValues>;
  errors: FieldErrors<BranchFormValues>;
  inputCls: (hasError?: boolean) => string;
  onAdminPicSync: (index: number, isPic: boolean) => void;
  register: UseFormRegister<BranchFormValues>;
  removeAdmin: (index: number) => void;
  removeContact: (index: number) => void;
}

export function BranchGovernanceSection({
  adminFields,
  appendAdmin,
  appendContact,
  contactFields,
  control,
  errors,
  inputCls,
  onAdminPicSync,
  register,
  removeAdmin,
  removeContact,
}: BranchGovernanceSectionProps) {
  return (
    <div id="governance" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users size={16} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lead font-semibold text-foreground">Branch Governance</h3>
              <p className="text-label text-muted-foreground">Administrators and PICs for this location.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-label"
              onClick={appendAdmin}
            >
              <Plus size={14} weight="bold" />
              Add Admin
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-label"
              onClick={appendContact}
            >
              <Plus size={14} weight="bold" />
              Add PIC
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="px-1 text-label font-medium uppercase tracking-widest text-faint">
              Local Administrators
            </p>
            <div className="space-y-4">
              {adminFields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative space-y-4 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <button
                    type="button"
                    onClick={() => removeAdmin(index)}
                    className="absolute right-4 top-4 text-faint transition-colors hover:text-destructive"
                  >
                    <Trash size={16} />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">Name</label>
                      <input
                        {...register(`administrators.${index}.name`)}
                        className={inputCls(!!errors.administrators?.[index]?.name)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">Corporate Email</label>
                      <input
                        type="email"
                        {...register(`administrators.${index}.email`)}
                        className={inputCls(!!errors.administrators?.[index]?.email)}
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`administrators.${index}.designateAsPic`}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              onAdminPicSync(index, value);
                            }}
                          />
                        )}
                      />
                      <span className="text-label font-semibold text-foreground">Designate as PIC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="px-1 text-label font-medium uppercase tracking-widest text-faint">
              Persons In Charge (PIC)
            </p>
            <div className="space-y-4">
              {contactFields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative space-y-4 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="absolute right-4 top-4 text-faint transition-colors hover:text-destructive"
                  >
                    <Trash size={16} />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        {...register(`contacts.${index}.name`)}
                        className={inputCls(!!errors.contacts?.[index]?.name)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">
                        Corporate Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        {...register(`contacts.${index}.email`)}
                        className={inputCls(!!errors.contacts?.[index]?.email)}
                        placeholder="name@company.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">Job Role</label>
                      <Controller
                        control={control}
                        name={`contacts.${index}.type`}
                        render={({ field }) => (
                          <FormSelect
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            options={BRANCH_CONTACT_TYPES.map((type) => ({
                              label: type.label,
                              value: type.value,
                            }))}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label font-medium text-subtle">
                        Phone <span className="text-destructive">*</span>
                      </label>
                      <Controller
                        control={control}
                        name={`contacts.${index}.phone`}
                        render={({ field }) => (
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            error={!!errors.contacts?.[index]?.phone}
                            placeholder="Enter mobile number"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border/40 pt-2">
                    <Controller
                      control={control}
                      name={`contacts.${index}.isPublic`}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span className="text-label font-semibold text-foreground">Public profile visibility</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BranchOperatingHoursSectionProps {
  errors: FieldErrors<BranchFormValues>;
  inputCls: (hasError?: boolean) => string;
  operatingHours: BranchFormValues["operatingHours"];
  register: UseFormRegister<BranchFormValues>;
  setValue: UseFormSetValue<BranchFormValues>;
}

export function BranchOperatingHoursSection({
  errors,
  inputCls,
  operatingHours,
  register,
  setValue,
}: BranchOperatingHoursSectionProps) {
  return (
    <div id="operating-hours" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Operating Hours</h3>
            <p className="text-label text-muted-foreground">Weekly open and close schedule.</p>
          </div>
        </div>
        <div className="space-y-2">
          {OPERATING_DAYS.map(({ key, label }) => {
            const isClosed = operatingHours?.[key]?.isClosed ?? false;
            return (
              <div
                key={key}
                className="grid grid-cols-[90px_1fr] items-center gap-3 py-1.5 md:grid-cols-[100px_1fr_120px_120px]"
              >
                <span className="text-body font-medium text-foreground">{label.slice(0, 3)}</span>
                <div className="flex items-center gap-2">
                  <Switch checked={!isClosed} onCheckedChange={(value) => setValue(`operatingHours.${key}.isClosed`, !value)} />
                  <span className="ml-1 text-label text-muted-foreground">{isClosed ? "Closed" : "Open"}</span>
                </div>
                {!isClosed && (
                  <>
                    <input
                      type="time"
                      {...register(`operatingHours.${key}.open`)}
                      disabled={isClosed}
                      className={cn(inputCls(!!errors.operatingHours?.[key]?.open), "text-center font-mono text-label")}
                    />
                    <input
                      type="time"
                      {...register(`operatingHours.${key}.close`)}
                      disabled={isClosed}
                      className={cn(inputCls(!!errors.operatingHours?.[key]?.close), "text-center font-mono text-label")}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface BranchBenefitsSectionProps {
  addBenefit: () => void;
  benefitInput: string;
  benefits: string[];
  inputCls: (hasError?: boolean) => string;
  onBenefitInputChange: (value: string) => void;
  removeBenefit: (index: number) => void;
}

export function BranchBenefitsSection({
  addBenefit,
  benefitInput,
  benefits,
  inputCls,
  onBenefitInputChange,
  removeBenefit,
}: BranchBenefitsSectionProps) {
  return (
    <div id="benefits" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/10 text-muted-foreground">
            <CheckCircle size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Benefits</h3>
            <p className="text-label text-muted-foreground">Amenities and benefits available at this branch.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={benefitInput}
              onChange={(event) => onBenefitInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addBenefit();
                }
              }}
              className={inputCls()}
              placeholder="e.g. Free WiFi"
            />
            <Button type="button" variant="ghost" size="sm" className="h-10 shrink-0" onClick={addBenefit}>
              <Plus size={14} />
            </Button>
          </div>
          {benefits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {benefits.map((benefit, index) => (
                <span
                  key={`${benefit}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1 text-label font-medium"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
