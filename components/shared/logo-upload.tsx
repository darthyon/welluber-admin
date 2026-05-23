"use client"

import React, { useState, useRef } from "react"
import { UploadSimple, X, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoUploadProps {
  value?: File | string | null
  onChange: (value: File | null) => void
  error?: string
  label?: string
  className?: string
  disabled?: boolean
  layout?: "constrained" | "fullWidth"
  shape?: "tile" | "avatar"
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
  disabled,
  layout = "constrained",
  shape = "tile",
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-body font-medium text-foreground">{label}</label>
      )}

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "group relative flex flex-col items-center justify-center border-2 border-dashed transition-all",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          shape === "tile" ? "overflow-hidden" : "overflow-visible",
          preview
            ? cn(
                "border-primary/20 bg-primary/[0.03]",
                shape === "avatar"
                  ? "size-28 rounded-full"
                  : "aspect-square w-32 rounded-lg"
              )
            : cn(
                "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
                shape === "avatar"
                  ? "size-28 rounded-full"
                  : "h-32 w-full rounded-lg",
                shape === "tile" && layout === "constrained" && "max-w-[480px]"
              ),
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
          <div
            className={cn(
              "relative h-full w-full p-2",
              shape === "avatar" && "p-2.5"
            )}
          >
            {shape === "avatar" ? (
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={preview}
                  alt="Logo preview"
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="200px"
                />
              </div>
            ) : (
              <Image
                src={preview}
                alt="Logo preview"
                fill
                unoptimized
                className="rounded-lg object-contain"
                sizes="200px"
              />
            )}
            {!disabled && (
              <button
                onClick={handleClear}
                className={cn(
                  "absolute top-1 right-1 z-10 rounded-full border border-border/60 bg-background p-1 text-faint shadow-sm transition-all hover:border-destructive hover:text-destructive",
                  shape === "avatar"
                    ? "-top-2 -right-2 opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
              >
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center gap-2 p-4 text-center",
              shape === "avatar" && "p-0"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background text-faint transition-colors group-hover:text-primary",
                shape === "avatar" && "h-10 w-10 border-border/50"
              )}
            >
              <UploadSimple size={18} weight="bold" />
            </div>
            {shape === "tile" ? (
              <div className="space-y-0.5">
                <p className="text-label font-semibold text-foreground">
                  Click to upload
                </p>
                <p className="text-label font-medium text-faint">
                  SVG, PNG or JPG (max. 800x800px)
                </p>
              </div>
            ) : (
              <p className="text-label font-semibold text-faint">Upload</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 flex items-center gap-1 text-label font-medium text-destructive">
          <WarningCircle size={12} weight="bold" />
          {error}
        </p>
      )}
    </div>
  )
}
