import { z } from "zod";

export const createOrganizationSchema = z.object({
  logo: z.string().optional(),
  name: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().min(4, "Registration number is required"),
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().optional(),
  type: z.enum(["sme", "enterprise", "ngo"] as const, {
    message: "Please select an organization type",
  }),
  financialYearStart: z.date({
    message: "Please select a financial year start date",
  }),
  subscription: z.object({
    plan: z.enum(["standard", "premium", "enterprise"] as const, {
      message: "Please select a subscription plan",
    }),
    billingInformation: z.string().optional(),
    paymentMethod: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    status: z.enum(["active", "pending", "suspended", "on_hold"]).default("pending"),
  }),
  tinNumber: z.string().min(4, "TIN Number is required"),
  creditLimit: z.number().min(0).default(0),
  address: z.object({
    line: z.string().min(5, "Address line is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    postalCode: z.string().min(5, "Postal code is required"),
  }),
  bankAccountDetails: z.object({
    bankName: z.string().min(2, "Bank name is required"),
    accountNumber: z.string().min(8, "Account number is required"),
    accountName: z.string().min(2, "Account name is required"),
  }),
  documents: z.array(z.string()).default([]),
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export const inviteAdminSchema = z.object({
  name: z.string().min(2, "Admin name is required"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().min(2, "Position is required"),
});

export type InviteAdminData = z.infer<typeof inviteAdminSchema>;


export const configureAccountSchema = z.object({
  model: z.enum(["cash_balance", "credit_limit"] as const, {
    message: "Please select an account model",
  }),
});

export type ConfigureAccountData = z.infer<typeof configureAccountSchema>;
