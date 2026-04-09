// ISO 8601 Date String
type ISODate = string;

export type BrandStatus = "active" | "inactive" | "removed";

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  status: BrandStatus;
  serviceCategories: string[]; // Tier 1 Service Categories
  assignedSpCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BrandSummary = Brand;
