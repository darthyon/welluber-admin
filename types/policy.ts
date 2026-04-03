export interface Policy {
  id: string
  title: string
  description: string
  scope: {
    roles: string[]
    departments: string[]
    employmentTypes: string[]
    ageRange: [number, number]
  }
}

export interface BenefitCategory {
  id: string
  name: string
  icon: string
  color: string
}
