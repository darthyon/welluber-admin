"use client";

import { useParams, useRouter } from "next/navigation";
import { BranchForm } from "@/components/host/organizations/branch-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Buildings } from "@phosphor-icons/react";
import { MOCK_ORGS } from "@/lib/mock-data";

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const branchId = params.branchId as string;
  const organization = MOCK_ORGS.find((candidate) => candidate.id === orgId);
  const returnHref = `/organizations/${encodeURIComponent(orgId)}?tab=branches`;

  if (!organization || !organization.branches?.includes(branchId)) {
    return (
      <EmptyState
        isPageLevel
        icon={<Buildings size={48} weight="duotone" />}
        title="Branch Not Found"
        description="The organisation branch could not be loaded."
        action={
          <Button className="rounded-4xl" onClick={() => router.push(returnHref)}>
            Back To Branches
          </Button>
        }
      />
    );
  }

  return (
    <div className="pb-12">
      <BranchForm
        branchId={branchId}
        onCancel={() => router.push(returnHref)}
        onSubmit={() => router.push(returnHref)}
      />
    </div>
  );
}
