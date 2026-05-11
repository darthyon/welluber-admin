/**
 * Service taxonomy used by:
 * - Benefit policies (Tier 2 ids only — sub-services NEVER surface in policy UI).
 * - Service provider package authoring (Tier 2 + Tier 3 sub-services).
 *
 * `MainServiceId` is the canonical id type for benefits → use it on `Benefit.serviceId`.
 *
 * This file re-exports from the unified `features/providers/service-taxonomy.ts`
 * so the policy domain and provider domain share the same taxonomy.
 */
import { POLICY_SERVICE_CATALOG } from "@/features/providers/service-taxonomy"

export { POLICY_SERVICE_CATALOG as SERVICES }
export type { MainServiceId } from "@/features/providers/service-taxonomy"

/** @deprecated use MainServiceId */
export type ServiceId = import("@/features/providers/service-taxonomy").MainServiceId

export const MAIN_SERVICE_IDS: readonly string[] = POLICY_SERVICE_CATALOG.map((s) => s.id)

export function isMainServiceId(value: string): value is import("@/features/providers/service-taxonomy").MainServiceId {
  return MAIN_SERVICE_IDS.includes(value)
}

export function getMainServiceName(id: string): string {
  return POLICY_SERVICE_CATALOG.find((s) => s.id === id)?.name ?? id
}
