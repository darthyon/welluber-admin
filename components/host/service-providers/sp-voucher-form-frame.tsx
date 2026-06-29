"use client";

import { ArrowRight, CaretLeft, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";
import type { SpVoucher } from "@/types/provider";

// ─── Step Indicator ───────────────────────────────────────────────────────────

const VOUCHER_WIZARD_STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Voucher Configuration" },
  { id: 3, label: "Manage Services" },
] as const;

interface VoucherStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
}

export function VoucherStepIndicator({ currentStep, onStepClick }: VoucherStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {VOUCHER_WIZARD_STEPS.map((step, idx) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick(step.id as 1 | 2 | 3)}
              className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-label font-semibold transition-all",
                  isDone && "bg-primary text-primary-foreground hover:ring-4 hover:ring-primary/20",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isActive && "border border-border bg-muted text-muted-foreground hover:border-primary/40"
                )}
              >
                {isDone ? <Check size={13} weight="bold" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-label font-medium sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < VOUCHER_WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  currentStep > step.id ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Form Header ──────────────────────────────────────────────────────────────

interface VoucherFormHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
}

export function VoucherFormHeader({ isEditing, onCancel }: VoucherFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
      >
        <CaretLeft size={16} />
        Back to Voucher Package
      </button>

      <div>
        <h1 className="text-heading font-semibold text-foreground text-balance">
          {isEditing ? "Edit Voucher Package" : "Add Voucher Package"}
        </h1>
        <p className="mt-1 text-body text-subtle">
          {isEditing
            ? "Update pricing, service lines, and activation periods for this voucher package."
            : "Create a new voucher package for services purchasable on the marketplace."}
        </p>
      </div>
    </div>
  );
}

// ─── Wizard Action Bar ────────────────────────────────────────────────────────

interface VoucherWizardActionBarProps {
  currentStep: 1 | 2 | 3;
  formIsSubmitting: boolean;
  isEditing: boolean;
  isPublishing: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onNext: () => void;
  onPublish: () => void;
  voucher?: SpVoucher;
}

export function VoucherWizardActionBar({
  currentStep,
  formIsSubmitting,
  isEditing,
  isPublishing,
  isSubmitting,
  onBack,
  onCancel,
  onNext,
  onPublish,
  voucher,
}: VoucherWizardActionBarProps) {
  const isBusy = isSubmitting || isPublishing || formIsSubmitting;

  return (
    <>
      <div className="pointer-events-none sticky bottom-0 z-10 flex justify-end pb-8 pt-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            disabled={currentStep === 1 || isBusy}
            className="gap-2 px-4 text-body font-semibold text-muted-foreground hover:text-foreground"
          >
            <CaretLeft size={14} weight="bold" />
            Back
          </Button>

          <div className="h-6 w-px bg-border/40" />

          {currentStep < 3 ? (
            <Button
              type="button"
              size="lg"
              onClick={onNext}
              disabled={isBusy}
              className="flex items-center gap-2 px-8 text-body font-semibold"
            >
              Next
              <ArrowRight size={14} weight="bold" />
            </Button>
          ) : (
            <>
              {isEditing && voucher?.status === "draft" && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={onPublish}
                    disabled={isBusy}
                    className="px-6 text-body font-semibold text-primary"
                  >
                    {isPublishing ? <Spinner size="sm" className="mr-2" /> : null}
                    Publish
                  </Button>
                  <div className="h-6 w-px bg-border/40" />
                </>
              )}
              <Button
                type="submit"
                disabled={isBusy}
                size="lg"
                className="flex items-center gap-2 px-8 text-body font-semibold"
              >
                {isSubmitting || formIsSubmitting ? (
                  <>
                    <Spinner size="sm" variant="white" />
                    {isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Save Changes" : "Add Voucher"}
                    <PaperPlaneTilt size={14} weight="bold" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="h-28" />
    </>
  );
}
