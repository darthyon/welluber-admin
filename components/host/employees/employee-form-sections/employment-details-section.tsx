"use client"

import { Briefcase, DiceFive, Info } from "@phosphor-icons/react"
import { ChoiceCard } from "@/components/shared/choice-card"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { IdentificationInput } from "@/components/shared/identification-input"
import { FormSelect } from "@/components/shared/form-select"
import { cn } from "@/lib/utils"
import { EMPLOYMENT_TYPES, MOCK_BRANCHES } from "../employee-form-constants"
import type { IdTypeOption } from "@/components/shared/identification-input"

function calcTimeUntil(dateStr: string): { months: number; days: number } | null {
  const target = new Date(dateStr + "T00:00:00")
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return null
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return { months: Math.floor(totalDays / 30), days: totalDays % 30 }
}

interface FormFields {
  branchId: string
  idType: string
  idNumber: string
  joinDate: string
  empCode: string
  probationEndDate: string
  employmentType: string
  endDate: string
  department: string
  role: string
  isProbation: boolean
}

interface EmploymentDetailsSectionProps {
  formData: FormFields
  setFormData: (patch: Partial<FormFields>) => void
  idTypes: IdTypeOption[]
  resolvedDepts: { id: string; name: string }[]
  resolvedTiers: { id: string; name: string }[]
  isContractType: boolean
  generateEmpCode: () => void
}

export function EmploymentDetailsSection({
  formData,
  setFormData,
  idTypes,
  resolvedDepts,
  resolvedTiers,
  isContractType,
  generateEmpCode,
}: EmploymentDetailsSectionProps) {
  return (
    <div
      id="employment-details"
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Employment Details</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Branch */}
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Branch <span className="text-destructive">*</span>
              </label>
              <FormSelect
                value={formData.branchId}
                onChange={(v) => setFormData({ branchId: v })}
                options={[
                  { label: "Select branch", value: "" },
                  ...MOCK_BRANCHES.map((b) => ({ label: b.name, value: b.id })),
                ]}
              />
            </div>

            {/* Identification */}
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Identification <span className="text-destructive">*</span>
              </label>
              <IdentificationInput
                type={formData.idType}
                number={formData.idNumber}
                idTypes={idTypes}
                onTypeChange={(v) => setFormData({ idType: v })}
                onNumberChange={(v) => setFormData({ idNumber: v })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Join Date <span className="text-destructive">*</span>
              </label>
              <DatePickerField
                value={formData.joinDate}
                onChange={(v) => setFormData({ joinDate: v })}
                placeholder="Select join date"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Employee Code</label>
              <div className="relative flex items-center h-[38px] bg-background border border-border rounded-lg px-2 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all">
                <input
                  placeholder="ACM-XXXX"
                  className="flex-1 bg-transparent border-none outline-none text-body px-1 font-mono tracking-tight"
                  value={formData.empCode}
                  onChange={(e) => setFormData({ empCode: e.target.value })}
                />
                <button
                  type="button"
                  onClick={generateEmpCode}
                  className="w-7 h-7 rounded bg-muted flex items-center justify-center text-faint hover:bg-primary/10 hover:text-primary transition-all ml-1"
                  title="Auto-generate"
                >
                  <DiceFive size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Department</label>
              <FormSelect
                value={formData.department}
                onChange={(v) => setFormData({ department: v })}
                options={[
                  { label: "Select department", value: "" },
                  ...resolvedDepts.map((d) => ({ label: d.name, value: d.name })),
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Position</label>
              <FormSelect
                value={formData.role}
                onChange={(v) => setFormData({ role: v })}
                options={[
                  { label: "Select position", value: "" },
                  ...resolvedTiers.map((t) => ({ label: t.name, value: t.name })),
                ]}
              />
            </div>

            {/* Probation */}
            <div className="col-span-full space-y-1.5">
              <label className="text-label font-medium text-subtle">On probation?</label>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 rounded-lg border border-border bg-muted/20 min-h-[42px] py-1.5 transition-all",
                    formData.isProbation ? "flex-1" : "shrink-0"
                  )}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isProbation}
                    onClick={() =>
                      setFormData({
                        isProbation: !formData.isProbation,
                        probationEndDate: formData.isProbation ? "" : formData.probationEndDate,
                      })
                    }
                    className={cn(
                      "relative h-5 w-10 rounded-full shrink-0 transition-all duration-300 ring-1",
                      formData.isProbation
                        ? "bg-primary ring-primary/30"
                        : "bg-muted-foreground/25 ring-muted-foreground/40"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-all duration-300",
                        formData.isProbation ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                  <span className="text-body font-medium text-foreground whitespace-nowrap">
                    {formData.isProbation ? "Yes" : "No"}
                  </span>
                  {formData.isProbation && (
                    <div className="flex-1 -my-px animate-in fade-in slide-in-from-left-2 duration-200">
                      <DatePickerField
                        value={formData.probationEndDate}
                        onChange={(v) => setFormData({ probationEndDate: v })}
                        placeholder="Select probation end date"
                        className="!border-0 !bg-transparent !rounded-none !ring-0 !shadow-none !px-0 focus:!ring-0 whitespace-nowrap"
                      />
                    </div>
                  )}
                </div>

                {formData.isProbation &&
                  formData.probationEndDate &&
                  (() => {
                    const until = calcTimeUntil(formData.probationEndDate)
                    const formatted = new Date(
                      formData.probationEndDate + "T00:00:00"
                    ).toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    return (
                      <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2.5 shrink-0 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Info size={14} weight="fill" className="text-primary shrink-0" />
                        <span className="text-label font-medium text-foreground whitespace-nowrap">
                          {until ? (
                            <>
                              Ends in{" "}
                              <strong>
                                {until.months}m {until.days}d
                              </strong>{" "}
                              · <span className="text-muted-foreground">{formatted}</span>
                            </>
                          ) : (
                            <>
                              Ended ·{" "}
                              <span className="text-muted-foreground">{formatted}</span>
                            </>
                          )}
                        </span>
                      </div>
                    )
                  })()}
              </div>
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">Employment Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMPLOYMENT_TYPES.map((type) => (
                <ChoiceCard
                  key={type.id}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                  selected={formData.employmentType === type.id}
                  onSelect={() => setFormData({ employmentType: type.id })}
                />
              ))}
            </div>
          </div>

          {/* End Date for contract/part-time/internship */}
          {isContractType && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-label font-medium text-subtle">
                Contract End Date <span className="text-destructive">*</span>
              </label>
              <DatePickerField
                value={formData.endDate}
                onChange={(v) => setFormData({ endDate: v })}
                placeholder="Select end date"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
