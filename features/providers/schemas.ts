import { z } from "zod";

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
  businessType: z.enum(["sdn_bhd", "sole_prop", "partnership_llp"]).optional(),
  bankInfo: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    accountName: z.string().min(1, "Account name is required"),
  }).optional(),
  address: z.object({
    line: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  }).optional(),
  needsEInvoiceSubmission: z.boolean().default(false),
  appointedForEInvoice: z.boolean().default(false),
  expiredCommissionFee: z.number().min(0).default(0),
  paymentCycle: z.string().optional(),
  creditTerms: z.string().optional(),
  commissionSchema: z.array(
    z.object({
      mainService: z.string(),
      firstLevelQty: z.number().min(0, "Quantity must be 0 or more"),
      firstLevelRate: z.number().min(0, "Rate must be 0 or more").max(1, "Rate cannot exceed 100%"),
      subsequentLevelQty: z.number().min(0, "Quantity must be 0 or more"),
      subsequentLevelRate: z.number().min(0, "Rate must be 0 or more").max(1, "Rate cannot exceed 100%"),
      effectiveFrom: z.string().optional(),
    })
  ).default([]),
});

export type CreateSpData = z.infer<typeof createSpSchema>;

// ─── Shared Schemas ───────────────────────────────────────────────────────────

const serviceLineSchema = z.object({
  service: z.string().min(1, "Service is required"),
  subServices: z.array(z.string()).min(1, "Select at least one sub-service"),
  description: z.string().optional(),
  descriptionList: z.string().optional(), // WYSIWYG list
  price: z.coerce.number().min(0, "Price must be 0 or more").default(0),
});

// ─── SP Branch ────────────────────────────────────────────────────────────────

const branchContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  type: z.enum(["branch_manager", "staff", "reception"]),
  phone: z.string().min(1, "Phone is required"),
  isPublic: z.boolean().default(false),
});

const branchAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.string().default("Administrator"),
  designateAsPic: z.boolean().default(false),
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
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
  }),
  contacts: z.array(branchContactSchema).min(1, "Add at least one PIC"),
  administrators: z.array(branchAdminSchema).default([]),
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
  discount: z
    .object({
      type: z.enum(["amount", "percent"]),
      value: z.coerce.number().min(0, "Discount must be 0 or more"),
    })
    .default({ type: "amount", value: 0 }),
  finalPrice: z.number().int("Final price must be a whole number").min(0).default(0), // computed from initialPrice − discount
  voucherCount: z.coerce.number().int().min(0, "Must be 0 or more").optional(),
  maxUsagePerUser: z.coerce.number().int().min(1, "Must be at least 1").optional(),
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

// ─── Commission Schema (legacy — kept for type compatibility during migration) ─

export const commissionSchemaSchema = z.object({
  rows: z.array(
    z.object({
      mainService: z.string(),
      firstLevelQty: z.number().min(0),
      firstLevelRate: z.number().min(0).max(1),
      subsequentLevelQty: z.number().min(0),
      subsequentLevelRate: z.number().min(0).max(1),
      effectiveFrom: z.string().optional(),
    })
  ),
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
  position: z.string().min(2, "Position is required"),
  email: z.string().email("Enter a valid email address"),
  branchIds: z.array(z.string()).optional(),
});

export type InviteSpAdminData = z.infer<typeof inviteSpAdminSchema>;
