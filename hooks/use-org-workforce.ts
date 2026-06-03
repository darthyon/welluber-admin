"use client"

import {
  MOCK_EMPLOYEES,
  MOCK_DEPENDENTS,
  MOCK_ENTITLEMENTS,
} from "@/lib/mock-data"

export function useOrgWorkforce(orgId: string) {
  void orgId
  return {
    employees: MOCK_EMPLOYEES,
    dependents: MOCK_DEPENDENTS,
    entitlements: MOCK_ENTITLEMENTS,
  }
}
