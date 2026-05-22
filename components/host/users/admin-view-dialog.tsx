"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { ActivityType } from "@/components/shared/activity-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Administrator } from "@/features/users/types";
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data";

interface AdminViewDialogProps {
  admin: Administrator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminViewDialog({ admin, open, onOpenChange }: AdminViewDialogProps) {
  const logs = React.useMemo(() => {
    if (!admin) return [];
    return MOCK_AUDIT_LOGS.filter((l) => l.updatedBy.email.toLowerCase() === admin.email.toLowerCase());
  }, [admin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold text-foreground">Administrator Details</DialogTitle>
          <DialogDescription className="text-body">
            View profile information and recent activity.
          </DialogDescription>
        </DialogHeader>

        {!admin ? null : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lead font-semibold text-foreground truncate">{admin.name}</div>
                  <div className="text-body text-muted-foreground truncate">{admin.email}</div>
                </div>
                <div className="shrink-0">
                  <StatusBadge
                    status={admin.status}
                    variant={admin.status === "Active" ? "emerald" : "rose"}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
                  <div className="text-label font-medium text-muted-foreground">Access Scope</div>
                  <div className="text-body font-medium text-foreground">
                    {admin.entity?.type === "Organization"
                      ? "Organization"
                      : admin.entity?.type === "ServiceProvider"
                        ? "Service Provider"
                        : "Welluber Team"}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
                  <div className="text-label font-medium text-muted-foreground">Assigned Entity</div>
                  <div className="text-body font-medium text-foreground">
                    {admin.entity?.name ?? "Welluber Team"}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
                  <div className="text-label font-medium text-muted-foreground">Joined Date</div>
                  <div className="text-body font-medium text-foreground">{admin.joinedDate}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
                  <div className="text-label font-medium text-muted-foreground">Last Active</div>
                  <div className="text-body font-medium text-foreground">{admin.lastActive}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-lead font-semibold text-foreground">Audit Log</div>
                <div className="text-label text-muted-foreground">Recent Activity</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                {logs.length === 0 ? (
                  <EmptyState
                    icon={<MagnifyingGlass size={28} weight="light" />}
                    title="No Activity Found"
                    description="There are no audit log entries for this administrator yet."
                  />
                ) : (
                  <ActivityTimeline
                    items={logs.map((log) => ({
                      id: log.id,
                      title: log.title,
                      description: log.desc,
                      timestamp: log.timestamp,
                      user: log.updatedBy.name,
                      type: log.type as ActivityType,
                    }))}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
