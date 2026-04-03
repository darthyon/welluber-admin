export interface Organization {
  id: string
  name: string
  legalIdentity: string
  hqAddress: string
  picName: string
  picEmail: string
  picPhone: string
  activeMembers: number
  enrollmentRate: number
  avgBenefitUse: number
  status: "Active" | "Pending" | "Inactive"
  logo?: string
}
