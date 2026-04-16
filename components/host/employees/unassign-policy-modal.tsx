"use client";

import { WarningCircle } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UnassignPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  policyName: string;
  hasActiveClaims: boolean;
  onUnassign: () => void;
}

export function UnassignPolicyModal({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  policyName,
  hasActiveClaims,
  onUnassign,
}: UnassignPolicyModalProps) {

  const handleUnassign = () => {
    onUnassign();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold flex items-center gap-2">
            <WarningCircle className="text-amber-500" size={20} />
            Unassign Benefit Policy
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            This action will remove the assigned benefit policy from{" "}
            <span className="font-semibold text-foreground">{employeeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Message */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <WarningCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div className="space-y-2">
                  <p className="text-nav font-semibold text-amber-600 dark:text-amber-400">
                    {hasActiveClaims ? "Active Claims Detected" : "Policy Removal Warning"}
                  </p>
                  <p className="text-caption text-amber-600/80 dark:text-amber-400/80">
                    {hasActiveClaims
                      ? `This employee has active claims under the "${policyName}" policy. Unassigning will not delete claim history, but new claims cannot be made without an assigned policy.`
                      : `Unassigning the "${policyName}" policy will remove benefit access. The employee will not be able to make new claims until a new policy is assigned.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-caption font-semibold text-muted-foreground">Employee</span>
              <span className="text-nav font-semibold text-foreground">{employeeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-caption font-semibold text-muted-foreground">Policy to Remove</span>
              <span className="text-nav font-semibold text-foreground">{policyName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-caption font-semibold text-muted-foreground">Status</span>
              <span className="text-nav font-semibold text-amber-600 dark:text-amber-400">
                {hasActiveClaims ? "Has Active Claims" : "No Active Claims"}
              </span>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-nav font-semibold text-foreground mb-2">What will happen:</h4>
            <ul className="space-y-2 text-caption text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>Policy will be unassigned from this employee</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>Existing claim records will be preserved for historical reference</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>Employee will not be able to make new claims until a new policy is assigned</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>This action will be logged in the audit trail</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnassign}
            className="min-w-24"
          >
            Unassign Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}