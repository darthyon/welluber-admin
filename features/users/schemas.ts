import { z } from "zod";

export const inviteHostAdminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  position: z.string().min(2, "Position is required"),
});

export type InviteHostAdminData = z.infer<typeof inviteHostAdminSchema>;

