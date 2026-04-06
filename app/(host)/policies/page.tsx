"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import { 
  Plus, 
  TreeStructure, 
  IdentificationCard, 
  Copy, 
  MagnifyingGlass, 
  Funnel,
  Briefcase,
  Users,
  Calendar
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select";

// ─── Taxonomy Data ───────────────────────────────────────────────────────────
const SERVICE_TAXONOMY = [
  { category: "Fitness & Exercise", services: ["Gym Access", "Personal Training", "Fitness Classes", "Swimming", "Martial Arts"] },
  { category: "Massage & Bodywork", services: ["Traditional Massage", "Therapeutic Massage", "Reflexology"] },
  { category: "Mental Health", services: ["Therapy & Counselling", "Life Coaching", "Meditation"] },
  { category: "Medical & Allied Health", services: ["Physiotherapy", "Chiropractic", "Health Screening"] },
];

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
const ROLES = ["Executive", "Management", "Staff", "Consultant", "Intern"];
const AGE_RANGES = ["18-25", "26-35", "36-45", "46-55", "56+"];

export default function PoliciesPage() {
  const [wizardStatus, setWizardStatus] = useQueryState("wizard");
  const [wizardMode, setWizardMode] = useQueryState("mode");
  const [activePolicyId, setActivePolicyId] = useQueryState("policyId");
  const updateQueryParams = useUpdateQueryParams();

  const showWizard = wizardStatus === "open";
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  
  // Mock policies list
  const [policies, setPolicies] = useState<any[]>([
    { id: "1", name: "Standard Health 2026", code: "BEN-STD-01", description: "Comprehensive wellness policy for all full-time staff.", utilisationMode: "Fixed", status: "Published" },
    { id: "2", name: "Executive Wellness", code: "BEN-EXC-02", description: "Premium tier benefits including specialized clinical therapy.", utilisationMode: "Prorated", status: "Published" },
  ]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedAge, setSelectedAge] = useState("All Ages");

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.code.toLowerCase().includes(searchQuery.toLowerCase());
      // In a real app, service filtering would check p.benefits
      return matchesSearch;
    });
  }, [policies, searchQuery]);

  // Synchronize selectedPolicy with activePolicyId
  useEffect(() => {
    if (activePolicyId) {
      const policy = policies.find(p => p.id === activePolicyId);
      if (policy) {
        setSelectedPolicy({ policy, groups: [], benefits: [] });
      }
    } else if (!wizardMode || wizardMode === "create") {
      // If no ID but in create mode, keep selectedPolicy as it is (might be a clone)
    } else {
      setSelectedPolicy(null);
    }
  }, [activePolicyId, policies, wizardMode]);

  const handleClone = (e: React.MouseEvent, policy: any) => {
    e.stopPropagation();
    const clonedPolicy = {
      ...policy,
      id: undefined,
      name: `${policy.name} (Clone)`,
      code: `${policy.code}-CLONE`,
      status: "Draft",
    };
    setSelectedPolicy({ policy: clonedPolicy, groups: [], benefits: [] });
    updateQueryParams({
      mode: "create",
      wizard: "open",
      policyId: null
    });
  };

  const handleCreateNew = () => {
    setSelectedPolicy(null);
    updateQueryParams({
      mode: "create",
      wizard: "open",
      policyId: null
    });
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-white">
        <BenefitPolicyWizard 
          mode={wizardMode as any || "create"}
          initialData={selectedPolicy}
          onCancel={() => {
            updateQueryParams({
              wizard: null,
              mode: null,
              policyId: null
            });
          }}
          onSuccess={(newData) => {
            if (wizardMode === "create") {
              const newPolicy = {
                ...newData.policy,
                id: Math.random().toString(36).substr(2, 9),
              };
              setPolicies([...policies, newPolicy]);
            }
            updateQueryParams({
              wizard: null,
              mode: null,
              policyId: null
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-sans">Benefit Policies</h1>
          <p className="text-zinc-500 text-[14px] mt-1.5 max-w-lg">
            Design and oversee flexible benefit structures for your workforce. Define eligibility, pool strategies, and individual service rules.
          </p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 flex items-center gap-2 h-11 shadow-sm font-bold"
        >
          <Plus size={18} weight="bold" />
          Create New Policy
        </Button>
      </div>

      {/* Tactical Triage Toolbar (Filters) */}
      <div className="mb-8 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-wrap items-center gap-2 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search policies or benefit IDs..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-100 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-[200px]">
          <SectionedSearchSelect 
            taxonomy={SERVICE_TAXONOMY}
            value={selectedService}
            onChange={setSelectedService}
            placeholder="Filter by Service..."
            className="h-9"
          />
        </div>

        <select 
          className="h-9 px-3 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium outline-none text-zinc-600 focus:border-primary/30"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option>All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>

        <select 
          className="h-9 px-3 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium outline-none text-zinc-600 focus:border-primary/30"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option>All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>

        <select 
          className="h-9 px-3 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium outline-none text-zinc-600 focus:border-primary/30"
          value={selectedAge}
          onChange={(e) => setSelectedAge(e.target.value)}
        >
          <option>All Ages</option>
          {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
        </select>

        <div className="w-px h-6 bg-zinc-200 mx-1" />

        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-zinc-400 hover:text-zinc-900">
          <Funnel size={18} />
        </Button>
      </div>

      {filteredPolicies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center rounded-[32px] border border-dashed border-zinc-200 bg-zinc-50/50 p-12">
          <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-zinc-200/50 flex items-center justify-center text-primary mb-8 border border-zinc-100 animate-in fade-in zoom-in-95 duration-700">
            <TreeStructure size={48} weight="duotone" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">No policies found</h3>
          <p className="text-zinc-500 mt-2 max-w-sm text-[15px]">
            Adjust your filters or create a new policy to get started.
          </p>
          <Button 
            variant="outline" 
            onClick={handleCreateNew}
            className="mt-8 rounded-full px-8 h-12 border-zinc-200 text-zinc-600 hover:bg-white hover:text-primary hover:border-primary/30 transition-all font-bold"
          >
            Launch Wizard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredPolicies.map((p) => (
             <div 
               key={p.id} 
               onClick={() => { 
                 updateQueryParams({
                   policyId: p.id,
                   mode: "view",
                   wizard: "open"
                 });
               }}
               className="group p-6 rounded-[24px] border border-zinc-200 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
             >
                <div className="flex items-start justify-between mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                     <IdentificationCard size={24} weight="duotone" />
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={(e) => handleClone(e, p)}
                       className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all"
                       title="Clone Policy"
                     >
                       <Copy size={16} weight="bold" />
                     </button>
                     <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                       {p.status}
                     </div>
                   </div>
                </div>
                
                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-primary transition-colors">{p.name}</h4>
                <p className="text-[12px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">{p.code}</p>
                <p className="text-[13px] text-zinc-500 mt-4 line-clamp-2 leading-relaxed">
                  {p.description || "No description provided."}
                </p>
                
                <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400 overflow-hidden shadow-sm">
                         <img src={`https://i.pravatar.cc/100?img=${parseInt(p.id) + i + 10}`} alt="User" />
                       </div>
                     ))}
                     <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[9px] font-bold text-zinc-500 shadow-sm">+12</div>
                   </div>
                   <div className="text-right">
                      <p className="text-[14px] font-bold text-zinc-900">RM {p.utilisationMode === "Fixed" ? "2,400.00" : "Prorated"}</p>
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
