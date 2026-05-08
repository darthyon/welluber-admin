"use server";

import { AccountStatus } from "./types";
import { CreateAccountInput, AdjustAccountInput, UpdateCreditLimitInput } from "./schemas";
import { revalidatePath } from "next/cache";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function createAccount(input: CreateAccountInput) {
  console.log("Mock creating account:", input);
  await delay(1000);
  revalidatePath("/accounts");
  return { success: true, id: `ACC-${Date.now()}` };
}

export async function adjustBalance(input: AdjustAccountInput) {
  console.log("Mock adjusting balance:", input);
  await delay(1000);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${input.accountId}`);
  return { success: true };
}

export async function updateCreditLimit(input: UpdateCreditLimitInput) {
  console.log("Mock updating credit limit:", input);
  await delay(1000);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${input.accountId}`);
  return { success: true };
}

export async function updateAccountStatus(accountId: string, status: AccountStatus) {
  console.log("Mock updating account status:", accountId, status);
  await delay(500);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  return { success: true };
}
