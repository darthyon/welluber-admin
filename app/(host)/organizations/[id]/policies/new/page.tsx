"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CaretLeft, NavigationArrow } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { SuccessModal } from "@/components/shared/success-modal";
import { toast } from "sonner";
import { PolicyWizardContent } from "@/components/host/policies/policy-wizard-content";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
  { id: "groups-services", label: "Groups & Services" },
  { id: "review", label: "Review" },
];

export default function NewOrgPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);
  const [createdPolicyName, setCreatedPolicyName] = useState("");

  const handleSubmit = async (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newId = Math.random().toString(36).substr(2, 9);
    setIsSubmitting(false);
    setCreatedPolicyId(newId);
    setCreatedPolicyName(data.policy.name || "New Policy");
    toast.success("Policy created successfully");
    setShowSuccess(true);
  };

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
                onClick={() => router.push(`/organizations/${orgId}?tab=policies`)}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Back to Organisation
              </button>
              <div>
                <h1 className="text-heading font-semibold text-foreground text-balance">
                  Create Benefit Policy
                </h1>
                <p className="text-subtle text-body mt-1">
                  Creating policy for organisation <span className="font-mono text-faint">{orgId}</span>.
                </p>
              </div>
            </div>

            <PolicyWizardContent
              mode="create"
              initialData={{
                policy: {
                  organizationId: orgId,
                  name: "",
                  description: "",
                  eligibleEmploymentTypes: ["full-time"],
                  benefitPoolType: "Individual",
                  utilisationMode: "Fixed",
                  refreshCycle: "Yearly",
                  refreshStartReference: "fy_start",
                  status: "draft",
                },
                groups: [],
                benefits: [],
              }}
              onSubmit={handleSubmit}
            />

            {/* Floating Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
              <Button
                variant="ghost"
                size="lg"
                className="text-body font-medium px-6 transition-colors"
                onClick={() => router.push(`/organizations/${orgId}?tab=policies`)}
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

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Created"
        message={`${createdPolicyName} has been saved as a draft.`}
        primaryAction={{
          label: "View Policy",
          onClick: () => {
            setShowSuccess(false);
            if (createdPolicyId) {
              router.push(`/policies?policyId=${createdPolicyId}&mode=view&wizard=open`);
            } else {
              router.push(`/organizations/${orgId}?tab=policies`);
            }
          },
        }}
        secondaryAction={{
          label: "Done",
          onClick: () => {
            setShowSuccess(false);
            router.push(`/organizations/${orgId}?tab=policies`);
          },
        }}
      />
    </div>
  );
}
