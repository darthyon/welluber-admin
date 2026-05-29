import { SERVICES } from "@/lib/mock-data"

export function getServiceName(serviceId: string): string {
  return SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId
}

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`
}
