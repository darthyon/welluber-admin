"use client";

import { useState } from "react";
import { 
  CaretLeft, 
  User,
  Users,
  Buildings, 
  Shield,
  IdentificationBadge,
  EnvelopeSimple,
  CalendarBlank,
  DotsThreeVertical,
  PencilSimpleLine,
  DeviceMobile,
  Globe,
  ClockCounterClockwise,
  CreditCard,
  CaretDown,
  Storefront,
  MapPin,
  Calendar,
} from "@phosphor-icons/react";
import { type Claim } from "@/components/shared/utilisation-claims-table";

import { Button } from "@/components/ui/button";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { ActionPopover } from "@/components/shared/action-popover";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

interface EmployeeDetailViewProps {
  employeeId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export function EmployeeDetailView({ employeeId, onBack, onEdit }: EmployeeDetailViewProps) {
  // Mock Employee Data
  const employeeData = {
    id: employeeId,
    name: "Robert Fox",
    email: "robert.fox@acme.com",
    avatar: "RF",
    status: "Linked",
    empCode: "EMP-001",
    externalId: "EXT-88291",
    joinDate: "12 Oct 2023",
    branch: "ACME HQ (Kuala Lumpur)",
    workType: "Full-time",
    department: "Engineering",
    designation: "Senior Software Engineer",
    mobile: "+60 12-345 6789",
    nationality: "Malaysian",
    benefitPolicies: [
      {
        name: "Wellness Allocation",
        groups: ["Gym Membership", "Mental Health", "Optical"],
        limit: "RM 2,500.00",
        spent: "RM 1,200.00",
        utilisation: 48,
        claims: [
          { id: "c1", voucherCode: "VCH-2024-0081", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC", location: "Kuala Lumpur",  date: "12 Mar 2024", amount: 180, status: "Approved" },
          { id: "c2", voucherCode: "VCH-2024-0114", service: "Clinical Therapy",     provider: "Mind & Soul Clinic",   location: "Mont Kiara",    date: "20 Mar 2024", amount: 320, status: "Approved" },
          { id: "c3", voucherCode: "VCH-2024-0198", service: "Group Fitness",        provider: "Ritual Yoga Studio",   location: "Bangsar",       date: "01 Apr 2024", amount: 95,  status: "Pending"  },
          { id: "c4", voucherCode: "VCH-2024-0211", service: "Dietary Counseling",   provider: "NutriCare Clinic",     location: "Damansara",     date: "05 Apr 2024", amount: 605, status: "Approved" },
        ] as Claim[]
      },
      {
        name: "Lifestyle Pocket",
        groups: ["Food & Beverage", "Travel"],
        limit: "RM 1,000.00",
        spent: "RM 850.00",
        utilisation: 85,
        claims: [
          { id: "c5", voucherCode: "VCH-2024-0033", service: "Grab Food Voucher",   provider: "Grab Malaysia",      location: "Online",      date: "03 Jan 2024", amount: 200, status: "Approved" },
          { id: "c6", voucherCode: "VCH-2024-0102", service: "Flight Subsidy",      provider: "AirAsia",           location: "KLIA2",       date: "15 Feb 2024", amount: 450, status: "Approved" },
          { id: "c7", voucherCode: "VCH-2024-0189", service: "Hotel Stay",          provider: "Marriott Putrajaya",location: "Putrajaya",   date: "20 Mar 2024", amount: 200, status: "Pending"  },
        ] as Claim[]
      }
    ],
    auditTrail: [
      { action: "Profile Updated", user: "Admin Sarah", date: "Today, 10:45 AM" },
      { action: "Wallet Topped Up", user: "System", date: "01 Apr 2024, 09:00 AM" },
      { action: "Employee Linked", user: "Host Admin", date: "12 Oct 2023, 02:30 PM" }
    ]
  };

  const [expandedPolicies, setExpandedPolicies] = useState<Set<number>>(new Set());
  const togglePolicy = (idx: number) =>
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const CLAIM_STATUS_STYLE: Record<Claim["status"], string> = {
    Approved: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    Pending:  "bg-amber-50  text-amber-600  border border-amber-100",
    Rejected: "bg-rose-50   text-rose-600   border border-rose-100",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-navigation Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit group"
        >
          <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Employee Directory
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
              {employeeData.avatar}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{employeeData.name}</h2>
                <StatusBadge status={employeeData.status} variant="emerald" />
              </div>
              <p className="text-[14px] text-muted-foreground mt-1 font-medium">
                {employeeData.designation} • {employeeData.department}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
               variant="outline" 
               size="sm" 
               className="h-10 px-4 font-bold border-zinc-200 hover:bg-zinc-50"
               onClick={() => onEdit(employeeId)}
            >
              <PencilSimpleLine size={18} weight="bold" className="mr-2" />
              Edit Employee
            </Button>
            
            <ActionPopover 
              align="end"
              actions={[
                { label: "Reset Password", onClick: () => console.log("Reset Password") },
                { label: "Download Records", onClick: () => console.log("Download Records") },
                { label: "Terminate Link", isDanger: true, onClick: () => console.log("Terminate") },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <DetailSection 
            title="General Information" 
            icon={<User size={18} weight="bold" className="text-primary" />}
          >
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <DetailField 
                label="Full Name" 
                value={employeeData.name} 
                icon={<User size={16} />}
              />
              <DetailField 
                label="Email Address" 
                value={employeeData.email} 
                icon={<EnvelopeSimple size={16} />}
              />
              <DetailField 
                label="Employee ID (System)" 
                value={employeeData.id} 
                icon={<Shield size={16} />}
              />
              <DetailField 
                label="Employee Code" 
                value={employeeData.empCode} 
                icon={<IdentificationBadge size={16} />}
              />
              <DetailField 
                label="External ID" 
                value={employeeData.externalId} 
                icon={<Globe size={16} />}
              />
              <DetailField 
                label="Mobile Number" 
                value={employeeData.mobile} 
                icon={<DeviceMobile size={16} />}
              />
            </div>
          </DetailSection>

          {/* Work Details */}
          <DetailSection 
            title="Employment Details" 
            icon={<Buildings size={18} weight="bold" className="text-primary" />}
          >
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <DetailField 
                label="Branch / Workplace" 
                value={employeeData.branch} 
                icon={<Buildings size={16} />}
              />
              <DetailField 
                label="Join Date" 
                value={employeeData.joinDate} 
                icon={<CalendarBlank size={16} />}
              />
              <DetailField 
                label="Work Type" 
                value={employeeData.workType} 
                icon={<ClockCounterClockwise size={16} />}
              />
              <DetailField 
                label="Nationality" 
                value={employeeData.nationality} 
                icon={<Globe size={16} />}
              />
            </div>
          </DetailSection>

          {/* Wallets & Policies */}
          <DetailSection 
            title="Benefit Allocations" 
            icon={<CreditCard size={18} weight="bold" className="text-primary" />}
          >
            <div className="space-y-4">
              {employeeData.benefitPolicies.map((policy, idx) => {
                const isExpanded = expandedPolicies.has(idx);
                return (
                  <div key={idx} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                    {/* Policy header row */}
                    <button
                      onClick={() => togglePolicy(idx)}
                      className="w-full flex items-center justify-between gap-4 p-4 hover:bg-zinc-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-primary shadow-sm shrink-0">
                          <Shield size={16} weight="fill" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-zinc-900">{policy.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {policy.groups.map((g, i) => (
                              <span key={i} className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-500 font-bold">{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[12px] font-bold text-zinc-900">{policy.spent} / {policy.limit}</div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5 uppercase tracking-wider">Utilised</div>
                        </div>
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className={cn(policy.utilisation > 80 ? "text-rose-500" : "text-primary")}>{policy.utilisation}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", policy.utilisation > 80 ? "bg-rose-500" : "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]")}
                              style={{ width: `${policy.utilisation}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <span className="text-[11px]">{policy.claims.length}</span>
                          <CaretDown size={13} weight="bold" className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                        </div>
                      </div>
                    </button>

                    {/* Claims */}
                    {isExpanded && (
                      <div className="border-t border-zinc-100 bg-zinc-50/60">
                        <div className="grid grid-cols-[120px_1fr_1fr_1fr_100px_80px] gap-3 px-6 py-2 border-b border-zinc-100">
                          {["Voucher", "Service", "Provider", "Location", "Date", "Amount"].map(h => (
                            <p key={h} className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{h}</p>
                          ))}
                        </div>
                        {policy.claims.length === 0 ? (
                          <p className="text-[12px] text-zinc-400 italic px-6 py-4">No claims recorded.</p>
                        ) : policy.claims.map(claim => (
                          <div key={claim.id} className="grid grid-cols-[120px_1fr_1fr_1fr_100px_80px] gap-3 px-6 py-3 border-b border-zinc-100 last:border-0 hover:bg-white transition-colors items-center">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", CLAIM_STATUS_STYLE[claim.status])}>{claim.status}</span>
                              <code className="text-[10px] font-mono text-zinc-600 truncate">{claim.voucherCode}</code>
                            </div>
                            <p className="text-[12px] text-zinc-700 font-medium truncate">{claim.service}</p>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Storefront size={11} className="text-zinc-400 shrink-0" />
                              <p className="text-[12px] text-zinc-600 truncate">{claim.provider}</p>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin size={11} className="text-zinc-400 shrink-0" />
                              <p className="text-[12px] text-zinc-600 truncate">{claim.location}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-zinc-400 shrink-0" />
                              <p className="text-[11px] text-zinc-500 whitespace-nowrap">{claim.date}</p>
                            </div>
                            <p className="text-[12px] font-bold font-mono text-zinc-900 text-right">RM {claim.amount.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DetailSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <DetailSection 
            title="Household" 
            icon={<Users size={18} weight="bold" className="text-primary" />}
          >
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                <Users size={24} />
              </div>
              <h5 className="text-[14px] font-bold text-zinc-900">0 Dependents</h5>
              <p className="text-[12px] text-zinc-500 mt-1 max-w-[180px]">
                No dependents have been added to this employee profile yet.
              </p>
              <Button variant="link" className="text-primary h-auto p-0 mt-4 font-bold text-[13px]">
                Add Dependent
              </Button>
            </div>
          </DetailSection>

          <DetailSection 
            title="Activity Log" 
            icon={<ClockCounterClockwise size={18} weight="bold" className="text-primary" />}
          >
            <div className="space-y-6">
              {employeeData.auditTrail.map((trail, i) => (
                <div key={i} className={cn(
                  "relative pl-6 pb-6 last:pb-0",
                  i !== employeeData.auditTrail.length - 1 && "before:absolute before:left-[1px] before:top-[18px] before:bottom-0 before:w-[1px] before:bg-zinc-100"
                )}>
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-white" />
                  <div className="text-[13px] font-bold text-zinc-900">{trail.action}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    by {trail.user} • {trail.date}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
