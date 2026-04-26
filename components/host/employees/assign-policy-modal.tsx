"use client";

import { useState } from "react";
import { MagnifyingGlass, Check, X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Policy {
  id: string;
  name: string;
  description: string;
  benefitGroups: string[];
  totalAllocated: number;
  eligibility: {
    employeeTypes: string[];
    roles: string[];
  };
}

interface AssignPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  onAssign: (policyId: string) => void;
}

const MOCK_POLICIES: Policy[] = [
  {
    id: "policy_1",
    name: "Wellness Allocation",
    description: "Comprehensive wellness benefits covering gym memberships, mental health support, and optical care.",
    benefitGroups: ["Gym Membership", "Mental Health", "Optical"],
    totalAllocated: 2500,
    eligibility: {
      employeeTypes: ["Full-time", "Part-time"],
      roles: ["All Roles"],
    },
  },
  {
    id: "policy_2",
    name: "Lifestyle Pocket",
    description: "Flexible lifestyle benefits for food & beverage, entertainment, and transportation.",
    benefitGroups: ["Food & Beverage", "Entertainment", "Transportation"],
    totalAllocated: 1000,
    eligibility: {
      employeeTypes: ["Full-time"],
      roles: ["All Roles"],
    },
  },
  {
    id: "policy_3",
    name: "Executive Wellness",
    description: "Premium wellness package for executives with higher allocations and additional services.",
    benefitGroups: ["Gym Membership", "Mental Health", "Optical", "Health Screening"],
    totalAllocated: 5000,
    eligibility: {
      employeeTypes: ["Full-time"],
      roles: ["Manager", "Director", "Executive"],
    },
  },
  {
    id: "policy_4",
    name: "Basic Health Support",
    description: "Essential health benefits for entry-level employees.",
    benefitGroups: ["Mental Health", "Optical"],
    totalAllocated: 1500,
    eligibility: {
      employeeTypes: ["Full-time", "Contract"],
      roles: ["All Roles"],
    },
  },
];

export function AssignPolicyModal({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onAssign,
}: AssignPolicyModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const filteredPolicies = MOCK_POLICIES.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPolicy = selectedPolicyId
    ? MOCK_POLICIES.find((p) => p.id === selectedPolicyId)
    : null;

  const handleAssign = () => {
    if (selectedPolicyId) {
      onAssign(selectedPolicyId);
      onOpenChange(false);
      setSelectedPolicyId(null);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold">Assign Benefit Policy</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Select a benefit policy to assign to{" "}
            <span className="font-semibold text-foreground">{employeeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search policies by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Policy List */}
          <div className="space-y-3">
            {filteredPolicies.map((policy) => (
              <Card
                key={policy.id}
                className={`cursor-pointer transition-all border ${
                  selectedPolicyId === policy.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedPolicyId(policy.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-nav font-semibold text-foreground">{policy.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          RM {policy.totalAllocated.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">{policy.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {policy.benefitGroups.map((group) => (
                          <Badge key={group} variant="secondary" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Eligible for:</span>{" "}
                        {policy.eligibility.employeeTypes.join(", ")} • {policy.eligibility.roles.join(", ")}
                      </div>
                    </div>

                    {selectedPolicyId === policy.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <Check size={14} weight="bold" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPolicies.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <MagnifyingGlass size={24} className="text-muted-foreground" />
                </div>
                <p className="text-nav font-semibold text-foreground">No policies found</p>
                <p className="text-caption text-muted-foreground mt-1">
                  Try adjusting your search terms or check if policies are available.
                </p>
              </div>
            )}
          </div>

          {/* Selected Policy Summary */}
          {selectedPolicy && (
            <Card className="border-border bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption font-semibold text-muted-foreground">Selected Policy</p>
                    <p className="text-nav font-semibold text-foreground">{selectedPolicy.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    RM {selectedPolicy.totalAllocated.toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              setSelectedPolicyId(null);
              setSearchQuery("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPolicyId}
            className="min-w-24"
          >
            Assign Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}