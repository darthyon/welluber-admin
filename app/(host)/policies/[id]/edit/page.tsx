"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function EditPolicyPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [updatedPolicyName, setUpdatedPolicyName] = useState("");

  // TODO: Fetch actual policy data by params.id
  // For now, empty initialData means the form starts blank in edit mode
  const initialData = undefined;

  const handleSubmit = async (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setUpdatedPolicyName(data.policy.name || "Policy");
    toast.success("Policy updated successfully");
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
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Back
              </button>
              <div>
                <h1 className="text-heading font-semibold text-foreground text-balance">
                  Edit Benefit Policy
                </h1>
                <p className="text-subtle text-body mt-1">
                  Update eligibility rules, pool strategies, and service groups.
                </p>
              </div>
            </div>

            <PolicyWizardContent mode="edit" initialData={initialData} onSubmit={handleSubmit} />

            {/* Floating Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
              <Button
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
                    Saving...
                  </>
                ) : (
                  <>
                    Save Changes
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
        title="Policy Updated"
        message={`${updatedPolicyName} has been updated successfully.`}
        primaryAction={{
          label: "View Policy",
          onClick: () => {
            setShowSuccess(false);
            router.push(`/policies`);
          },
        }}
        secondaryAction={{
          label: "Back to Policies",
          onClick: () => {
            setShowSuccess(false);
            router.push("/policies");
          },
        }}
      />
    </div>
  );
}
