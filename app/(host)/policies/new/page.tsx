"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, NavigationArrow, Barbell, Brain, Circle, PencilSimpleLine } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { SuccessModal } from "@/components/shared/success-modal";
import { toast } from "sonner";
import { PolicyWizardContent, PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";

const ICON_MAP: Record<string, React.ElementType> = {
  Barbell, Brain, Circle, PencilSimpleLine,
};

const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
  { id: "groups-services", label: "Groups & Services" },
];

function NewPolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { templates: policyTemplates, isLoading: templatesLoading } = usePolicyTemplates();

  const templateId = searchParams.get("template");
  const selectedTemplate = policyTemplates.find((t) => t.id === templateId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);
  const [createdPolicyName, setCreatedPolicyName] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState<{ policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] } | null>(null);

  const initialData = useMemo(() => {
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
        benefitPoolType: prefill.benefitPoolType,
        utilisationMode: prefill.utilisationMode,
        refreshCycle: prefill.refreshCycle,
        refreshStartReference: prefill.refreshStartReference,
        templateId: selectedTemplate.id,
        status: "draft" as const,
      },
      groups: newGroups,
      benefits: newBenefits,
    };
  }, [selectedTemplate]);

  const handleReview = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    setReviewData(data);
    setShowReview(true);
  };

  const handleConfirmCreate = async () => {
    if (!reviewData) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newId = Math.random().toString(36).substr(2, 9);
    setIsSubmitting(false);
    setCreatedPolicyId(newId);
    setCreatedPolicyName(reviewData.policy.name || "New Policy");
    setShowReview(false);
    toast.success("Policy created successfully");
    setShowSuccess(true);
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
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1">
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
                  Create Benefit Policy
                </h1>
                <p className="text-subtle text-body mt-1">
                  Define eligibility rules, pool strategies, and service groups for your workforce.
                </p>
              </div>
            </div>

            {/* Selected template bar */}
            {selectedTemplate ? (
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
                  <p className="text-label font-semibold text-foreground">Start from Scratch</p>
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
              onSubmit={handleConfirmCreate}
            />

            {/* Floating Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
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
                disabled={isSubmitting}
                size="lg"
                className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Policy
                    <NavigationArrow size={14} weight="bold" className="rotate-90" />
                  </>
                )}
              </Button>
            </div>

            {/* Spacer */}
            <div className="h-[60vh]" />
          </div>
        </div>
      </div>

      {/* Review Confirmation Modal */}
      {showReview && reviewData && (
        <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95 flex flex-col">
            <div className="p-8 pb-4 shrink-0">
              <h3 className="text-heading font-semibold text-foreground text-balance">Review & Confirm</h3>
              <p className="text-body font-medium text-subtle mt-1">
                Verify your configuration before creating the policy.
              </p>
            </div>

            <div className="px-8 pb-2 overflow-y-auto">
              <PolicyReviewCards
                policy={reviewData.policy}
                groups={reviewData.groups}
                benefits={reviewData.benefits}
              />
            </div>

            <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4 shrink-0">
              <Button
                type="button"
                variant="ghost"
                className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted"
                onClick={() => setShowReview(false)}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 rounded-lg font-semibold shadow-lg shadow-primary/20"
                disabled={isSubmitting}
                onClick={handleConfirmCreate}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Confirm & Create
                    <NavigationArrow size={14} weight="bold" className="ml-2 rotate-90" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Created"
        message={`${createdPolicyName} has been saved as a draft.`}
        primaryAction={{
          label: "Configure Tiers",
          onClick: () => {
            setShowSuccess(false);
            if (createdPolicyId) {
              router.push(`/policies?policyId=${createdPolicyId}&mode=view&wizard=open`);
            } else {
              router.push("/policies");
            }
          },
        }}
        secondaryAction={{
          label: "Done",
          onClick: () => {
            setShowSuccess(false);
            router.push("/policies");
          },
        }}
      />
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
