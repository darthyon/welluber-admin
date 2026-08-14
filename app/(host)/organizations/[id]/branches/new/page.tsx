"use client";

import { useParams, useRouter } from "next/navigation";
import { BranchForm } from "@/components/host/organizations/branch-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Buildings } from "@phosphor-icons/react";
import { MOCK_ORGS } from "@/lib/mock-data";

export default function NewBranchPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const returnHref = `/organizations/${encodeURIComponent(orgId)}?tab=branches`;

  if (!MOCK_ORGS.some((organization) => organization.id === orgId)) {
    return (
      <EmptyState
        isPageLevel
        icon={<Buildings size={48} weight="duotone" />}
        title="Organisation Not Found"
        description="The organisation for this branch could not be loaded."
        action={
          <Button className="rounded-4xl" onClick={() => router.push("/organizations")}>
            Back To Organisations
          </Button>
        }
      />
    );
  }

  return (
    <div className="pb-12">
      <BranchForm
        onCancel={() => router.push(returnHref)}
        onSubmit={() => router.push(returnHref)}
      />
    </div>
  );
}
