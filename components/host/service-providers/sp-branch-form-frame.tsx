"use client";

import { CaretLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";

interface BranchFormHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
}

export function BranchFormHeader({ isEditing, onCancel }: BranchFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
      >
        <CaretLeft size={16} />
        Back to Branches
      </button>

      <div>
        <h1 className="text-heading font-semibold text-foreground text-balance">
          {isEditing ? "Edit Branch" : "Add New Branch"}
        </h1>
        <p className="mt-1 text-body text-subtle">Configure location, access, and operating details.</p>
      </div>
    </div>
  );
}

interface BranchFormActionBarProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function BranchFormActionBar({
  isEditing,
  isSubmitting,
  onCancel,
}: BranchFormActionBarProps) {
  return (
    <>
      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl animate-in slide-in-from-bottom-10 duration-700 ease-out lg:left-[calc(50%+104px)] lg:translate-x-0">
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
          disabled={isSubmitting}
          size="lg"
          className="flex items-center gap-2 px-8 text-body font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" variant="white" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              {isEditing ? "Save Branch" : "Create Branch"}
              <PaperPlaneTilt size={14} weight="bold" />
            </>
          )}
        </Button>
      </div>

      <div className="h-64" />
    </>
  );
}
