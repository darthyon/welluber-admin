import { z } from "zod";

export const WalletStatusEnum = z.enum(["active", "suspended", "closed"]);
export const WalletTypeEnum = z.enum(["new", "existing"]);

export const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  orgId: z.string().min(1, "Organization is required"),
  branchId: z.string().min(1, "Branch is required"),
  initialAmount: z.number().min(0, "Initial amount cannot be negative"),
  attachmentUrl: z.string().optional(),
});

export const adjustWalletSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  reason: z.string().min(1, "Reason is required"),
});

export const updateCreditLimitSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  creditLimit: z.number().min(0, "Credit limit cannot be negative"),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type AdjustWalletInput = z.infer<typeof adjustWalletSchema>;
export type UpdateCreditLimitInput = z.infer<typeof updateCreditLimitSchema>;
