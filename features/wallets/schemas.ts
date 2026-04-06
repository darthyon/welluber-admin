import { z } from "zod";

export const WalletModelEnum = z.enum(["cash_balance", "credit_limit"]);
export const WalletStatusEnum = z.enum(["active", "suspended", "closed"]);

export const createWalletSchema = z.object({
  orgId: z.string().min(1, "Organization is required"),
  branchId: z.string().min(1, "Branch is required"),
  model: WalletModelEnum,
  initialBalance: z.number().min(0, "Initial balance cannot be negative"),
  creditLimit: z.number().min(0, "Credit limit cannot be negative").optional(),
});

export const adjustWalletSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  type: z.enum(["topup", "adjustment", "settlement", "reversal"]),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  description: z.string().min(3, "Description is required"),
  referenceId: z.string().optional(),
});

export const updateCreditLimitSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  newLimit: z.number().min(0, "New limit cannot be negative"),
  description: z.string().min(3, "Reason for change is required"),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type AdjustWalletInput = z.infer<typeof adjustWalletSchema>;
export type UpdateCreditLimitInput = z.infer<typeof updateCreditLimitSchema>;
