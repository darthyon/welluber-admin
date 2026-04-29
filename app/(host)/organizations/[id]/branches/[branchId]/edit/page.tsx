"use client";

import { useParams, useRouter } from "next/navigation";
import { BranchForm } from "@/components/host/organizations/branch-form";

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const branchId = params.branchId as string;

  return (
    <div className="pb-12">
      <BranchForm
        branchId={branchId}
        onCancel={() => router.back()}
        onSubmit={() => router.push(`/organizations/${orgId}?tab=branches`)}
      />
    </div>
  );
}
