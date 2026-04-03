import { z } from "zod";

export const createOrganizationSchema = z.object({
  logo: z.string().optional(),
  name: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().min(4, "Registration number is required"),
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().optional(),
  type: z.enum(["sme", "enterprise", "ngo", "mnc", "others"] as const, {
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
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export const inviteAdminSchema = z.object({
  name: z.string().min(2, "Admin name is required"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().min(2, "Position is required"),
});

export type InviteAdminData = z.infer<typeof inviteAdminSchema>;


export const configureWalletSchema = z.object({
  model: z.enum(["cash_balance", "credit_limit"] as const, {
    message: "Please select a wallet model",
  }),
});

export type ConfigureWalletData = z.infer<typeof configureWalletSchema>;
