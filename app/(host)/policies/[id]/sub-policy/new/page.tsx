"use client";

import { useRouter } from "next/navigation";
import { CaretLeft, TreeStructure } from "@phosphor-icons/react";
import { SubPolicyWizard } from "@/components/host/policies/sub-policy-wizard";
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data";
import { MOCK_ORGS } from "@/lib/mock-data";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";

export default function NewSubPolicyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const parentId = params.id;

  const parent = MOCK_POLICIES.find(p => p.id === parentId);
  const parentData = MOCK_POLICY_DATA_MAP[parentId];

  if (!parent || !parentData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-heading font-semibold text-foreground">Parent policy not found.</p>
        <p className="text-body text-muted-foreground mt-1">The policy you&apos;re trying to extend doesn&apos;t exist.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-body font-medium text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const org = MOCK_ORGS.find(o => o.id === parent.organizationId);
  const orgEmployees = MOCK_EMPLOYEES.filter(e => e.orgId === parent.organizationId);
  const orgTierConfigs = org?.tierConfigs ?? [];

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
        >
          <CaretLeft size={16} /> Back
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <TreeStructure size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">
              Create Sub-Policy
            </h1>
            <p className="text-body text-muted-foreground mt-0.5 font-normal">
              Derived from{" "}
              <span className="font-semibold text-foreground">{parent.name}</span>
              {org && <span> · {org.name}</span>}
            </p>
          </div>
        </div>
      </div>

      <SubPolicyWizard
        parentPolicy={parent}
        parentGroups={parentData.groups}
        parentBenefits={parentData.benefits}
        employees={orgEmployees}
        orgTierConfigs={orgTierConfigs}
        onSuccess={() =>
          router.push(`/policies?policyId=${parentId}&mode=view&wizard=open`)
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
