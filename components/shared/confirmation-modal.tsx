"use client";

import { X, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  impactLabel?: string;
  impactPoints: readonly string[];
  confirmLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  tone?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  impactLabel = "Impact",
  impactPoints,
  confirmLabel,
  cancelLabel = "Cancel",
  isSubmitting = false,
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const toneClasses =
    tone === "danger"
      ? "border-rose-200 bg-rose-50/60 text-rose-700"
      : "border-amber-200 bg-amber-50/70 text-amber-700";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-lead font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="text-body text-subtle">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className={cn("rounded-lg border px-4 py-3", toneClasses)}>
            <div className="flex items-start gap-2">
              <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-label font-semibold">{impactLabel}</p>
                <ul className="space-y-1 text-label leading-relaxed text-subtle">
                  {impactPoints.map((point, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="text-body">
              {cancelLabel}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="text-body gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Working...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
