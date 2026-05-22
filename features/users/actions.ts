"use server";

import type { InviteHostAdminData } from "./schemas";

export async function inviteHostAdmin(data: InviteHostAdminData) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const mockToken = `ml_${Date.now()}_temp`;
  return {
    success: true,
    message: `Invite sent to ${data.email}. They can activate within 60 minutes.`,
    data: { token: mockToken, expiresIn: "60 minutes", ...data },
  };
}

