"use server";

import { revalidatePath } from "next/cache";
import type { CreateSpData, CreateBranchData, CreateVoucherData, CommissionSchemaData, TaxProfileData, InviteSpAdminData } from "./schemas";

// ─── SP Account ───────────────────────────────────────────────────────────────

export async function createSp(data: CreateSpData) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const mockId = `SP-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  revalidatePath("/service-providers");
  return { success: true, data: { id: mockId, ...data, status: "active" } };
}

export async function updateSp(spId: string, data: CreateSpData) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  revalidatePath(`/service-providers/${spId}`);
  revalidatePath("/service-providers");
  return { success: true, data: { id: spId, ...data } };
}

export async function suspendSp(spId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  revalidatePath("/service-providers");
  return { success: true, message: "Service provider suspended." };
}

export async function activateSp(spId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  revalidatePath("/service-providers");
  return { success: true, message: "Service provider activated." };
}

export async function removeSp(spId: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  revalidatePath(`/service-providers/${spId}`);
  revalidatePath("/service-providers");
  return { success: true, message: "Service provider removed." };
}

// ─── SP Branch ────────────────────────────────────────────────────────────────

export async function createBranch(spId: string, data: CreateBranchData) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const mockId = `SPB-${Date.now().toString().slice(-6)}`;
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, data: { id: mockId, spId, ...data } };
}

export async function updateBranch(spId: string, branchId: string, data: CreateBranchData) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, data: { id: branchId, spId, ...data } };
}

// ─── SP Voucher ───────────────────────────────────────────────────────────────

export async function createVoucher(spId: string, data: CreateVoucherData) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const mockId = `VCH-${Date.now().toString().slice(-6)}`;
  const mockCode = `PAC${spId.slice(-4).toUpperCase()}${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, data: { id: mockId, spId, code: mockCode, status: "draft", ...data } };
}

export async function updateVoucher(spId: string, voucherId: string, data: CreateVoucherData) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, data: { id: voucherId, spId, ...data } };
}

export async function publishVoucher(spId: string, voucherId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, message: "Voucher published successfully." };
}

export async function pauseVoucher(spId: string, voucherId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, message: "Voucher paused." };
}

export async function endVoucher(spId: string, voucherId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, message: "Voucher ended." };
}

// ─── Commission Schema ────────────────────────────────────────────────────────

export async function saveCommissionSchema(spId: string, data: CommissionSchemaData) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, message: "Commission schema saved. New rates apply to future transactions." };
}

// ─── Tax Profile ──────────────────────────────────────────────────────────────

export async function saveTaxProfile(spId: string, data: TaxProfileData) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/service-providers/${spId}`);
  return { success: true, message: "Tax profile saved. SST de-calculation will apply to all transactions." };
}

// ─── SP Admin Invite ──────────────────────────────────────────────────────────

export async function inviteSpAdmin(spId: string, data: InviteSpAdminData) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const mockToken = `ml_${Date.now()}_temp`;
  return {
    success: true,
    message: `Invite sent to ${data.email}. They can activate within 60 minutes.`,
    data: { token: mockToken, expiresIn: "60 minutes", ...data },
  };
}

export async function resendSpAdminInvite(spId: string, adminId: string, email: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, message: `Invite resent to ${email}.` };
}
