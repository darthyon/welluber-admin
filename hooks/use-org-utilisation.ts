"use client"

import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"

export function useOrgUtilisation(_orgId: string) {
  return {
    utilisationData: MOCK_EMPLOYEE_UTILISATION,
  }
}
