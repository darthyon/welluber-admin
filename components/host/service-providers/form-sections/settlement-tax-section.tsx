"use client";

import { Bank, Article, ShieldCheck } from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/shared/switch";
import { PAYMENT_CYCLES, CREDIT_TERMS } from "@/features/providers/constants";

interface SettlementTaxSectionProps {
  register: any;
  control: any;
  errors: any;
  labelCls: string;
  inputCls: (hasError?: boolean) => string;
}

export function SettlementTaxSection({
  register,
  control,
  errors,
  labelCls,
  inputCls,
}: SettlementTaxSectionProps) {
  return (
    <div id="settlement-tax" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bank size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Settlement & Tax Compliance</h3>
        </div>

        <div className="space-y-8">
          {/* Bank Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="bankName" className={labelCls}>Bank Name</label>
              <input
                id="bankName"
                {...register("bankInfo.bankName")}
                className={inputCls(!!errors.bankInfo?.bankName)}
                placeholder="e.g. Maybank, CIMB"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="accountName" className={labelCls}>Account Name</label>
              <input
                id="accountName"
                {...register("bankInfo.accountName")}
                className={inputCls(!!errors.bankInfo?.accountName)}
                placeholder="e.g. Zenith Yoga Studio Sdn Bhd"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="accountNumber" className={labelCls}>Account Number</label>
              <input
                id="accountNumber"
                {...register("bankInfo.accountNumber")}
                className={cn(inputCls(!!errors.bankInfo?.accountNumber), "font-mono")}
                placeholder="0000 0000 0000"
              />
            </div>
          </div>

          {/* Billing Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-border/40">
            <div className="space-y-1.5">
              <label htmlFor="paymentCycle" className={labelCls}>Payment Cycle</label>
              <select id="paymentCycle" {...register("paymentCycle")} className={inputCls()}>
                <option value="">Select Cycle</option>
                {PAYMENT_CYCLES.map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="creditTerms" className={labelCls}>Credit Terms</label>
              <select id="creditTerms" {...register("creditTerms")} className={inputCls()}>
                <option value="">Select Terms</option>
                {CREDIT_TERMS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="expiredCommissionFee" className={labelCls}>Expired Commission Fee</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-semibold text-body">%</div>
                <input
                  id="expiredCommissionFee"
                  {...register("expiredCommissionFee", { valueAsNumber: true })}
                  className={cn(inputCls(), "pl-9")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* e-Invoice Settings */}
          <div className="pt-6 border-t border-border/40 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-faint group-hover:text-primary transition-colors">
                    <Article size={18} weight="duotone" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-body font-medium text-foreground">Needs e-Invoice?</p>
                    <p className="text-label text-muted-foreground font-medium">Submission required</p>
                  </div>
                </div>
                <Controller
                  control={control}
                  name="needsEInvoiceSubmission"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-faint group-hover:text-primary transition-colors">
                    <ShieldCheck size={18} weight="duotone" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-body font-medium text-foreground">Appointed Welluber?</p>
                    <p className="text-label text-muted-foreground font-medium">For submission</p>
                  </div>
                </div>
                <Controller
                  control={control}
                  name="appointedForEInvoice"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/5 border border-dashed border-border rounded-lg">
              <div className="space-y-1.5">
                <label htmlFor="classificationCode" className={labelCls}>Classification Code</label>
                <input
                  id="classificationCode"
                  {...register("classificationCode")}
                  className={inputCls()}
                  placeholder="e.g. 001"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="classificationDescriptor" className={labelCls}>Classification Descriptor</label>
                <input
                  id="classificationDescriptor"
                  {...register("classificationDescriptor")}
                  className={inputCls()}
                  placeholder="e.g. General"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
