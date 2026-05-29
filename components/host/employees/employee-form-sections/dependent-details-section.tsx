"use client"

import { Users, Plus, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { PhoneInput } from "@/components/shared/phone-input"
import { FormSelect } from "@/components/shared/form-select"
import { RELATIONSHIPS } from "../employee-form-constants"

interface Dependent {
  id: string
  relationship: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface DependentDetailsSectionProps {
  dependents: Dependent[]
  setDependents: (dependents: Dependent[]) => void
}

export function DependentDetailsSection({
  dependents,
  setDependents,
}: DependentDetailsSectionProps) {
  const addDependent = () => {
    setDependents([
      ...dependents,
      {
        id: Math.random().toString(36).substr(2, 9),
        relationship: "Spouse",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
    ])
  }

  const removeDependent = (id: string) => {
    setDependents(dependents.filter((d) => d.id !== id))
  }

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(
      dependents.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    )
  }

  return (
    <div
      id="dependent-links"
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Dependent Details</h3>
        </div>

        <div className="space-y-5">
          {dependents.map((dep) => (
            <div
              key={dep.id}
              className="p-5 rounded-lg border border-border bg-muted/5 space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-label font-semibold text-subtle">Dependent</span>
                <button
                  type="button"
                  onClick={() => removeDependent(dep.id)}
                  className="text-faint hover:text-destructive transition-colors"
                >
                  <Trash size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-label font-medium text-subtle">Relationship</label>
                  <FormSelect
                    value={dep.relationship}
                    onChange={(v) => updateDependent(dep.id, "relationship", v)}
                    options={RELATIONSHIPS.map((r) => ({ label: r, value: r }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">First Name</label>
                  <input
                    value={dep.firstName}
                    onChange={(e) => updateDependent(dep.id, "firstName", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">Last Name</label>
                  <input
                    value={dep.lastName}
                    onChange={(e) => updateDependent(dep.id, "lastName", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Last Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">Email address</label>
                  <input
                    value={dep.email}
                    onChange={(e) => updateDependent(dep.id, "email", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">Phone number</label>
                  <PhoneInput
                    value={dep.phone}
                    onChange={(v) => updateDependent(dep.id, "phone", v)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full border-dashed border-border h-14 text-faint hover:text-primary hover:border-primary/40 hover:bg-muted/30 transition-all"
            onClick={addDependent}
            type="button"
          >
            <Plus size={18} weight="bold" className="mr-2" /> Register New Dependent
          </Button>
        </div>
      </div>
    </div>
  )
}
