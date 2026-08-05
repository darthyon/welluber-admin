import { describe, expect, it } from "vitest"
import {
  EMPLOYEE_IDENTITIES,
  getEmployeeIdentity,
} from "@/lib/mock-data/employee-identity"
import {
  MOCK_CLAIMS,
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_ENTITIES,
  MOCK_EMPLOYEE_UTILISATION,
  MOCK_DEPENDENTS,
  MOCK_ENTITLEMENTS,
  MOCK_GENERATED_VOUCHERS,
  MOCK_ORGS,
} from "@/lib/mock-data"
import { MOCK_ORG_UTILISATION } from "@/lib/mock-data/factories/organization"

/**
 * Guards the single-employee-identity rule. Five mock datasets used to carry
 * their own copy of every employee's name, so `EMP-20260115-0001` was Robert Fox
 * in the directory and Ahmad Faizal in the claim and voucher factories. Any
 * dataset that names an employee must resolve that name through
 * `employee-identity.ts` — these assertions fail the moment one stops.
 */

/** Every dataset that denormalises an employee name, as (id, name) pairs. */
const NAMED_DATASETS: Array<{
  label: string
  rows: Array<{ id: string; name: string; empCode?: string }>
}> = [
  {
    label: "MOCK_EMPLOYEES (directory)",
    rows: MOCK_EMPLOYEES.map((e) => ({
      id: e.id,
      name: e.name,
      empCode: e.empCode,
    })),
  },
  {
    label: "MOCK_EMPLOYEE_ENTITIES (store/registry)",
    rows: MOCK_EMPLOYEE_ENTITIES.map((e) => ({
      id: e.id,
      name: e.name,
      empCode: e.empCode,
    })),
  },
  {
    label: "MOCK_EMPLOYEE_UTILISATION",
    rows: MOCK_EMPLOYEE_UTILISATION.map((r) => ({
      id: r.id,
      name: r.name,
      empCode: r.empCode,
    })),
  },
  {
    label: "MOCK_ORG_UTILISATION",
    rows: MOCK_ORG_UTILISATION.map((r) => ({
      id: r.id,
      name: r.name,
      empCode: r.empCode,
    })),
  },
  {
    label: "MOCK_CLAIMS",
    rows: MOCK_CLAIMS.map((c) => ({
      id: c.employeeId,
      name: c.employeeName,
      empCode: c.empCode,
    })),
  },
  {
    label: "MOCK_GENERATED_VOUCHERS",
    rows: MOCK_GENERATED_VOUCHERS.map((v) => ({
      id: v.employeeId,
      name: v.employeeName,
    })),
  },
  {
    label: "MOCK_DEPENDENTS",
    rows: MOCK_DEPENDENTS.map((d) => ({
      id: d.employeeId,
      name: d.employeeName,
    })),
  },
  {
    label: "MOCK_ENTITLEMENTS",
    rows: MOCK_ENTITLEMENTS.map((e) => ({
      id: e.employeeId,
      name: e.employeeName,
    })),
  },
]

describe("employee identity is canonical", () => {
  it("assigns every id exactly one name", () => {
    expect(new Set(EMPLOYEE_IDENTITIES.map((i) => i.id)).size).toBe(
      EMPLOYEE_IDENTITIES.length
    )
  })

  it("assigns every name exactly one id", () => {
    const names = EMPLOYEE_IDENTITIES.map((i) => i.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("assigns every empCode exactly one id", () => {
    const codes = EMPLOYEE_IDENTITIES.map((i) => i.empCode)
    expect(new Set(codes).size).toBe(codes.length)
  })

  for (const { label, rows } of NAMED_DATASETS) {
    it(`${label} matches the canonical identity`, () => {
      for (const row of rows) {
        const identity = getEmployeeIdentity(row.id)
        expect(identity, `${label}: unknown employee ${row.id}`).toBeDefined()
        expect(row.name, `${label}: name drift on ${row.id}`).toBe(
          identity!.name
        )
        if (row.empCode !== undefined) {
          expect(row.empCode, `${label}: empCode drift on ${row.id}`).toBe(
            identity!.empCode
          )
        }
      }
    })
  }

  it("cross-checks every id that appears in more than one dataset", () => {
    const seen = new Map<string, { name: string; from: string }>()
    for (const { label, rows } of NAMED_DATASETS) {
      for (const row of rows) {
        const prior = seen.get(row.id)
        if (prior) {
          expect(
            row.name,
            `${row.id}: "${prior.name}" in ${prior.from} vs "${row.name}" in ${label}`
          ).toBe(prior.name)
          continue
        }
        seen.set(row.id, { name: row.name, from: label })
      }
    }
    // Guard the guard: if nothing overlaps, the assertion above proves nothing.
    expect(seen.size).toBeGreaterThan(0)
  })
})

describe("employee identity agrees with the org entities", () => {
  it("uses org names that exist on an Organization", () => {
    const orgNames = new Map(MOCK_ORGS.map((o) => [o.id, o.name]))
    for (const identity of EMPLOYEE_IDENTITIES) {
      if (!identity.organization) continue
      expect(
        identity.organization,
        `${identity.id}: org name drift against ${identity.orgId}`
      ).toBe(orgNames.get(identity.orgId))
    }
  })

  it("points every employee at an org that exists", () => {
    const orgIds = new Set(MOCK_ORGS.map((o) => o.id))
    for (const identity of EMPLOYEE_IDENTITIES) {
      expect(orgIds.has(identity.orgId), `${identity.id}: ${identity.orgId}`).toBe(
        true
      )
    }
  })
})
