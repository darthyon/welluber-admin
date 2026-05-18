"use client";

import { useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, NavigationArrow, CaretDown, IdentificationCard } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { PolicyWizardContent, PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";

const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
  { id: "refresh-start", label: "Refresh Start" },
];

export default function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const draftKey = `policy-draft-edit-${id}`;

  const initialData = useMemo<{ policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] } | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const stored = sessionStorage.getItem(draftKey);
    if (!stored) return undefined;
    try { return JSON.parse(stored); }
    catch { return undefined; }
  }, [draftKey]);

  const handleReview = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(draftKey, JSON.stringify(data));
    }
    router.push(`/policies/${id}/edit/review`);
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Navigation */}
        <aside className="hidden xl:flex xl:flex-col w-52 shrink-0 sticky top-20 self-start gap-3">
          {initialData && (
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card text-left hover:bg-muted/20 transition-colors">
                <span className="flex items-center gap-2 text-label font-semibold text-foreground">
                  <IdentificationCard size={14} weight="duotone" className="text-primary" />
                  Policy Summary
                </span>
                <CaretDown size={12} weight="bold" className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <PolicyReviewCards
                    policy={initialData.policy}
                    groups={initialData.groups}
                    benefits={initialData.benefits}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1 min-w-0 w-full">
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

            <PolicyWizardContent
              mode="edit"
              initialData={initialData}
              onReview={handleReview}
              onSubmit={handleReview}
            />

            {/* Sticky Action Bar */}
            <div className="sticky bottom-8 z-50 mx-auto flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out w-fit">
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
