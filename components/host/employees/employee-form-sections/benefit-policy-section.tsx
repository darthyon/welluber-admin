"use client"

import { Shield, Plus, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/shared/form-select"
import { MOCK_FORM_POLICIES } from "@/lib/mock-data"

interface AssignedPolicy {
  policyId: string
  policyName: string
  version?: string
}

interface BenefitPolicySectionProps {
  assignedPolicies: AssignedPolicy[]
  setAssignedPolicies: (policies: AssignedPolicy[]) => void
}

export function BenefitPolicySection({
  assignedPolicies,
  setAssignedPolicies,
}: BenefitPolicySectionProps) {
  const addPolicy = () => {
    setAssignedPolicies([
      ...assignedPolicies,
      {
        policyId: MOCK_FORM_POLICIES[0].id,
        policyName: MOCK_FORM_POLICIES[0].name,
        version: MOCK_FORM_POLICIES[0].version,
      },
    ])
  }

  const removePolicy = (index: number) => {
    setAssignedPolicies(assignedPolicies.filter((_, i) => i !== index))
  }

  return (
    <div
      id="benefit-policy-assignment"
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Benefit Policy Assignment</h3>
        </div>

        <div className="space-y-4">
          {assignedPolicies.map((assigned, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border bg-background shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label font-medium text-subtle">
                    Select benefit policy
                  </label>
                  {assigned.version && (
                    <span className="text-label font-mono text-muted-foreground">
                      {assigned.version}
                    </span>
                  )}
                </div>
                <FormSelect
                  value={assigned.policyId}
                  onChange={(v) => {
                    const pol = MOCK_FORM_POLICIES.find((p) => p.id === v)
                    if (pol) {
                      const updated = [...assignedPolicies]
                      updated[idx] = {
                        policyId: pol.id,
                        policyName: pol.name,
                        version: pol.version,
                      }
                      setAssignedPolicies(updated)
                    }
                  }}
                  options={MOCK_FORM_POLICIES.map((p) => ({
                    label: `${p.name}${p.version ? ` · ${p.version}` : ""}`,
                    value: p.id,
                  }))}
                />
              </div>
              <button
                type="button"
                onClick={() => removePolicy(idx)}
                className="mt-6 p-1.5 text-faint hover:text-destructive transition-colors"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full border-dashed border-border h-12 text-faint hover:text-primary hover:border-primary/40 hover:bg-muted/30 transition-all"
            onClick={addPolicy}
            type="button"
          >
            <Plus size={16} weight="bold" className="mr-2" /> Add Benefit Policy
          </Button>
        </div>
      </div>
    </div>
  )
}
