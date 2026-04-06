"use client";

import { useRef, useState, useEffect } from "react";
import { UploadSimple, X, Image as ImageIcon, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  value?: string | File;
  onChange: (value?: File) => void;
  error?: string;
  className?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function LogoUpload({
  value,
  onChange,
  error,
  className,
  label = "Logo",
  accept = "image/*",
  maxSizeMB = 2,
  disabled = false,
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string" && value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        // You could handle size error here, but typically zod handles it
        // For now, let's pass it up and let the form handle validation
      }
      onChange(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
        <ImageIcon size={14} className="text-muted-foreground" />
        {label}
      </label>
      
      <div className="flex items-start gap-4">
        {/* Preview Box */}
        <div 
          className={cn(
            "w-24 h-24 rounded-xl border border-border bg-muted/20 flex items-center justify-center relative overflow-hidden group",
            !preview && "border-dashed"
          )}
        >
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Logo Preview" 
                className="w-full h-full object-contain"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X size={20} weight="bold" className="text-white" />
                </button>
              )}
            </>
          ) : (
            <ImageIcon size={28} weight="thin" className="text-muted-foreground/40" />
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 space-y-2">
          <div 
            className={cn(
              "border-2 border-dashed border-border/60 rounded-xl p-4 h-24 flex flex-col items-center justify-center transition-all",
              !disabled ? "hover:border-primary/40 hover:bg-primary/5 cursor-pointer" : "cursor-not-allowed opacity-60",
              error && "border-destructive bg-destructive/5"
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-1.5 text-primary group-hover:scale-110 transition-transform">
              <UploadSimple size={16} />
            </div>
            <p className="text-[12px] font-bold text-foreground">Click to upload logo</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">
              PNG, JPG or SVG (max. {maxSizeMB}MB)
            </p>
          </div>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
          {error && (
            <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
              <WarningCircle size={12} /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
