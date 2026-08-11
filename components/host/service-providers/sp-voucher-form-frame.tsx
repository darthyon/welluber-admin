"use client";

import { FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard";

// ─── Step Indicator ───────────────────────────────────────────────────────────

export const VOUCHER_WIZARD_STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Voucher Configuration" },
  { id: 3, label: "Manage Services" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3>[];

interface VoucherStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  allowStepJumping?: boolean;
}

export function VoucherStepIndicator({ currentStep, onStepClick, allowStepJumping = false }: VoucherStepIndicatorProps) {
  return <FormStepIndicator currentStep={currentStep} onStepClick={onStepClick} steps={VOUCHER_WIZARD_STEPS} allowStepJumping={allowStepJumping} />;
}

// ─── Form Header ──────────────────────────────────────────────────────────────

interface VoucherFormHeaderProps {
  isEditing: boolean;
  providerName?: string;
}

export function VoucherFormHeader({ isEditing, providerName }: VoucherFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-heading font-semibold text-foreground text-balance">
          {isEditing ? "Edit Voucher Package" : "Add Voucher Package"}
        </h1>
        <p className="mt-1 text-body text-subtle">
          {isEditing
            ? "Update pricing, service lines, and activation periods for this voucher package."
            : "Create a new voucher package for services purchasable on the marketplace."}
        </p>
        {providerName ? <p className="mt-2 text-label font-medium text-primary">Service Provider: {providerName}</p> : null}
      </div>
    </div>
  );
}
