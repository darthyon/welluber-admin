"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag, Image as ImageIcon, WarningCircle, CheckCircle, UploadSimple, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brand } from "@/types/brand";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  logo: z.any().optional(),
  status: z.enum(["active", "inactive"]),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormData) => void;
  isSubmitting?: boolean;
}

export function BrandForm({ initialData, onSubmit, isSubmitting }: BrandFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
      logo: initialData?.logo || "",
      status: initialData?.status === "removed" ? "inactive" : initialData?.status || "active",
    },
  });

  const logoFile = watch("logo");

  useEffect(() => {
    if (logoFile instanceof File) {
      const objectUrl = URL.createObjectURL(logoFile);
      setLogoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [logoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true });
    }
  };

  const removeLogo = () => {
    setValue("logo", undefined, { shouldValidate: true });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Brand Name */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand Name</label>
          <input
            {...register("name")}
            className={inputCls(!!errors.name)}
            placeholder="e.g. Zenith Wellness Group"
          />
          {errors.name && (
            <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
            <ImageIcon size={14} className="text-muted-foreground" />
            Brand Logo
          </label>
          
          <div className="flex items-start gap-4">
            {/* Preview Box */}
            <div 
              className={cn(
                "w-24 h-24 rounded-xl border border-border bg-muted/20 flex items-center justify-center relative overflow-hidden group",
                !logoPreview && "border-dashed"
              )}
            >
              {logoPreview ? (
                <>
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={20} weight="bold" className="text-white" />
                  </button>
                </>
              ) : (
                <ImageIcon size={32} weight="thin" className="text-muted-foreground/40" />
              )}
            </div>

            {/* Upload Area */}
            <div className="flex-1 space-y-2">
              <div 
                className={cn(
                  "border-2 border-dashed border-border/60 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer",
                  errors.logo && "border-destructive bg-destructive/5"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-2">
                  <UploadSimple size={16} />
                </div>
                <p className="text-[12px] font-bold text-foreground">Click to upload logo</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">PNG, JPG or SVG (max. 2MB)</p>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {errors.logo && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <WarningCircle size={12} /> {String(errors.logo.message)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <h4 className="text-[13px] font-semibold text-foreground">Activate Brand</h4>
            <p className="text-[11px] text-muted-foreground opacity-70">
              Only active brands can have new service providers assigned.
            </p>
          </div>
          <select
            {...register("status")}
            className="bg-background border border-border rounded px-2 py-1 text-[12px] font-medium outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-[13px] font-bold px-6"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{initialData ? "Save Changes" : "Create Brand"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
