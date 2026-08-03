import { z } from "zod"

export interface Address {
  line: string
  city: string
  state: string
  postalCode: string
  country: string
  lat?: number
  lon?: number
}

export const addressSchema = z.object({
  line: z.string().min(1, "Address line is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  lat: z.number().optional(),
  lon: z.number().optional(),
})

export const addressFormSchema = z.object({
  line: z.string().min(1, "Address line is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
})
