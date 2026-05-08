"use client";

import { useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, NavigationArrow, Barbell, Brain, Circle, PencilSimpleLine, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { PolicyWizardContent } from "@/components/host/policies/policy-wizard-content";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data";

const ICON_MAP: Record<string, React.ElementType> = {
  Barbell, Brain, Circle, PencilSimpleLine,
};

const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
  { id: "groups-services", label: "Benefit Groups" },
];

function NewPolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { templates: policyTemplates, isLoading: templatesLoading } = usePolicyTemplates();

  const templateId = searchParams.get("template");
  const cloneId = searchParams.get("clone");
  const selectedTemplate = policyTemplates.find((t) => t.id === templateId);
  const cloneSource = MOCK_POLICIES.find((policy) => policy.id === cloneId);

  const initialData = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("policy-draft");
      if (stored) {
        try { return JSON.parse(stored) as { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }; }
        catch { /* fall through */ }
      }
    }

    if (cloneSource) {
      const sourceData = MOCK_POLICY_DATA_MAP[cloneSource.id];
      if (!sourceData) return undefined;

      const idMap = new Map<string, string>();
      const newGroups: BenefitGroup[] = sourceData.groups.map((group) => {
        const newId = `${group.id}-new`;
        idMap.set(group.id, newId);
        return { ...group, id: newId, policyId: "temp" };
      });

      const newBenefits: Benefit[] = sourceData.benefits.map((benefit) => ({
        ...benefit,
        id: `${benefit.id}-new`,
        groupId: idMap.get(benefit.groupId) || benefit.groupId,
      }));

      return {
        policy: {
          ...cloneSource,
          id: undefined,
          name: "",
          status: "draft" as const,
          clonedFrom: cloneSource.id,
        },
        groups: newGroups,
        benefits: newBenefits,
      };
    }

    if (!selectedTemplate) return undefined;
    const prefill = selectedTemplate.prefill;
    const idMap = new Map<string, string>();
    const newGroups: BenefitGroup[] = prefill.groups.map((g) => {
      const newId = `${g.id}-new`;
      idMap.set(g.id, newId);
      return { ...g, id: newId, policyId: "temp" };
    });
    const newBenefits: Benefit[] = prefill.benefits.map((b) => ({
      ...b,
      id: `${b.id}-new`,
      groupId: idMap.get(b.groupId) || b.groupId,
    }));
    return {
      policy: {
        name: prefill.name || "",
        description: prefill.description || "",
        eligibleEmploymentTypes: [...prefill.eligibleEmploymentTypes],
        coversDependents: prefill.coversDependents,
        benefitPoolType: prefill.benefitPoolType,
        utilisationMode: prefill.utilisationMode,
        refreshCycle: prefill.refreshCycle,
        refreshStartReference: prefill.refreshStartReference,
        activationMode: prefill.activationMode,
        templateId: selectedTemplate.id,
        status: "draft" as const,
      },
      groups: newGroups,
      benefits: newBenefits,
    };
  }, [cloneSource, selectedTemplate]);

  const handleReview = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-draft", JSON.stringify(data));
    }
    router.push("/policies/new/review");
  };

  if (templateId && templatesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading template...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Back to Policies
              </button>
              <div>
                <h1 className="text-heading font-semibold text-foreground text-balance">
                  Add Benefit Policy
                </h1>
                <p className="text-subtle text-body mt-1">
                  Define eligibility rules, pool strategies, and service groups for your workforce.
                </p>
              </div>
            </div>

            {/* Selected template bar */}
            {cloneSource ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03]">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Copy size={16} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">Cloned from {cloneSource.name}</p>
                  <p className="text-micro text-muted-foreground">Policy settings copied. Name and assignments are reset.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : selectedTemplate ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03]">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  {(() => {
                    const Icon = ICON_MAP[selectedTemplate.icon] || Circle;
                    return <Icon size={16} weight="duotone" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">{selectedTemplate.name}</p>
                  <p className="text-micro text-muted-foreground">Template applied. You can edit all fields below.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/20">
                <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
                  <PencilSimpleLine size={16} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">Manual Policy Setup</p>
                  <p className="text-micro text-muted-foreground">Build your own policy with custom services and amounts.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            )}

            <PolicyWizardContent
              mode="create"
              initialData={initialData}
              onReview={handleReview}
              onSubmit={handleReview}
            />

            {/* Sticky Action Bar */}
            <div className="sticky bottom-8 z-50 mx-auto flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out w-fit">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-body font-medium px-6 transition-colors"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <div className="w-px h-6 bg-border/40" />
              <Button
                type="submit"
                form="policyWizardForm"
                size="lg"
                className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Review
                <NavigationArrow size={14} weight="bold" className="rotate-90" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={null}>
      <NewPolicyForm />
    </Suspense>
  );
}
