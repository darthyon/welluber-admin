"use client";

import { Sheet } from "@/components/ui/sheet";
import { EmployeeForm } from "./employee-form";

interface EmployeeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string | null;
  onSuccess?: () => void;
}

export function EmployeeSheet({
  isOpen,
  onClose,
  employeeId,
  onSuccess
}: EmployeeSheetProps) {
  const isEditing = !!employeeId;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Employee" : "Add New Employee"}
      description={isEditing
        ? "Update identity, employment details, and benefit policy assignments for this employee."
        : "Register a new employee. Once added, their profile will be linked to the organization's regional branch and designated benefit policies."
      }
    >
      <EmployeeForm
        employeeId={employeeId}
        onCancel={onClose}
        onSuccess={() => {
          onSuccess?.();
          onClose();
        }}
      />
    </Sheet>
  );
}
