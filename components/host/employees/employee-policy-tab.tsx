"use client";

import { useState } from "react";
import { Shield, Users, CurrencyCircleDollar, Calendar, Warning, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssignPolicyModal } from "./assign-policy-modal";
import { UnassignPolicyModal } from "./unassign-policy-modal";

interface EmployeePolicyTabProps {
  employeeId: string;
}

export function EmployeePolicyTab({ employeeId }: EmployeePolicyTabProps) {
  const [hasPolicy, setHasPolicy] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [employeeName] = useState("Robert Fox"); // This should come from props

  // Mock policy data
  const policy = {
    id: "policy_1",
    name: "Wellness Allocation",
    description: "Comprehensive wellness benefits covering gym memberships, mental health support, and optical care.",
    effectiveDate: "12 Oct 2023",
    expiryDate: "11 Oct 2024",
    status: "Active",
    benefitGroups: [
      { name: "Gym Membership", amount: 1000, spent: 480, utilization: 48 },
      { name: "Mental Health", amount: 1000, spent: 320, utilization: 32 },
      { name: "Optical", amount: 500, spent: 400, utilization: 80 },
    ],
    poolType: "Individual",
    eligibility: {
      employeeTypes: ["Full-time"],
      roles: ["All Roles"],
    },
    refreshCycle: "Monthly",
    totalAllocated: 2500,
    totalSpent: 1200,
    totalUtilization: 48,
  };

  const handleAssignPolicy = () => {
    setShowAssignModal(true);
    console.log("Assign policy to employee:", employeeId);
  };

  const handleUnassignPolicy = () => {
    setShowUnassignModal(true);
    console.log("Unassign policy from employee:", employeeId);
  };

  const confirmUnassign = () => {
    setHasPolicy(false);
    setShowUnassignModal(false);
    console.log("Policy unassigned from employee:", employeeId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Benefit Policy</h2>
        <p className="text-body text-muted-foreground mt-2">
          Assigned benefit policy, policy details, and management options.
        </p>
      </div>

      {hasPolicy ? (
        <>
          {/* Policy Card */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Shield size={24} weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-heading font-semibold text-foreground">{policy.name}</h3>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {policy.status}
                        </Badge>
                      </div>
                      <p className="text-body text-muted-foreground mt-1">{policy.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-label font-medium text-subtle">Effective:</span>
                          <span className="text-body font-medium text-foreground">{policy.effectiveDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-label font-medium text-subtle">Expires:</span>
                          <span className="text-body font-medium text-foreground">{policy.expiryDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="text-label font-medium text-subtle">Pool Type:</span>
                          <span className="text-body font-medium text-foreground">{policy.poolType}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CurrencyCircleDollar size={16} className="text-primary" />
                          <p className="text-label font-medium text-subtle">Total Allocated</p>
                        </div>
                        <p className="text-display font-semibold text-foreground tabular-nums">RM {policy.totalAllocated.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CurrencyCircleDollar size={16} className="text-amber-500" />
                          <p className="text-label font-medium text-subtle">Total Spent</p>
                        </div>
                        <p className="text-display font-semibold text-foreground tabular-nums">RM {policy.totalSpent.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield size={16} className="text-emerald-500" />
                          <p className="text-label font-medium text-subtle">Utilization</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={policy.totalUtilization} className="h-2 flex-1" />
                          <span className="text-body font-medium text-foreground">{policy.totalUtilization}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={handleAssignPolicy}
                  >
                    <Shield size={18} />
                    Change Policy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                    onClick={handleUnassignPolicy}
                  >
                    <Warning size={18} />
                    Unassign Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit Groups */}
          <div className="space-y-6">
            <h3 className="text-heading font-semibold text-foreground">Benefit Groups & Pools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {policy.benefitGroups.map((group, index) => (
                <Card key={index} className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-body font-semibold text-foreground">
                      {group.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-label font-medium text-subtle">Allocated</p>
                          <p className="text-body font-medium text-foreground">RM {group.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-label font-medium text-subtle">Spent</p>
                          <p className="text-body font-medium text-foreground">RM {group.spent.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-label font-medium text-subtle">Balance</p>
                          <p className="text-body font-medium text-foreground">
                            RM {(group.amount - group.spent).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-label font-medium text-subtle">Utilization</p>
                          <p className="text-body font-medium text-foreground">{group.utilization}%</p>
                        </div>
                        <Progress value={group.utilization} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-6">
            <h3 className="text-heading font-semibold text-foreground">Policy Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-body font-semibold text-foreground flex items-center gap-2">
                    <Users size={18} />
                    Eligibility Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-label font-medium text-subtle">Employee Types</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {policy.eligibility.employeeTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Roles</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {policy.eligibility.roles.map((role, idx) => (
                          <Badge key={idx} variant="outline">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-body font-semibold text-foreground flex items-center gap-2">
                    <Calendar size={18} />
                    Refresh & Cycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-label font-medium text-subtle">Refresh Cycle</p>
                      <p className="text-body font-medium text-foreground">{policy.refreshCycle}</p>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Next Refresh</p>
                      <p className="text-body font-medium text-foreground">01 May 2024</p>
                    </div>
                    <div>
                      <p className="text-label font-medium text-subtle">Days Remaining</p>
                      <p className="text-body font-medium text-foreground">15 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Empty State - No Policy Assigned */
        <Card className="border-border border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 border border-border mx-auto flex items-center justify-center text-faint">
              <Shield size={32} />
            </div>
            <h3 className="text-heading font-semibold text-foreground mt-6">No Policy Assigned</h3>
            <p className="text-body text-muted-foreground mt-2 max-w-md mx-auto">
              This employee doesn't have a benefit policy assigned yet. Assign a policy to provide benefits.
            </p>
            <Button className="mt-6 gap-2" onClick={handleAssignPolicy}>
              <Shield size={18} />
              Assign Benefit Policy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AssignPolicyModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        employeeId={employeeId}
        employeeName={employeeName}
        onAssign={(policyId) => {
          console.log("Assigning policy:", policyId);
          setHasPolicy(true);
          // In a real app, you would update the policy data here
        }}
      />

      <UnassignPolicyModal
        open={showUnassignModal}
        onOpenChange={setShowUnassignModal}
        employeeId={employeeId}
        employeeName={employeeName}
        policyName={policy.name}
        hasActiveClaims={policy.totalSpent > 0}
        onUnassign={confirmUnassign}
      />
    </div>
  );
}