import { z } from "zod";

export const manualTopupSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  method: z.enum(["bank_transfer", "cheque", "cash", "credit_card"] as const, {
    message: "Please select a payment method",
  }),
  paidDate: z.date({
    message: "Please select the date payment was made",
  }),
  remarks: z.string().optional(),
  attachment: z.instanceof(File, {
    message: "Proof of payment attachment is required",
  }),
});

export type ManualTopupData = z.infer<typeof manualTopupSchema>;
