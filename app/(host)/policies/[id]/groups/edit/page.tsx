"use client";

import { useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, NavigationArrow } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PolicyWizardContent } from "@/components/host/policies/policy-wizard-content";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";

export default function EditGroupsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const draftKey = `policy-groups-draft-${id}`;

  const initialData = useMemo<{ policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] } | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const stored = sessionStorage.getItem(draftKey);
    if (!stored) return undefined;
    try { return JSON.parse(stored); }
    catch { return undefined; }
  }, [draftKey]);

  const handleSave = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(draftKey);
    }
    router.push(`/policies?policyId=${id}&mode=view&wizard=open`);
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col gap-12 lg:gap-16 items-start">
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
                  Edit Benefit Groups
                </h1>
                <p className="text-subtle text-body mt-1">
                  Manage groups and services for this policy.
                </p>
              </div>
            </div>

            <PolicyWizardContent
              mode="edit"
              groupsOnly
              initialData={initialData}
              onSubmit={handleSave}
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
                Save Groups
                <NavigationArrow size={14} weight="bold" className="rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
