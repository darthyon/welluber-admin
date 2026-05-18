"use server";

import { revalidatePath } from "next/cache";
import { CreateOrganizationData, HqBranchData, InviteAdminData } from "./schemas";

export async function createOrganization(data: CreateOrganizationData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, this would perform a DB insert, generate an ID, create the HQ branch, etc.
  const mockId = `org_${Date.now().toString().slice(-6)}`;
  
  // Revalidate the organizations list
  revalidatePath("/organizations");

  return { 
    success: true, 
    data: { 
      id: mockId,
      ...data,
      status: "active"
    } 
  };
}

export async function createHqBranch(orgId: string, data: HqBranchData) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  revalidatePath(`/organizations/${orgId}`);
  return {
    success: true,
    data: { id: `br_${Date.now().toString().slice(-6)}`, ...data, type: "hq", orgId },
  };
}

export async function deactivateOrganization(orgId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/organizations/${orgId}`);
  revalidatePath("/organizations");
  return { success: true, message: "Organization deactivated." };
}

export async function suspendOrganization(orgId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  revalidatePath(`/organizations/${orgId}`);
  revalidatePath("/organizations");
  return { success: true, message: "Organization suspended." };
}

export async function removeOrganization(orgId: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  revalidatePath(`/organizations/${orgId}`);
  revalidatePath("/organizations");
  return { success: true, message: "Organization removed." };
}

export async function inviteOrganizationAdmin(targetId: string, data: InviteAdminData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Simulating the magic link generation and sending email
  const mockToken = `ml_${Date.now()}_temp`;

  return {
    success: true,
    message: `Invite sent to ${data.email}`,
    data: {
      token: mockToken,
      expiresIn: "60 minutes"
    }
  };
}

export async function assignPoliciesToOrganization(orgId: string, policyIds: string[]) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    message: `${policyIds.length} policies assigned successfully.`
  };
}

export async function sendAccountPaymentLink(orgId: string, amount: number, financeEmail: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    message: `Payment link for RM ${amount.toLocaleString()} sent to ${financeEmail}`
  };
}
