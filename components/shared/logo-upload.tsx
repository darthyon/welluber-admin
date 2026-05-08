"use client";

import React, { useState, useRef } from "react";
import { UploadSimple, X, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoUploadProps {
  value?: File | string | null;
  onChange: (value: File | null) => void;
  error?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A standardized Logo Upload component for the administrative console.
 * Supports file selection, drag-and-drop, and previewing existing/new images.
 */
export function LogoUpload({
  value,
  onChange,
  error,
  label = "Upload Logo",
  className,
  disabled
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-body font-medium text-foreground">{label}</label>}
      
      <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all overflow-hidden",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          preview ? "aspect-square w-32 border-primary/20 bg-primary/[0.03]" : "h-32 w-full border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40",
          error && "border-destructive/40 bg-destructive/5"
        )}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={disabled}
        />

        {preview ? (
          <div className="relative w-full h-full p-2">
            <Image src={preview} alt="Logo preview" fill unoptimized className="object-contain rounded-lg" sizes="200px" />
            {!disabled && (
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-background border border-border/60 rounded-full text-faint hover:text-destructive hover:border-destructive shadow-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-background border border-border/40 flex items-center justify-center text-faint group-hover:text-primary transition-colors">
              <UploadSimple size={18} weight="bold" />
            </div>
            <div className="space-y-0.5">
              <p className="text-label font-semibold text-foreground">Click to upload</p>
              <p className="text-label text-faint font-medium">SVG, PNG or JPG (max. 800x800px)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-label text-destructive flex items-center gap-1 mt-1 font-medium">
          <WarningCircle size={12} weight="bold" />
          {error}
        </p>
      )}
    </div>
  );
}

