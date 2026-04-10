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
    <div className="fixed inset-0 z-[110] flex justify-end bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-border">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <ShieldCheck size={28} weight="duotone" />
             </div>
             <div>
               <h3 className="text-heading font-semibold text-foreground tracking-tight">{policy.name}</h3>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-caption font-mono text-muted-foreground/50 tracking-tight leading-none">{policy.code}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                 <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold text-micro tracking-wider h-5">
                   {policy.status}
                 </Badge>
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-muted rounded-full transition-colors group">
            <X size={22} className="text-muted-foreground/50 group-hover:text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-10">
          {/* Section 1: Overview & Rules */}
          <section className="space-y-6">
            <h4 className="text-caption font-semibold text-muted-foreground">Policy rules & lifecycle</h4>
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
            <h4 className="text-caption font-semibold text-muted-foreground">Nested benefit structure</h4>
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-zinc-100 bg-muted/50 p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-primary shadow-sm">
                        <TreeStructure size={20} weight="duotone" />
                      </div>
                      <div>
                        <h5 className="text-subtitle font-semibold text-foreground">{group.name}</h5>
                        <p className="text-label text-muted-foreground mt-0.5">{group.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-nav font-semibold text-primary">
                         {group.distributionType === "SharedAmount" ? `€${group.maxUsagePerCycle?.toFixed(2)} Shared` : "Individual Per Service"}
                       </p>
                       <p className="text-micro text-muted-foreground/40 font-semibold tracking-tight mt-0.5">Budget logic</p>
                    </div>
                  </div>

                  {/* Benefits in Group */}
                  <div className="space-y-2 pt-4 border-t border-zinc-200/50">
                    {benefits.filter(b => b.groupId === group.id).map((benefit) => (
                      <div key={benefit.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100 transition-all hover:border-primary/20">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/60 border border-zinc-100">
                             <IdentificationCard size={16} weight="duotone" />
                           </div>
                           <div>
                             <p className="text-nav font-semibold text-foreground">Benefit ID: {benefit.serviceId}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                               {benefit.coPayment.required && (
                                 <Badge variant="outline" className="text-micro h-4 bg-rose-50 text-rose-600 border-rose-100 px-1 font-semibold">
                                   Co-pay active
                                 </Badge>
                               )}
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-body font-semibold text-foreground">€{benefit.amount.toFixed(2)}</p>
                           <p className="text-micro text-muted-foreground/60 font-medium">Assigned Amount</p>
                        </div>
                      </div>
                    ))}
                    {benefits.filter(b => b.groupId === group.id).length === 0 && (
                      <p className="text-center py-4 text-label text-muted-foreground/60 italic">No services linked to this group.</p>
                    )}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-12 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                   <TreeStructure size={48} className="text-muted/20 mx-auto mb-3" />
                   <p className="text-body font-medium text-muted-foreground/40">No benefit groups configured for this policy.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-border flex items-center gap-4 bg-muted/30 sticky bottom-0 z-10">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-12 border-border font-semibold hover:bg-muted"
            onClick={onClose}
          >
            Close View
          </Button>
          <Button 
            className="flex-1 rounded-2xl h-12 font-semibold shadow-lg shadow-primary/20"
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
    <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground/30">
        <Icon size={14} weight="bold" />
        <span className="text-micro font-semibold text-muted-foreground/40 leading-none">{label}</span>
      </div>
      <p className="text-nav font-semibold text-foreground truncate">{value}</p>
    </div>
  );
}
