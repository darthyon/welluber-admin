// ISO 8601 Date String
type ISODate = string;

// ─── Status ───────────────────────────────────────────────────────────────────

export type ServiceProviderStatus = "active" | "suspended" | "pending" | "removed";
export type SpAdminStatus = "active" | "pending_activation";
export type SpVoucherStatus = "draft" | "published" | "expired";
export type SpBranchContactType = "branch_manager" | "staff" | "reception";
export type DurationUnit = "session" | "min" | "hr" | "day" | "month" | "year";
export type ValidationUnit = "days" | "months" | "half_year" | "year";
export type RedemptionUnit = "hr" | "day" | "month";
export type MembershipStartDay = "none" | "1st" | "15th";

// ─── Tax Profile ──────────────────────────────────────────────────────────────

export interface TaxProfile {
  isTaxRegistered: boolean;
  taxRegNo?: string;
  taxRate: number; // e.g. 0.08 = 8%
}

// ─── Commission Schema ────────────────────────────────────────────────────────

export interface CommissionSchemaRow {
  mainService: string;
  firstLevelQty: number;
  firstLevelRate: number;
  subsequentLevelQty: number;
  subsequentLevelRate: number;
  effectiveFrom?: ISODate;
  lastUpdated?: ISODate;
}

// ─── SP Admin (Team) ──────────────────────────────────────────────────────────

export interface SpAdmin {
  id: string;
  spId: string;
  name: string;
  email: string;
  status: SpAdminStatus;
  invitedAt: ISODate;
  branchIds: string[];
}

// ─── SP Branch ────────────────────────────────────────────────────────────────

export interface SpBranchContact {
  name: string;
  email: string;
  type: SpBranchContactType;
  phone: string;
  isPublic: boolean;
}

export interface SpBranchAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  designateAsPic: boolean;
}

export interface DayHours {
  open: string;  // "09:00"
  close: string; // "18:00"
  isClosed: boolean;
}

export type OperatingHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

export interface SpBranch {
  id: string;
  spId: string;
  name: string;
  services: ServiceLine[]; // hierarchical services
  address: {
    line: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    lat?: number;
    lon?: number;
  };
  contacts: SpBranchContact[]; // Used for PICs (Public Contacts)
  administrators: SpBranchAdmin[]; // Governance/Access
  isActive: boolean;
  operatingHours: OperatingHours;
  benefits: string[];
  rating?: number; // Phase 2
}

// ─── SP Voucher ───────────────────────────────────────────────────────────────

export interface ServiceLine {
  service: string;
  subServices: string[];
  description?: string;
  descriptionList?: string; // WYSIWYG rich content
  price?: number; // per-line price in the voucher's currency
}

export interface RedemptionPeriod {
  mode: "exact_date" | "after_purchase";
  // exact_date mode
  date?: ISODate;
  // after_purchase mode
  unit?: RedemptionUnit;
  value?: number;
}

export interface SpVoucher {
  id: string;
  spId: string;
  code: string; // PAC{SPID}NNNN
  name: string;
  description: string;
  summary?: string;
  photo: string;
  bookingRequired: boolean;
  displayLocation?: {
    line?: string;
  };
  serviceLines: ServiceLine[];
  status: SpVoucherStatus;
  isActive: boolean;
  activationPeriod: {
    startDate: ISODate;
    endDate?: ISODate; // optional — open-ended if not set
  };
  currency: string; // "MYR" for v1; derived from the selected branch's account wallet
  initialPrice: number;
  discount?: { type: "amount" | "percent"; value: number }; // drives finalPrice
  finalPrice: number; // computed from initialPrice − discount; integer, rounded
  voucherCount?: number; // number of vouchers to generate
  maxUsagePerUser?: number; // how many times one member can redeem this voucher
  validationDuration?: {
    unit: ValidationUnit;
    value: number;
    startDate?: ISODate;
    endDate?: ISODate;
  };
  redemptionPeriod: RedemptionPeriod;
  membershipStartDay: MembershipStartDay;
  branchScope: "all" | "specific";
  branchIds: string[]; // empty means all
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ─── Service Provider ─────────────────────────────────────────────────────────

export interface ServiceProvider {
  id: string;
  brandId: string; // Links to Brand
  logo?: string;
  name: string;
  registrationNo: string;
  serviceCategories: string[]; // derived from mainServices (Tier 1)
  mainServices: string[]; // SELECTED Tier 2 Services
  description?: string;
  website?: string;
  isActive: boolean;
  taxProfile: TaxProfile;
  commissionSchema: CommissionSchemaRow[]; // Part of the Service Portfolio
  admins: SpAdmin[];
  branches: SpBranch[];
  vouchers: SpVoucher[];
  activeVoucherCount: number;
  status: ServiceProviderStatus;
  tinNumber?: string;
  classificationCode?: string;
  classificationDescriptor?: string;
  documents?: string[];
  businessType?: "sdn_bhd" | "sole_prop" | "partnership_llp";
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  address?: {
    line: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    lat?: number;
    lon?: number;
  };
  needsEInvoiceSubmission?: boolean;
  appointedForEInvoice?: boolean;
  expiredCommissionFee?: number;
  paymentCycle?: string;
  creditTerms?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}
