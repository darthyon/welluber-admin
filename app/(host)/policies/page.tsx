"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { BenefitPolicyWizard } from "@/components/host/policies/benefit-policy-wizard";
import { BenefitPolicyCard } from "@/components/host/policies/benefit-policy-card";
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
  Calendar,
  DownloadSimple
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select";
import { EmptyState } from "@/components/shared/empty-state";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { StatusBadge } from "@/components/shared/status-badge";

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

function PoliciesContent() {
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
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDept === "all" || false; // Mock filtering logic
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
      <div className="flex flex-col flex-1">
        <BenefitPolicyWizard 
          mode={wizardMode as any || "create"}
          initialData={selectedPolicy}
          onEdit={() => setWizardMode("edit")}
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
            } else if (wizardMode === "edit") {
              setPolicies(prev => prev.map(p => p.id === activePolicyId ? { ...p, ...newData.policy } : p));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Benefit Policies</h1>
          <p className="text-muted-foreground text-nav mt-1 font-normal opacity-80">
            Design and oversee flexible benefit structures for your workforce. Define eligibility, pool strategies, and individual service rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-9 text-nav font-medium border-border/60 hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <Button 
            onClick={handleCreateNew}
            className="h-9 text-nav font-medium shadow-sm"
          >
            <Plus size={16} weight="bold" className="mr-1.5" />
            Create New Policy
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search policies or benefit IDs..."
        filters={
          <>
            <div className="w-[180px]">
              <SectionedSearchSelect 
                taxonomy={SERVICE_TAXONOMY}
                value={selectedService}
                onChange={setSelectedService}
                placeholder="Filter by Service..."
                className="h-9"
              />
            </div>

            <FilterItem 
              label="Dept"
              value={selectedDept}
              onChange={setSelectedDept}
              options={[
                { label: "All Departments", value: "all" },
                ...DEPARTMENTS.map(d => ({ label: d, value: d }))
              ]}
            />

            <FilterItem 
              label="Role"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { label: "All Roles", value: "all" },
                ...ROLES.map(r => ({ label: r, value: r }))
              ]}
            />

            <FilterItem 
              label="Age"
              value={selectedAge}
              onChange={setSelectedAge}
              options={[
                { label: "All Ages", value: "all" },
                ...AGE_RANGES.map(a => ({ label: a, value: a }))
              ]}
            />
          </>
        }
      />

      {filteredPolicies.length === 0 ? (
        <EmptyState 
          isPageLevel
          icon={<TreeStructure size={48} weight="duotone" />}
          title="No policies found"
          description="Design and oversee flexible benefit structures for your workforce. Adjust your filters or create a new policy to get started."
          action={
            <Button 
              variant="outline" 
              onClick={handleCreateNew}
              className="mt-8 px-6 h-10 border-border text-foreground hover:bg-white hover:text-primary hover:border-primary/30 transition-all font-medium shadow-sm"
            >
              Launch Wizard
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredPolicies.map((p) => (
             <BenefitPolicyCard 
               key={p.id}
               policy={p}
               onView={(id) => {
                 updateQueryParams({
                   policyId: id,
                   mode: "view",
                   wizard: "open"
                 });
               }}
               onClone={handleClone}
             />
           ))}
        </div>
      )}
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={null}>
      <PoliciesContent />
    </Suspense>
  );
}
