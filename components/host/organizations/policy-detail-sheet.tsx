"use client";

import {
  X,
  ShieldCheck,
  TreeStructure,
  IdentificationCard,
  Gear,
  CheckCircle,
  CurrencyCircleDollar,
  Clock,
  Briefcase
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { getMainServiceName } from "@/lib/mock-data/service-catalog";

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
    <div className="fixed inset-0 z-[110] flex justify-end bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-border">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <ShieldCheck size={28} weight="duotone" />
             </div>
             <div>
               <h3 className="text-heading font-semibold text-foreground tracking-tight">{policy.name}</h3>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-label font-mono text-subtle tracking-tight leading-none">{policy.code}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <StatusBadge status={policy.status} variant="emerald" />
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-muted rounded-full transition-colors group" aria-label="Close panel">
            <X size={22} className="text-faint group-hover:text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-10">
          {/* Section 1: Overview & Rules */}
          <section className="space-y-6">
            <h4 className="text-label font-medium text-subtle">Policy rules & lifecycle</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <RuleItem icon={Briefcase} label="Eligible Types" value={policy.eligibleEmploymentTypes?.join(", ") || "—"} />
              <RuleItem icon={CurrencyCircleDollar} label="Pool Type" value={`${policy.benefitPoolType} Pool`} />
              <RuleItem icon={Gear} label="Allocation" value={policy.utilisationMode} />
              <RuleItem icon={Clock} label="Refresh Cycle" value={policy.refreshCycle} />
              <RuleItem icon={CheckCircle} label="Start Reference" value={policy.refreshStartReference === "financial_year" ? "Financial Year" : "Calendar Year"} />
            </div>
          </section>

          {/* Section 2: Benefit Structure (Groups > Benefits) */}
          <section className="space-y-6">
            <h4 className="text-label font-medium text-subtle">Nested benefit structure</h4>
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="rounded-lg border border-border bg-muted/50 p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                        <TreeStructure size={20} weight="duotone" />
                      </div>
                      <div>
                        <h5 className="text-lead font-semibold text-foreground">{group.name}</h5>
                        <p className="text-label text-muted-foreground mt-0.5">{group.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-body font-semibold text-primary">
                         {group.distributionType === "SharedAmount" ? `€${group.maxUsagePerCycle?.toFixed(2)} Shared` : "Individual Per Service"}
                       </p>
                       <p className="text-label text-faint font-medium mt-0.5">Budget logic</p>
                    </div>
                  </div>

                  {/* Benefits in Group */}
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {benefits.filter(b => b.groupId === group.id).map((benefit) => (
                      <div key={benefit.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border transition-all hover:border-primary/20">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-faint border border-border">
                             <IdentificationCard size={16} weight="duotone" />
                           </div>
                           <div>
                              <p className="text-body font-medium text-foreground">{getMainServiceName(benefit.serviceId)}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                               {benefit.coPayment.required && (
                                <StatusBadge status="Co-pay active" variant="rose" className="text-label h-5 px-2" />
                               )}
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-body font-semibold text-foreground">€{benefit.amount.toFixed(2)}</p>
                           <p className="text-label text-faint font-medium">Assigned Amount</p>
                        </div>
                      </div>
                    ))}
                    {benefits.filter(b => b.groupId === group.id).length === 0 && (
                      <p className="text-center py-4 text-label text-faint italic">No services linked to this group.</p>
                    )}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-12 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                   <TreeStructure size={48} className="text-muted/20 mx-auto mb-3" />
                   <p className="text-body font-medium text-faint">No benefit groups configured for this policy.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-border flex items-center gap-4 bg-muted/30 sticky bottom-0 z-10">
          <Button
            variant="ghost"
            className="flex-1 rounded-lg h-12 font-semibold hover:bg-muted"
            onClick={onClose}
          >
            Close View
          </Button>
          <Button 
            className="flex-1 rounded-lg h-12 font-semibold shadow-lg shadow-primary/20"
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

function RuleItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="space-y-1.5 p-3 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 text-faint">
        <Icon size={14} weight="bold" />
        <span className="text-label font-medium text-faint leading-none">{label}</span>
      </div>
      <p className="text-body font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

