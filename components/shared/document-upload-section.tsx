"use client";

import React, { useRef } from "react";
import { UploadSimple, File as FileIcon, X, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DocumentUploadSectionProps {
  documents: string[]; // List of file names/URLs
  onChange: (documents: string[]) => void;
  error?: string;
  label?: string;
  description?: string;
  className?: string;
}

/**
 * A standardized document upload section for the administrative console.
 * Supports multiple file selection and display.
 */
export function DocumentUploadSection({
  documents,
  onChange,
  error,
  label = "Documents",
  description = "Upload registration documents, certificates, or other supporting files.",
  className
}: DocumentUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map(f => f.name); // In a real app, this would be the upload result URL
      onChange([...documents, ...newDocs]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <label className="text-body font-semibold text-foreground">{label}</label>
          <p className="text-label text-muted-foreground">{description}</p>
        </div>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-label font-medium rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadSimple size={14} weight="bold" /> Upload
        </Button>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        multiple
        className="hidden" 
        onChange={handleFileChange}
      />

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {documents.map((doc, index) => (
            <div 
              key={`${doc}-${index}`}
              className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl group hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0">
                  <FileIcon size={16} weight="duotone" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-label font-semibold text-foreground truncate max-w-[200px]" title={doc}>
                    {doc}
                  </p>
                  <p className="text-micro text-muted-foreground font-medium">Document attached</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 rounded-full transition-all"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted/50 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/30 transition-all cursor-pointer group",
            error && "border-destructive/50 bg-destructive/5"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-muted-foreground/60 group-hover:text-primary transition-colors mb-3">
            <UploadSimple size={20} weight="bold" />
          </div>
          <p className="text-nav font-semibold text-foreground">Click to upload files</p>
          <p className="text-caption text-muted-foreground mt-0.5">PDF, Word, or Image files accepted</p>
        </div>
      )}

      {error && (
        <p className="text-caption text-destructive flex items-center gap-1.5 mt-2 font-medium">
          <WarningCircle size={14} weight="fill" />
          {error}
        </p>
      )}
    </div>
  );
}
