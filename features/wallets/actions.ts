"use server";

import { Wallet, WalletTransaction, WalletStatus } from "./types";
import { CreateWalletInput, AdjustWalletInput, UpdateCreditLimitInput } from "./schemas";
import { revalidatePath } from "next/cache";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function createWallet(input: CreateWalletInput) {
  console.log("Mock creating wallet:", input);
  await delay(1000);
  revalidatePath("/accounts");
  return { success: true, id: `WAL-${Date.now()}` };
}

export async function adjustBalance(input: AdjustWalletInput) {
  console.log("Mock adjusting balance:", input);
  await delay(1000);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${input.walletId}`);
  return { success: true };
}

export async function updateCreditLimit(input: UpdateCreditLimitInput) {
  console.log("Mock updating credit limit:", input);
  await delay(1000);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${input.walletId}`);
  return { success: true };
}

export async function updateWalletStatus(walletId: string, status: WalletStatus) {
  console.log("Mock updating wallet status:", walletId, status);
  await delay(500);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${walletId}`);
  return { success: true };
}
