"use client";

interface BranchFormHeaderProps {
  isEditing: boolean;
}

export function BranchFormHeader({ isEditing }: BranchFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-heading font-semibold text-foreground text-balance">
          {isEditing ? "Edit Branch" : "Add New Branch"}
        </h1>
        <p className="mt-1 text-body text-subtle">Configure location, access, and operating details.</p>
      </div>
    </div>
  );
}
