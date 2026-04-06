// ISO 8601 Date String
type ISODate = string;

export type BrandStatus = "active" | "inactive" | "removed";

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  status: BrandStatus;
  assignedSpCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BrandSummary = Brand;
