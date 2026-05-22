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

/**
 * Legacy main-service ids used by older mock data and early prototypes.
 * Prefer updating data to use canonical `MainServiceId`, but keep this for
 * backwards compatibility with persisted drafts / seeded mocks.
 */
const LEGACY_MAIN_SERVICE_ID_MAP: Record<string, import("@/features/providers/service-taxonomy").MainServiceId> =
  {
    s1: "FX-GYM",
    s2: "FX-CLS",
    s3: "MH-THR",
    s4: "MH-MED",
    s5: "NT-NUT",
    s6: "SP-FAC",
  }

export function resolveMainServiceId(id: string): string {
  return LEGACY_MAIN_SERVICE_ID_MAP[id] ?? id
}

export function getMainServiceName(id: string): string {
  const resolved = resolveMainServiceId(id)
  return POLICY_SERVICE_CATALOG.find((s) => s.id === resolved)?.name ?? id
}
