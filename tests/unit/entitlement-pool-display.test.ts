import { describe, expect, it } from "vitest"
import {
  buildEntitlementGroupPoolDisplay,
  getSharedDependentPoolCeiling,
} from "@/features/employees/entitlement-pool-display"
import { getEmployeeEntitlement } from "@/components/host/employees/employee-entitlements-mock"

function entitlementFor(employeeId: string) {
  const entitlement = getEmployeeEntitlement(employeeId)
  if (!entitlement) throw new Error(`No entitlement for ${employeeId}`)
  return entitlement
}

function groupDisplay(employeeId: string) {
  const entitlement = entitlementFor(employeeId)
  const group = entitlement.groups[0]!
  return buildEntitlementGroupPoolDisplay({
    policy: entitlement.policy,
    group,
    benefits: entitlement.benefits,
    usage: entitlement.usage,
    employeeId,
  })
}

describe("entitlement pool display model — one kind per policy shape", () => {
  it("employee: no dependents, allocation capped to the policy ceiling", () => {
    const display = groupDisplay("EMP-20260115-0001")

    expect(display).toMatchObject({
      kind: "employee",
      allocated: 1500,
      used: 300,
      left: 1200,
      dependentUsed: 0,
    })
    expect(display?.beneficiaries).toHaveLength(1)
  })

  it("individual: each dependent keeps its own wallet", () => {
    const display = groupDisplay("EMP-20260115-0002")

    expect(display?.kind).toBe("individual")
    expect(display?.beneficiaries).toHaveLength(2)
    expect(
      display?.beneficiaries.map((beneficiary) => beneficiary.name)
    ).toEqual(["Daniel Wilson", "Emma Wilson"])
  })

  it("combined: employee and dependents draw on one pot", () => {
    const display = groupDisplay("EMP-20260115-0003")

    expect(display).toMatchObject({
      kind: "combined",
      used: 750,
      employeeUsed: 500,
      dependentUsed: 250,
    })
    expect(display?.beneficiaries).toHaveLength(3)
  })

  it("shared: dependents share a pool separate from the employee", () => {
    const display = groupDisplay("EMP-20260115-0004")

    expect(display).toMatchObject({
      kind: "shared",
      allocated: 400,
      used: 150,
      left: 250,
      employeeUsed: 120,
    })
    expect(
      display?.beneficiaries.every(
        (beneficiary) => beneficiary.beneficiaryType === "dependent"
      )
    ).toBe(true)
  })

  it("treats benefitPoolType 'Shared' as a combined pot, not individual wallets", () => {
    // Regression: branching only on dependentsPoolType made an org shared-pot
    // policy fall through to `individual`, double-counting the pool as each
    // beneficiary's own allocation (2000 -> 4000).
    const display = groupDisplay("EMP-20260115-0005")

    expect(display).toMatchObject({
      kind: "combined",
      allocated: 2000,
      used: 650,
      left: 1350,
    })
  })

  it("never lets one group allocate more than the policy ceiling", () => {
    // Regression: combined pool summed its benefits (800 + 800) and reported
    // 1600 against a policy totalCapAmount of 800.
    const entitlement = entitlementFor("EMP-20260115-0003")
    expect(entitlement.policy.totalCapAmount).toBe(800)
    expect(groupDisplay("EMP-20260115-0003")?.allocated).toBe(800)
  })

  it("keeps a shared pool available when all beneficiaries have zero usage", () => {
    const entitlement = entitlementFor("EMP-20260115-0004")
    const display = buildEntitlementGroupPoolDisplay({
      policy: entitlement.policy,
      group: entitlement.groups[0]!,
      benefits: entitlement.benefits,
      usage: entitlement.usage.map((row) => ({
        ...row,
        spent: 0,
        balance: row.allocated,
      })),
      employeeId: "EMP-20260115-0004",
    })

    expect(display).toMatchObject({
      kind: "shared",
      allocated: 400,
      used: 0,
      left: 400,
    })
  })
})

describe("dependent pool ceiling precedence", () => {
  const base = {
    id: "POL-TEST",
    organizationId: "ORG-TEST",
    benefitPoolType: "Individual" as const,
    utilisationMode: "Fixed" as const,
    refreshCycle: "Yearly" as const,
    refreshStartReference: "financial_year",
  }

  it("policy-wide dependentCapAmount wins across groups", () => {
    // At policy scope the declared ceiling IS the total — summing per-group
    // caps would over-report when groups share one pot.
    const ceiling = getSharedDependentPoolCeiling(
      { ...base, dependentCapAmount: 400 } as never,
      [{ dependentGroupCap: 300 }, { dependentGroupCap: 300 }] as never,
      999
    )
    expect(ceiling).toBe(400)
  })

  it("falls back to the sum of group caps", () => {
    const ceiling = getSharedDependentPoolCeiling(
      base as never,
      [{ dependentGroupCap: 300 }, { dependentGroupCap: 100 }] as never,
      999
    )
    expect(ceiling).toBe(400)
  })

  it("falls back to the supplied allocation when no cap is declared", () => {
    const ceiling = getSharedDependentPoolCeiling(base as never, [] as never, 250)
    expect(ceiling).toBe(250)
  })
})

describe("employee entitlement summary segments across all profiles", () => {
  it("builds correct segments for Robert Fox (EMP-0001: Employee only, no dependents)", () => {
    const entitlement = entitlementFor("EMP-20260115-0001")
    const employeeSpent = entitlement.usage.filter(u => !u.relationship).reduce((s, u) => s + u.spent, 0)
    const dependentSpent = entitlement.usage.filter(u => u.relationship).reduce((s, u) => s + u.spent, 0)
    expect(employeeSpent).toBeGreaterThan(0)
    expect(dependentSpent).toBe(0)
  })

  it("builds correct 2-tone segments for Jenny Wilson (EMP-0002: Individual dependent wallets)", () => {
    const entitlement = entitlementFor("EMP-20260115-0002")
    const employeeSpent = entitlement.usage.filter(u => !u.relationship).reduce((s, u) => s + u.spent, 0)
    const dependentSpent = entitlement.usage.filter(u => u.relationship).reduce((s, u) => s + u.spent, 0)
    expect(employeeSpent).toBe(420)
    expect(dependentSpent).toBe(30)
  })

  it("builds correct 2-tone segments for Michael Tan (EMP-0003: Combined pool)", () => {
    const entitlement = entitlementFor("EMP-20260115-0003")
    const employeeSpent = entitlement.usage.filter(u => !u.relationship).reduce((s, u) => s + u.spent, 0)
    const dependentSpent = entitlement.usage.filter(u => u.relationship).reduce((s, u) => s + u.spent, 0)
    expect(employeeSpent).toBe(500)
    expect(dependentSpent).toBe(250)
  })

  it("builds correct 2-tone segments for Ahmad Faizal (EMP-0006: 6 Dependents)", () => {
    const entitlement = entitlementFor("EMP-20260115-0006")
    const employeeSpent = entitlement.usage.filter(u => !u.relationship).reduce((s, u) => s + u.spent, 0)
    const dependentSpent = entitlement.usage.filter(u => u.relationship).reduce((s, u) => s + u.spent, 0)
    expect(employeeSpent).toBe(1220)
    expect(dependentSpent).toBe(1270)
  })
})
