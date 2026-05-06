import { z } from "zod";

export const AccountStatusEnum = z.enum(["active", "suspended", "closed"]);
export const AccountTypeEnum = z.enum(["new", "existing"]);

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  orgId: z.string().min(1, "Organization is required"),
  branchId: z.string().min(1, "Branch is required"),
  initialAmount: z.number().min(0, "Initial amount cannot be negative"),
  attachmentUrl: z.string().optional(),
});

export const adjustAccountSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  reason: z.string().min(1, "Reason is required"),
});

export const updateCreditLimitSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  creditLimit: z.number().min(0, "Credit limit cannot be negative"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type AdjustAccountInput = z.infer<typeof adjustAccountSchema>;
export type UpdateCreditLimitInput = z.infer<typeof updateCreditLimitSchema>;
