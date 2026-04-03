export interface ServiceProvider {
  id: string
  name: string
  brandName: string
  legalName: string
  registrationNumber: string
  taxId: string
  hqAddress: string
  city: string
  state: string
  picName: string
  picEmail: string
  category: string
  activeVouchers: number
  settlementBasis: string
  nextSettlement: string
  growth: number
  status: "Active" | "Pending" | "Inactive"
  logo?: string
}

export interface ProviderBranch {
  id: string
  name: string
  location: string
  type: string
  status: "Active" | "Pending" | "Inactive"
}
