"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Wallet, 
  UploadSimple, 
  FileText, 
  WarningCircle, 
  CheckCircle,
  ClockCounterClockwise,
  CurrencyDollar,
  CalendarBlank,
  Bank
} from "@phosphor-icons/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manualTopupSchema, ManualTopupData } from "@/features/manual-topup/schemas";
import { submitManualTopup } from "@/features/manual-topup/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SuccessCelebration } from "@/components/shared/success-celebration";

interface ManualTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  branchName: string;
  accountId: string;
}

export function ManualTopUpModal({ 
  isOpen, 
  onClose, 
  orgName, 
  branchName, 
  accountId
}: ManualTopUpModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<ManualTopupData>({
    resolver: zodResolver(manualTopupSchema),
    defaultValues: {
      method: "bank_transfer",
      paidDate: new Date(),
    }
  });

  const attachment = watch("attachment");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("attachment", file, { shouldValidate: true });
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const onSubmit = async (data: ManualTopupData) => {
    setIsSubmitting(true);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("method", data.method);
      formData.append("paidDate", data.paidDate.toISOString());
      formData.append("remarks", data.remarks || "");
      formData.append("attachment", data.attachment);
      formData.append("accountId", accountId);

      const res = await submitManualTopup(formData);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onClose();
          reset();
          setFilePreview(null);
          setSuccess(null);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-lg shadow-lg border border-border flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Wallet size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-body leading-tight">Manual Top-Up</h3>
              <p className="text-label text-muted-foreground font-medium mt-0.5">
                {orgName} • {branchName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {success ? (
            <SuccessCelebration 
              title="Top-Up Submitted" 
              message={success}
              className="py-10"
            />
          ) : (
            <form id="manualTopupForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-label font-semibold text-subtle">Amount (Credit)</label>
                  <div className="relative">
                    <CurrencyDollar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      {...register("amount")}
                      className={cn(
                        "w-full pl-9 pr-3 py-2 bg-background border rounded-md text-body font-medium outline-none transition-colors",
                        errors.amount ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                      )}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      autoFocus
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-label text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-label font-semibold text-subtle">Payment Method</label>
                  <div className="relative">
                    <Bank size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select 
                      {...register("method")}
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-body outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors appearance-none"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-label font-semibold text-subtle">Paid Date</label>
                  <div className="relative">
                    <CalendarBlank size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Controller
                      control={control}
                      name="paidDate"
                      render={({ field }) => (
                        <input 
                          type="date"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
                            errors.paidDate ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30"
                          )}
                        />
                      )}
                    />
                  </div>
                  {errors.paidDate && (
                    <p className="text-label text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.paidDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-label font-semibold text-subtle">Remarks</label>
                  <textarea 
                    {...register("remarks")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body outline-none focus:border-foreground/30 focus:bg-muted/30 transition-colors resize-none"
                    placeholder="Reference numbers, specific instructions, etc."
                    rows={2}
                  />
                </div>

                {/* Attachment Upload */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-label font-semibold text-subtle">
                    Attachment <span className="text-destructive">*</span>
                  </label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                      attachment ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20" : "border-border hover:border-primary/50 hover:bg-primary/5",
                      errors.attachment && "border-destructive bg-destructive/5"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    
                    {attachment ? (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        {filePreview ? (
                          <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 dark:bg-emerald-500/20">
                            <FileText size={24} weight="duotone" />
                          </div>
                        )}
                        <p className="text-body font-medium text-foreground text-center line-clamp-1 px-4">
                          {attachment.name}
                        </p>
                        <p className="text-label text-muted-foreground mt-0.5">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-label text-destructive hover:text-destructive hover:bg-destructive/10 mt-2 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue("attachment", undefined as any, { shouldValidate: true });
                            setFilePreview(null);
                          }}
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <UploadSimple size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-body font-medium text-foreground">Click to upload payment proof</p>
                          <p className="text-label text-muted-foreground mt-0.5">PDF, PNG, JPG (max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                  {errors.attachment && (
                    <p className="text-label text-destructive flex items-center gap-1 mt-1">
                      <WarningCircle size={12} /> {errors.attachment.message as string}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-body font-medium h-9"
            >
              Cancel
            </Button>
            <Button 
              form="manualTopupForm"
              type="submit"
              disabled={isSubmitting}
              className="text-body font-medium flex items-center gap-2 h-9 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  Confirm Top-Up
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
