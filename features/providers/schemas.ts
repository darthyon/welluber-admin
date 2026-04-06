import { z } from "zod";
import { COMMISSION_RATE_MIN, COMMISSION_RATE_MAX } from "./constants";

// ─── SP Account ───────────────────────────────────────────────────────────────

export const createSpSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  registrationNo: z.string().min(4, "Registration number is required"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one service category"),
  description: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CreateSpData = z.infer<typeof createSpSchema>;

// ─── SP Branch ────────────────────────────────────────────────────────────────

const branchContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["branch_manager", "staff", "reception"]),
  phone: z.string().min(1, "Phone is required"),
  isPublic: z.boolean().default(false),
});

const dayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
  isClosed: z.boolean(),
});

const operatingHoursSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});

export const createBranchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  services: z.array(z.string()).min(1, "Select at least one service"),
  address: z.object({
    line: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    lat: z.number().optional(),
    lon: z.number().optional(),
  }),
  contacts: z.array(branchContactSchema).min(1, "Add at least one contact"),
  isActive: z.boolean().default(true),
  operatingHours: operatingHoursSchema,
  facilities: z.array(z.string()).default([]),
});

export type CreateBranchData = z.infer<typeof createBranchSchema>;

// ─── SP Voucher ───────────────────────────────────────────────────────────────

const serviceLineSchema = z.object({
  service: z.string().min(1, "Service is required"),
  subServices: z.array(z.string()).min(1, "Select at least one sub-service"),
  description: z.string().optional(),
  duration: z.object({
    unit: z.enum(["session", "min", "hr", "day", "month", "year"]),
    value: z.number().min(1, "Duration must be at least 1"),
  }),
});

export const createVoucherSchema = z.object({
  name: z.string().min(1, "Voucher name is required"),
  description: z.string().optional(),
  serviceLines: z
    .array(serviceLineSchema)
    .min(1, "Add at least one service line"),
  currency: z.string().default("MYR"),
  initialPrice: z.number().min(0, "Initial price must be 0 or more"),
  finalPrice: z.number().int("Final price must be a whole number").min(0),
  activationPeriod: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
  }),
  redemptionPeriod: z.object({
    mode: z.enum(["exact_date", "after_purchase"]),
    date: z.string().optional(),
    unit: z.enum(["hr", "day", "month"]).optional(),
    value: z.number().optional(),
  }),
  branchScope: z.enum(["all", "specific"]).default("all"),
  branchIds: z.array(z.string()).default([]),
  membershipStartDay: z.enum(["none", "1st", "15th"]).default("none"),
});

export type CreateVoucherData = z.infer<typeof createVoucherSchema>;

// ─── Commission Schema ────────────────────────────────────────────────────────

export const commissionSchemaRowSchema = z.object({
  serviceCategory: z.string(),
  commissionRate: z
    .number()
    .min(COMMISSION_RATE_MIN, `Min rate is ${COMMISSION_RATE_MIN * 100}%`)
    .max(COMMISSION_RATE_MAX, `Max rate is ${COMMISSION_RATE_MAX * 100}%`),
  expiredCommissionRate: z
    .number()
    .min(COMMISSION_RATE_MIN, `Min rate is ${COMMISSION_RATE_MIN * 100}%`)
    .max(COMMISSION_RATE_MAX, `Max rate is ${COMMISSION_RATE_MAX * 100}%`),
  effectiveFrom: z.string().optional(),
});

export const commissionSchemaSchema = z.object({
  rows: z.array(commissionSchemaRowSchema),
});

export type CommissionSchemaData = z.infer<typeof commissionSchemaSchema>;

// ─── Tax Profile ──────────────────────────────────────────────────────────────

export const taxProfileSchema = z.object({
  isTaxRegistered: z.boolean(),
  taxRegNo: z.string().optional(),
  taxRate: z.number().min(0).max(1),
}).refine(
  (d) => !d.isTaxRegistered || (d.taxRegNo && d.taxRegNo.length > 0),
  { message: "Tax registration number is required", path: ["taxRegNo"] }
);

export type TaxProfileData = z.infer<typeof taxProfileSchema>;

// ─── SP Admin Invite ──────────────────────────────────────────────────────────

export const inviteSpAdminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
});

export type InviteSpAdminData = z.infer<typeof inviteSpAdminSchema>;
