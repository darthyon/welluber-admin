"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard";
import { Plus, TreeStructure, IdentificationCard, Gear, ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function PoliciesPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]); // Mock policies list

  if (showWizard) {
    return (
      <div className="min-h-screen bg-white">
        <BenefitPolicyWizard 
          onCancel={() => setShowWizard(false)}
          onSuccess={(newPolicy) => {
            setPolicies([...policies, newPolicy]);
            setShowWizard(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Benefit Policies</h1>
          <p className="text-zinc-500 text-[14px] mt-1.5 max-w-lg">
            Design and oversee flexible benefit structures for your workforce. Define eligibility, pool strategies, and individual service rules.
          </p>
        </div>
        <Button 
          onClick={() => setShowWizard(true)}
          className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 flex items-center gap-2 h-11 shadow-sm"
        >
          <Plus size={18} weight="bold" />
          Create New Policy
        </Button>
      </div>

      {policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center rounded-[32px] border border-dashed border-zinc-200 bg-zinc-50/50 p-12">
          <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-zinc-200/50 flex items-center justify-center text-primary mb-8 border border-zinc-100 animate-in fade-in zoom-in-95 duration-700">
            <TreeStructure size={48} weight="duotone" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">No policies configured yet</h3>
          <p className="text-zinc-500 mt-2 max-w-sm text-[15px]">
            Ready to design your first benefit structure? Get started by creating a policy tailored to your organization.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setShowWizard(true)}
            className="mt-8 rounded-full px-8 h-12 border-zinc-200 text-zinc-600 hover:bg-white hover:text-primary hover:border-primary/30 transition-all font-bold"
          >
            Launch Wizard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {policies.map((policy, idx) => (
             <div key={idx} className="group p-6 rounded-[24px] border border-zinc-200 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                     <IdentificationCard size={24} weight="duotone" />
                   </div>
                   <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                     Active
                   </div>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-primary transition-colors">{policy.name}</h4>
                <p className="text-[12px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">{policy.code}</p>
                <p className="text-[13px] text-zinc-500 mt-4 line-clamp-2 leading-relaxed">
                  {policy.description || "No description provided."}
                </p>
                
                <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400 overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                       </div>
                     ))}
                     <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[9px] font-bold text-zinc-500">+12</div>
                   </div>
                   <div className="text-right">
                      <p className="text-[14px] font-bold text-zinc-900">€{policy.utilisationMode === "Fixed" ? "2,400.00" : "Prorated"}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Budget Pool</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
