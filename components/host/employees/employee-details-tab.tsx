"use client";

import { 
  User, 
  EnvelopeSimple, 
  Shield, 
  IdentificationBadge, 
  IdentificationCard,
  Calendar,
  DeviceMobile,
  Buildings,
  CalendarBlank,
  ClockCounterClockwise,
  Globe
} from "@phosphor-icons/react";

import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";

interface EmployeeDetailsTabProps {
  employee: {
    id: string;
    name: string;
    email: string;
    empCode: string;
    dateOfBirth: string;
    idType: string;
    idNumber: string;
    mobile: string;
    branch: string;
    joinDate: string;
    employmentType: string;
    nationality: string;
    department: string;
    designation: string;
    tier?: string;
    status?: string;
    isProbation?: boolean;
  };
}

export function EmployeeDetailsTab({ employee }: EmployeeDetailsTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Employee Details</h2>
        <p className="text-body text-muted-foreground mt-2">
          Basic information, employment details, and contact information for this employee.
        </p>
      </div>

      {/* General Information */}
      <DetailSection 
        title="General Information" 
        icon={<User size={18} weight="bold" className="text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <DetailField 
            label="Full Name" 
            value={employee.name} 
            icon={<User size={16} />}
          />
          <DetailField 
            label="Email Address" 
            value={employee.email} 
            icon={<EnvelopeSimple size={16} />}
          />
          <DetailField 
            label="Employee ID (System)" 
            value={employee.id} 
            icon={<Shield size={16} />}
          />
          <DetailField 
            label="Employee Code" 
            value={employee.empCode} 
            icon={<IdentificationBadge size={16} />}
          />
          <DetailField 
            label="Date of Birth" 
            value={employee.dateOfBirth} 
            icon={<Calendar size={16} />}
          />
          <DetailField 
            label={`Identification (${employee.idType})`} 
            value={employee.idNumber} 
            icon={<IdentificationCard size={16} />}
          />
          <DetailField 
            label="Mobile Number" 
            value={employee.mobile} 
            icon={<DeviceMobile size={16} />}
          />
        </div>
      </DetailSection>

      {/* Employment Details */}
      <DetailSection 
        title="Employment Details" 
        icon={<Buildings size={18} weight="bold" className="text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <DetailField 
            label="Branch / Workplace" 
            value={employee.branch} 
            icon={<Buildings size={16} />}
          />
          <DetailField 
            label="Join Date" 
            value={employee.joinDate} 
            icon={<CalendarBlank size={16} />}
          />
          <DetailField 
            label="Employment Type" 
            value={employee.employmentType} 
            icon={<ClockCounterClockwise size={16} />}
          />
          <DetailField 
            label="Department" 
            value={employee.department} 
            icon={<Buildings size={16} />}
          />
          <DetailField 
            label="Designation" 
            value={employee.designation} 
            icon={<User size={16} />}
          />
          <DetailField 
            label="Tier / Level" 
            value={employee.tier || "—"} 
            icon={<Buildings size={16} />}
          />
          <DetailField 
            label="Nationality" 
            value={employee.nationality} 
            icon={<Globe size={16} />}
          />
        </div>
      </DetailSection>

      {/* Additional Information */}
      <DetailSection 
        title="Additional Information" 
        icon={<Shield size={18} weight="bold" className="text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <DetailField 
            label="Status" 
            value={employee.status || "Active"} 
            icon={<Shield size={16} />}
          />
          <DetailField 
            label="Is Probation" 
            value={employee.isProbation ? "Yes" : "No"} 
            icon={<ClockCounterClockwise size={16} />}
          />
        </div>
      </DetailSection>
    </div>
  );
}