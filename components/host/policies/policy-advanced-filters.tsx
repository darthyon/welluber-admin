"use client"

import { cn } from "@/lib/utils"
import type { BenefitPolicy } from "@/types/policy"
import { FieldLabel, HelpText } from "./wizard-shared-ui"

interface PolicyAdvancedFiltersProps {
  policyData: Partial<BenefitPolicy>
  setPolicyData: React.Dispatch<React.SetStateAction<Partial<BenefitPolicy>>>
}

const GENDER_OPTIONS = ["all", "male", "female"] as const

export function PolicyAdvancedFilters({
  policyData,
  setPolicyData,
}: PolicyAdvancedFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div className="space-y-1.5">
        <FieldLabel>Age Range (Min)</FieldLabel>
        <input
          type="number"
          placeholder="e.g. 18"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
          value={policyData.eligibility?.minAge || ""}
          onChange={(event) =>
            setPolicyData({
              ...policyData,
              eligibility: {
                ...policyData.eligibility,
                minAge: event.target.value ? parseInt(event.target.value, 10) : undefined,
              },
            })
          }
        />
        <HelpText>Leave blank for no minimum.</HelpText>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Age Range (Max)</FieldLabel>
        <input
          type="number"
          placeholder="e.g. 65"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
          value={policyData.eligibility?.maxAge || ""}
          onChange={(event) =>
            setPolicyData({
              ...policyData,
              eligibility: {
                ...policyData.eligibility,
                maxAge: event.target.value ? parseInt(event.target.value, 10) : undefined,
              },
            })
          }
        />
        <HelpText>Leave blank for no maximum.</HelpText>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Gender</FieldLabel>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((gender) => (
            <button
              type="button"
              key={gender}
              onClick={() =>
                setPolicyData({
                  ...policyData,
                  eligibility: { ...policyData.eligibility, gender },
                })
              }
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-body font-medium capitalize transition-all",
                policyData.eligibility?.gender === gender ||
                  (!policyData.eligibility?.gender && gender === "all")
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-border/80"
              )}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
