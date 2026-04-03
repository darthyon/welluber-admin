// ISO 8601 Date String
type ISODate = string;

// ─── Status ───────────────────────────────────────────────────────────────────

export type ServiceProviderStatus = "active" | "suspended" | "pending" | "removed";
export type SpAdminStatus = "active" | "pending_activation";
export type SpVoucherStatus = "draft" | "published" | "activated" | "paused" | "ended";
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
  serviceCategory: string;
  commissionRate: number;        // 0.10–0.30
  expiredCommissionRate: number; // 0.10–0.30
  effectiveFrom?: ISODate;       // if future-dated
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
}

// ─── SP Branch ────────────────────────────────────────────────────────────────

export interface SpBranchContact {
  name: string;
  type: SpBranchContactType;
  phone: string;
  isPublic: boolean;
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
  services: string[]; // subset of SP's serviceCategories
  address: {
    line: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    lat?: number;
    lon?: number;
  };
  contacts: SpBranchContact[];
  isActive: boolean;
  operatingHours: OperatingHours;
  facilities: string[];
  rating?: number; // Phase 2
}

// ─── SP Voucher ───────────────────────────────────────────────────────────────

export interface ServiceLine {
  serviceCategory: string;
  subServiceLabel: string;
  description: string;
  duration: {
    unit: DurationUnit;
    value: number;
  };
  weight: number; // 0–1, all lines must sum to 1.0
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
  serviceLines: ServiceLine[];
  status: SpVoucherStatus;
  isActive: boolean;
  activationPeriod: {
    startDate: ISODate;
    endDate?: ISODate; // optional — open-ended if not set
  };
  currency: string; // "MYR" for v1; dropdown-selectable
  initialPrice: number;
  finalPrice: number; // integer, rounded per standard rounding
  validationDuration: {
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
  logo?: string;
  name: string;
  registrationNo: string;
  serviceCategories: string[]; // refs to taxonomy service categories
  description?: string;
  website?: string;
  isActive: boolean;
  taxProfile: TaxProfile;
  commissionSchema: CommissionSchemaRow[];
  admins: SpAdmin[];
  branches: SpBranch[];
  vouchers: SpVoucher[];
  activeVoucherCount: number;
  status: ServiceProviderStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}
