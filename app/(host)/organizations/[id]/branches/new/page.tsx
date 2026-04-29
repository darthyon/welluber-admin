"use client";

import { useParams, useRouter } from "next/navigation";
import { BranchForm } from "@/components/host/organizations/branch-form";

export default function NewBranchPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  return (
    <div className="pb-12">
      <BranchForm
        onCancel={() => router.back()}
        onSubmit={() => router.push(`/organizations/${orgId}?tab=branches`)}
      />
    </div>
  );
}
