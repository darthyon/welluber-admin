"use client"

import { useParams, useRouter } from "next/navigation"
import { SpBranchForm } from "@/components/host/service-providers/sp-branch-form"
import { MOCK_SPS } from "@/lib/mock-data"

export default function NewServiceProviderBranchPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sp = MOCK_SPS.find((provider) => provider.id === params.id)

  if (!sp) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h1 className="text-heading font-semibold text-foreground">
          Service Provider Not Found
        </h1>
      </div>
    )
  }

  const returnToProvider = () =>
    router.push(`/service-providers/${encodeURIComponent(sp.id)}?tab=branches`)

  return (
    <div className="pb-28">
      <SpBranchForm
        spId={sp.id}
        serviceCategories={sp.serviceCategories}
        mainServices={sp.mainServices}
        portfolio={sp.commissionSchema}
        onSuccess={returnToProvider}
        onCancel={returnToProvider}
      />
    </div>
  )
}
