"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, User, Gift, Shield, Receipt, PencilSimpleLine } from "@phosphor-icons/react";

import { VerticalTabs } from "@/components/shared/vertical-tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmployeeDetailsTab } from "@/components/host/employees/employee-details-tab";
import { EmployeeEntitlementsTab } from "@/components/host/employees/employee-entitlements-tab";
import { EmployeePolicyTab } from "@/components/host/employees/employee-policy-tab";
import { EmployeeClaimsTab } from "@/components/host/employees/employee-claims-tab";

// Mock data - will be replaced with API calls
const mockEmployee = {
  id: "emp_1",
  name: "Robert Fox",
  email: "robert.fox@acme.com",
  status: "Linked",
  designation: "Senior Software Engineer",
  department: "Engineering",
  avatar: "RF",
  empCode: "ACM-1002",
  dateOfBirth: "12 May 1990",
  idType: "IC",
  idNumber: "900512-14-5231",
  mobile: "+60 12-345 6789",
  branch: "ACME HQ (Kuala Lumpur)",
  joinDate: "12 Oct 2023",
  workType: "Full-time",
  nationality: "Malaysian",
};

const TABS = [
  { id: "details", label: "Employee Details", icon: User },
  { id: "entitlements", label: "Entitlements", icon: Gift },
  { id: "policy", label: "Benefit Policy", icon: Shield },
  { id: "claims", label: "Claims", icon: Receipt },
] as const;

export default function EmployeePage() {
  const params = useParams();
  const employeeId = params.id as string;
  const [activeTab, setActiveTab] = useState<string>("details");

  // Mock employee data - will be fetched from API
  const employee = mockEmployee;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb/Back Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-nav font-medium text-muted-foreground hover:text-primary"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} />
          Back to Employee Directory
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <span className="font-semibold text-heading">{employee.avatar}</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-heading font-semibold tracking-tight text-foreground">{employee.name}</h2>
              <StatusBadge status={employee.status} variant="emerald" />
            </div>
            <p className="text-nav text-muted-foreground mt-0.5">
              {employee.designation} • {employee.department}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 font-semibold border-border/60 hover:bg-muted"
            onClick={() => console.log("Edit employee", employeeId)}
          >
            <PencilSimpleLine size={18} weight="bold" className="mr-2" />
            Edit Employee
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical Tabs Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <VerticalTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="sticky top-8"
          />
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === "details" && (
              <EmployeeDetailsTab employee={employee} />
            )}

            {activeTab === "entitlements" && (
              <EmployeeEntitlementsTab employeeId={employeeId} />
            )}

            {activeTab === "policy" && (
              <EmployeePolicyTab employeeId={employeeId} />
            )}

            {activeTab === "claims" && (
              <EmployeeClaimsTab employeeId={employeeId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}