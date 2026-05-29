"use client"

import { User, Envelope } from "@phosphor-icons/react"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { PhoneInput } from "@/components/shared/phone-input"
import { FormSelect } from "@/components/shared/form-select"
import type { IdTypeOption } from "@/components/shared/identification-input"

interface FormFields {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: "male" | "female"
  email: string
  phone: string
}

interface PersonalDetailsSectionProps {
  formData: FormFields
  setFormData: (patch: Partial<FormFields>) => void
  idTypes: IdTypeOption[]
}

export function PersonalDetailsSection({
  formData,
  setFormData,
}: PersonalDetailsSectionProps) {
  return (
    <div
      id="personal-identity"
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} weight="fill" />
          </div>
          <h3 className="text-lead font-semibold text-foreground">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              placeholder="e.g. Sarah"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
              value={formData.firstName}
              onChange={(e) => setFormData({ firstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              placeholder="e.g. Jenkins"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
              value={formData.lastName}
              onChange={(e) => setFormData({ lastName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-label font-medium text-subtle">
              Date of Birth <span className="text-destructive">*</span>
            </label>
            <DatePickerField
              value={formData.dateOfBirth}
              onChange={(v) => setFormData({ dateOfBirth: v })}
              placeholder="Select date of birth"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">Gender</label>
            <FormSelect
              value={formData.gender}
              onChange={(v) => setFormData({ gender: v as "male" | "female" })}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">Corporate Email</label>
            <div className="relative">
              <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="email"
                placeholder="sarah.j@acme.com"
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">
              Mobile Phone Number <span className="text-destructive">*</span>
            </label>
            <PhoneInput
              value={formData.phone}
              onChange={(v) => setFormData({ phone: v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
