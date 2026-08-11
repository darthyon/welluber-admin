"use client";

import { useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { FormActionBar } from "@/components/shared/form-step-wizard";
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

  const handleSave = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(draftKey);
    }
    router.push(`/policies?policyId=${id}&mode=view&wizard=open`);
  };

  return (
    <div className="pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col gap-12 lg:gap-16 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col gap-6">
            <div>
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

            <FormActionBar
              currentStep={1}
              totalSteps={1}
              mode="edit"
              onCancel={() => router.back()}
              onBack={() => router.back()}
              primaryLabel="Save Changes"
              formId="policyWizardForm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
