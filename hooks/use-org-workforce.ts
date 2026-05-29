"use client"

import {
  MOCK_EMPLOYEES,
  MOCK_DEPENDENTS,
  MOCK_ENTITLEMENTS,
} from "@/lib/mock-data"

export function useOrgWorkforce(_orgId: string) {
  return {
    employees: MOCK_EMPLOYEES,
    dependents: MOCK_DEPENDENTS,
    entitlements: MOCK_ENTITLEMENTS,
  }
}
