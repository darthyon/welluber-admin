"use client";

import { CaretLeft } from "@phosphor-icons/react";

interface NewOrganizationPageHeaderProps {
  onBack: () => void;
  orgName?: string;
  step: 1 | 2;
}

export function NewOrganizationPageHeader({
  onBack,
  orgName,
  step,
}: NewOrganizationPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
      >
        <CaretLeft size={16} />
        {step === 1 ? "Back" : "Back to Organisation"}
      </button>
      <div>
        <div className="mb-1 flex items-center gap-3">
          <h1 className="text-heading font-semibold text-foreground text-balance">
            {step === 1 ? "Add New Organisation" : "Set Up HQ Branch"}
          </h1>
        </div>
        <p className="text-body text-subtle">
          {step === 1
            ? "Register a new corporate client on the platform."
            : `Configure the HQ branch and account for ${orgName ?? "this organisation"}.`}
        </p>
      </div>
    </div>
  );
}
