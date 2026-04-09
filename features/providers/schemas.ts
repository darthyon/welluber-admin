import { z } from "zod";
import { COMMISSION_RATE_MIN, COMMISSION_RATE_MAX } from "./constants";

// ─── SP Account ───────────────────────────────────────────────────────────────

export const createSpSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  registrationNo: z.string().min(4, "Registration number is required"),
  serviceCategories: z.array(z.string()).optional(),
  mainServices: z.array(z.string()).min(1, "Select at least one main service"),
  description: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  tinNumber: z.string().optional(),
  classificationCode: z.string().optional(),
  classificationDescriptor: z.string().optional(),
  documents: z.array(z.string()).default([]),
});

export type CreateSpData = z.infer<typeof createSpSchema>;

// ─── Shared Schemas ───────────────────────────────────────────────────────────

const serviceLineSchema = z.object({
  service: z.string().min(1, "Service is required"),
  subServices: z.array(z.string()).min(1, "Select at least one sub-service"),
  description: z.string().optional(),
  descriptionList: z.string().optional(), // WYSIWYG list
});

// ─── SP Branch ────────────────────────────────────────────────────────────────

const branchContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
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
  services: z.array(serviceLineSchema).min(1, "Select at least one service"),
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
  benefits: z.array(z.string()).default([]),
});

export type CreateBranchData = z.infer<typeof createBranchSchema>;

// ─── SP Voucher ───────────────────────────────────────────────────────────────

export const createVoucherSchema = z.object({
  name: z.string().min(1, "Voucher name is required"),
  description: z.string().optional(),
  photo: z.any().optional(),
  bookingRequired: z.boolean().default(false),
  displayLocation: z.object({
    line: z.string().optional(),
  }).optional(),
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

export const commissionTierSchema = z.object({
  limit: z.number().min(0, "Limit must be 0 or more"), // e.g. 100 redemptions
  rate: z
    .number()
    .min(0, "Rate must be 0 or more")
    .max(1, "Rate cannot exceed 100%"), // 0.10 = 10%
});

export const commissionSchemaRowSchema = z
  .object({
    mainService: z.string(),
    tiers: z.array(commissionTierSchema).min(1, "Add at least one tier"),
    effectiveFrom: z.string().optional(),
  })
  .refine(
    (data) => {
      for (let i = 1; i < data.tiers.length; i++) {
        if (data.tiers[i].limit <= data.tiers[i - 1].limit) return false;
      }
      return true;
    },
    {
      message: "Each tier limit must be greater than the previous",
      path: ["tiers"],
    }
  );

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
  branchIds: z.array(z.string()).default([]),
});

export type InviteSpAdminData = z.infer<typeof inviteSpAdminSchema>;
