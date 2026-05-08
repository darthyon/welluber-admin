"use client";

import { Gift, CurrencyCircleDollar, Calendar, ArrowClockwise, ChartLineUp } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

interface EmployeeEntitlementsTabProps {
  employeeId: string;
}

export function EmployeeEntitlementsTab({ employeeId }: EmployeeEntitlementsTabProps) {
  void employeeId;
  // Mock entitlements data
  const entitlements = [
    {
      id: "ent_1",
      name: "Wellness Allocation",
      benefitGroup: "Gym Membership",
      allocatedAmount: 2500,
      currentBalance: 1300,
      utilization: 48,
      refreshCycle: "Monthly",
      lastRefreshed: "01 Apr 2024",
      nextRefresh: "01 May 2024",
    },
    {
      id: "ent_2",
      name: "Lifestyle Pocket",
      benefitGroup: "Food & Beverage",
      allocatedAmount: 1000,
      currentBalance: 150,
      utilization: 85,
      refreshCycle: "Quarterly",
      lastRefreshed: "01 Jan 2024",
      nextRefresh: "01 Apr 2024",
    },
    {
      id: "ent_3",
      name: "Mental Health Support",
      benefitGroup: "Clinical Therapy",
      allocatedAmount: 1500,
      currentBalance: 1500,
      utilization: 0,
      refreshCycle: "Annual",
      lastRefreshed: "01 Jan 2024",
      nextRefresh: "01 Jan 2025",
    },
  ];

  const totalAllocated = entitlements.reduce((sum, ent) => sum + ent.allocatedAmount, 0);
  const totalBalance = entitlements.reduce((sum, ent) => sum + ent.currentBalance, 0);
  const totalUtilization = ((totalAllocated - totalBalance) / totalAllocated) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Entitlements</h2>
        <p className="text-body text-muted-foreground mt-2">
          Benefit allocations, pool balances, and utilization history for this employee.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <CurrencyCircleDollar size={18} />
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display font-semibold text-foreground tabular-nums">
              RM {totalAllocated.toLocaleString()}
            </div>
            <p className="text-label text-muted-foreground mt-1">
              Across all benefit pools
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <Gift size={18} />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display font-semibold text-foreground tabular-nums">
              RM {totalBalance.toLocaleString()}
            </div>
            <p className="text-label text-muted-foreground mt-1">
              Available for use
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <ChartLineUp size={18} />
              Overall Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display font-semibold text-foreground">
              {totalUtilization.toFixed(1)}%
            </div>
            <div className="mt-2">
              <Progress value={totalUtilization} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entitlements List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-heading font-semibold text-foreground">Benefit Pools</h3>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowClockwise size={16} />
            Refresh All
          </Button>
        </div>

        {entitlements.map((entitlement) => (
          <Card key={entitlement.id} className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Gift size={20} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-body font-semibold text-foreground">{entitlement.name}</h4>
                      <p className="text-label text-muted-foreground">{entitlement.benefitGroup}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-label font-medium text-subtle">Allocated</p>
                      <p className="text-body font-medium text-foreground">RM {entitlement.allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Balance</p>
                      <p className="text-body font-medium text-foreground">RM {entitlement.currentBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Utilization</p>
                      <div className="flex items-center gap-2">
                        <Progress value={entitlement.utilization} className="h-2 w-24" />
                        <span className="text-body font-medium text-foreground">{entitlement.utilization}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Refresh Cycle</p>
                      <p className="text-body font-medium text-foreground">{entitlement.refreshCycle}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowClockwise size={16} />
                    Refresh Pool
                  </Button>
                  <div className="text-label text-muted-foreground text-center">
                    <Calendar size={12} className="inline mr-1" />
                    Next: {entitlement.nextRefresh}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-label font-medium text-subtle">Last Refreshed</p>
                  <p className="text-body text-foreground">{entitlement.lastRefreshed}</p>
                </div>
                <div>
                  <p className="text-label font-medium text-subtle">Spent</p>
                  <p className="text-body text-foreground">
                    RM {(entitlement.allocatedAmount - entitlement.currentBalance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-label font-medium text-subtle">Days Remaining</p>
                  <p className="text-body text-foreground">15 days</p>
                </div>
                <div>
                  <p className="text-label font-medium text-subtle">Status</p>
                  <StatusBadge status="Active" variant="emerald" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (commented out for reference)
      {entitlements.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Gift size={48} className="mx-auto text-faint" />
          <h3 className="text-heading font-semibold text-foreground mt-4">No entitlements assigned</h3>
          <p className="text-body text-muted-foreground mt-2 max-w-md mx-auto">
            This employee doesn't have any benefit entitlements yet. Assign a benefit policy to get started.
          </p>
        </div>
      )}
      */}
    </div>
  );
}
