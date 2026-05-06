"use server";

import { MOCK_TOPUP_HISTORY } from "@/lib/mock-data";

export async function submitManualTopup(formData: FormData) {
  await new Promise(r => setTimeout(r, 1500));
  console.log("Submit manual topup data:", formData);
  return { success: true, message: "Top-up request submitted successfully." };
}

export async function getTopupHistory(branchId: string) {
  await new Promise(r => setTimeout(r, 500));
  return MOCK_TOPUP_HISTORY.filter(t => t.branchId === branchId);
}
