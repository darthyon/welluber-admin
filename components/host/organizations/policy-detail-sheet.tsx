"use client";

import { 
  X, 
  ShieldCheck, 
  TreeStructure, 
  IdentificationCard, 
  Gear, 
  Users, 
  CheckCircle,
  CurrencyCircleDollar,
  Clock,
  Briefcase
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";

interface PolicyDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  onEdit?: () => void;
}

export function PolicyDetailSheet({ isOpen, onClose, policy, groups, benefits, onEdit }: PolicyDetailSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-zinc-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-zinc-200">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <ShieldCheck size={28} weight="duotone" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{policy.name}</h3>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">{policy.code}</span>
                 <div className="w-1 h-1 rounded-full bg-zinc-300" />
                 <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[10px] tracking-wider h-5">
                   {policy.status}
                 </Badge>
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={22} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-10">
          {/* Section 1: Overview & Rules */}
          <section className="space-y-6">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Policy Rules & Lifecycle</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <RuleItem icon={Users} label="Target Workforce" value={policy.eligibility.roles.length > 0 ? policy.eligibility.roles.join(", ") : "All Roles"} />
              <RuleItem icon={Briefcase} label="Employment" value={policy.eligibility.employeeTypes.join(", ")} />
              <RuleItem icon={CurrencyCircleDollar} label="Pool Type" value={`${policy.benefitPoolType.employee} Pool`} />
              <RuleItem icon={Gear} label="Allocation" value={policy.utilisationMode} />
              <RuleItem icon={Clock} label="Refresh Cycle" value={policy.refreshCycle} />
              <RuleItem icon={CheckCircle} label="Activation" value={policy.activationMode === "JoinDate" ? "Immediately" : policy.activationMode} />
            </div>
          </section>

          {/* Section 2: Benefit Structure (Groups > Benefits) */}
          <section className="space-y-6">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Nested Benefit Structure</h4>
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-primary shadow-sm">
                        <TreeStructure size={20} weight="duotone" />
                      </div>
                      <div>
                        <h5 className="text-[15px] font-bold text-zinc-900">{group.name}</h5>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{group.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[13px] font-bold text-primary">
                         {group.distributionType === "SharedAmount" ? `€${group.maxUsagePerCycle?.toFixed(2)} Shared` : "Individual Per Service"}
                       </p>
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">Budget Logic</p>
                    </div>
                  </div>

                  {/* Benefits in Group */}
                  <div className="space-y-2 pt-4 border-t border-zinc-200/50">
                    {benefits.filter(b => b.groupId === group.id).map((benefit) => (
                      <div key={benefit.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100 transition-all hover:border-primary/20">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                             <IdentificationCard size={16} weight="duotone" />
                           </div>
                           <div>
                             <p className="text-[13px] font-bold text-zinc-800">Benefit ID: {benefit.serviceId}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                               {benefit.coPayment.required && (
                                 <Badge variant="outline" className="text-[9px] h-4 bg-rose-50 text-rose-600 border-rose-100 px-1 font-bold">
                                   CO-PAY ACTIVE
                                 </Badge>
                               )}
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[14px] font-bold text-zinc-900">€{benefit.amount.toFixed(2)}</p>
                           <p className="text-[10px] text-zinc-400 font-medium">Assigned Amount</p>
                        </div>
                      </div>
                    ))}
                    {benefits.filter(b => b.groupId === group.id).length === 0 && (
                      <p className="text-center py-4 text-[12px] text-zinc-400 italic">No services linked to this group.</p>
                    )}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-12 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                  <TreeStructure size={48} className="text-zinc-200 mx-auto mb-3" />
                  <p className="text-[14px] font-medium text-zinc-400">No benefit groups configured for this policy.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-zinc-100 flex items-center gap-4 bg-zinc-50/20 sticky bottom-0 z-10">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-12 border-zinc-200 font-bold"
            onClick={onClose}
          >
            Close View
          </Button>
          <Button 
            className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
            onClick={() => {
              if (onEdit) {
                onEdit();
                onClose();
              }
            }}
          >
            Edit Policy Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}

function RuleItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1.5 p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={14} weight="bold" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="text-[13px] font-bold text-zinc-800 truncate">{value}</p>
    </div>
  );
}
