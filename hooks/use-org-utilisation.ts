"use client"

import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"

export function useOrgUtilisation(orgId: string) {
  void orgId
  return {
    utilisationData: MOCK_EMPLOYEE_UTILISATION,
  }
}
