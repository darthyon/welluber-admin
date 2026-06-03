"use client";

import { CheckCircle, Gear, Prohibit } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DetailSection } from "@/components/shared/detail-section";
import { cn } from "@/lib/utils";
import { MOCK_SPS } from "@/lib/mock-data";

type ServiceProviderRecord = (typeof MOCK_SPS)[number];

interface ServiceProviderSettingsSectionProps {
  currentStatus: ServiceProviderRecord["status"];
  isTogglingStatus: boolean;
  onOpenDangerAction: (action: "status" | "remove") => void;
}

export function ServiceProviderSettingsSection({
  currentStatus,
  isTogglingStatus,
  onOpenDangerAction,
}: ServiceProviderSettingsSectionProps) {
  const statusTitle =
    currentStatus === "suspended" ? "Reactivate Service Provider" : "Suspend Service Provider";
  const statusDescription =
    currentStatus === "suspended"
      ? "Restore access and allow new transactions."
      : "Pause access and stop new transactions temporarily.";

  return (
    <div className="animate-in space-y-6 fade-in">
      <DetailSection
        title="Danger Zone"
        icon={<Gear size={18} weight="duotone" />}
        description="Confirm how you want to change the provider lifecycle."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-body font-medium text-foreground">{statusTitle}</p>
                <p className="text-label text-muted-foreground">{statusDescription}</p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full rounded-full text-body font-medium transition-all sm:w-auto",
                  currentStatus === "suspended"
                    ? "border-primary/30 text-primary hover:bg-primary/5"
                    : "border-destructive/30 text-destructive hover:bg-destructive/5",
                )}
                onClick={() => onOpenDangerAction("status")}
                disabled={isTogglingStatus}
              >
                {currentStatus === "suspended" ? (
                  <>
                    <CheckCircle size={16} weight="bold" className="mr-1.5" />
                    Activate Service Provider
                  </>
                ) : (
                  <>
                    <Prohibit size={16} weight="bold" className="mr-1.5" />
                    Suspend Service Provider
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-500/10 p-4 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-body font-medium text-foreground">Remove Service Provider</p>
                <p className="text-label text-muted-foreground">
                  Permanently remove the provider, branches, vouchers, and admin access.
                </p>
              </div>
              <Button
                variant="destructive"
                size="lg"
                className="w-full rounded-full text-body font-medium transition-all sm:w-auto"
                onClick={() => onOpenDangerAction("remove")}
              >
                Remove Service Provider
              </Button>
            </div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
