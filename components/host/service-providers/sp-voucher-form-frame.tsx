"use client";

import { CaretLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import type { SpVoucher } from "@/types/provider";

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

interface VoucherFormActionBarProps {
  formIsSubmitting: boolean;
  isEditing: boolean;
  isPublishing: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onPublish: () => void;
  voucher?: SpVoucher;
}

export function VoucherFormActionBar({
  formIsSubmitting,
  isEditing,
  isPublishing,
  isSubmitting,
  onCancel,
  onPublish,
  voucher,
}: VoucherFormActionBarProps) {
  return (
    <>
      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl animate-in slide-in-from-bottom-10 duration-700 ease-out lg:left-[calc(50%+104px)] lg:translate-x-0">
        {isEditing && voucher?.status === "draft" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onPublish}
              disabled={isSubmitting || isPublishing || formIsSubmitting}
              className="px-6 text-body font-semibold text-primary"
            >
              {isPublishing ? <Spinner size="sm" className="mr-2" /> : null}
              Publish
            </Button>
            <div className="h-6 w-px bg-border/40" />
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onCancel}
          className="px-6 text-body font-semibold"
        >
          Cancel
        </Button>
        <div className="h-6 w-px bg-border/40" />
        <Button
          type="submit"
          disabled={isSubmitting || formIsSubmitting}
          size="lg"
          className="flex items-center gap-2 px-8 text-body font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
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
      </div>

      <div className="h-64" />
    </>
  );
}
