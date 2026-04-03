"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  MagnifyingGlass, 
  IdentificationCard,
  X,
  Buildings,
  CheckCircle,
  Plus
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PolicyOption {
  id: string;
  name: string;
  code: string;
  description: string;
}

const GLOBAL_POLICIES: PolicyOption[] = [
  { id: "pol_1", name: "Executive Health Plus", code: "WP-EXE-2026", description: "Comprehensive wellness policy with full health screening and premium gym access." },
  { id: "pol_2", name: "Standard Workforce Pool", code: "WP-STD-2026", description: "Standard benefits for full-time employees including basic outpatient and dental." },
  { id: "pol_3", name: "Remote Flex Benefits", code: "WP-RMT-2026", description: "Tailored for remote workers with lifestyle co-working and equipment allowances." },
];

interface LinkPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (policyId: string) => void;
}

export function LinkPolicyModal({ isOpen, onClose, onLink }: LinkPolicyModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPolicies = GLOBAL_POLICIES.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200/50 animate-in zoom-in-95 duration-300">
        <div className="p-8 pb-4 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200/60">
               <ShieldCheck size={24} weight="duotone" />
             </div>
             <div>
               <h3 className="text-[18px] font-bold text-zinc-900 tracking-tight">Link Benefit Policy</h3>
               <p className="text-[13px] text-zinc-500 font-medium">Assign a policy to this organization</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-8 pt-6 space-y-6">
          <div className="relative group">
            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by policy name or code..."
              className="w-full h-12 pl-11 pr-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredPolicies.map((policy) => {
              const isSelected = selectedId === policy.id;
              return (
                <div 
                  key={policy.id}
                  onClick={() => setSelectedId(policy.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    isSelected 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                        isSelected ? "bg-primary text-white border-primary" : "bg-zinc-100 text-zinc-400 border-zinc-200 group-hover:bg-zinc-200"
                      )}>
                        <IdentificationCard size={20} weight={isSelected ? "fill" : "duotone"} />
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-[14px] font-bold transition-colors", isSelected ? "text-primary" : "text-zinc-900")}>
                          {policy.name}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest leading-none">
                          {policy.code}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle size={20} weight="fill" className="text-primary animate-in zoom-in-50" />
                    )}
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-3 leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              );
            })}
            {filteredPolicies.length === 0 && (
              <div className="text-center py-10 text-zinc-400 space-y-2">
                <MagnifyingGlass size={32} className="mx-auto opacity-20" />
                <p className="text-[13px] font-medium">No matching policies found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 pt-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-12 border-zinc-200 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) {
                onLink(selectedId);
                onClose();
              }
            }}
          >
            Assign Policy
          </Button>
        </div>
      </div>
    </div>
  );
}
