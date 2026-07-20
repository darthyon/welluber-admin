import { describe, expect, it } from "vitest"
import { buildEntitlementGroupPoolDisplay } from "@/features/employees/entitlement-pool-display"
import { getEmployeeEntitlement } from "@/components/host/employees/employee-entitlements-mock"

function groupDisplay(employeeId: string) {
  const entitlement = getEmployeeEntitlement(employeeId)
  const group = entitlement.groups[0]!
  return buildEntitlementGroupPoolDisplay({
    policy: entitlement.policy,
    group,
    benefits: entitlement.benefits,
    usage: entitlement.usage,
    employeeId,
  })
}

describe("entitlement pool display model", () => {
  it("derives one combined allocation without repeating it for every beneficiary", () => {
    const display = groupDisplay("EMP-20260115-0002")

    expect(display).toMatchObject({
      kind: "combined",
      allocated: 350,
      used: 250,
      left: 100,
      employeeUsed: 220,
      dependentUsed: 30,
    })
    expect(display?.beneficiaries).toHaveLength(3)
    expect(
      display?.beneficiaries.map((beneficiary) => beneficiary.name)
    ).toEqual(["Employee", "Daniel Wilson", "Emma Wilson"])
  })

  it("derives a shared dependent pool and keeps allocation at the group level", () => {
    const display = groupDisplay("EMP-20260115-0003")

    expect(display).toMatchObject({
      kind: "shared",
      allocated: 600,
      used: 250,
      left: 350,
      employeeUsed: 500,
      dependentUsed: 250,
    })
    expect(
      display?.beneficiaries.every(
        (beneficiary) => beneficiary.beneficiaryType === "dependent"
      )
    ).toBe(true)
  })

  it("keeps each individual dependent allocation separate", () => {
    const display = groupDisplay("EMP-20260115-0006")

    expect(display?.kind).toBe("individual")
    expect(display?.beneficiaries).toHaveLength(6)
    expect(display?.beneficiaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Nadia Faizal",
          allocated: 1500,
          used: 500,
          left: 1000,
        }),
        expect.objectContaining({
          name: "Aisyah Faizal",
          allocated: 1500,
          used: 0,
          left: 1500,
        }),
      ])
    )
  })

  it("handles employee-only groups and zero beneficiary usage", () => {
    const display = groupDisplay("EMP-20260115-0004")

    expect(display).toMatchObject({
      kind: "employee",
      allocated: 100,
      used: 40,
      left: 60,
      dependentUsed: 0,
    })
    expect(display?.beneficiaries).toHaveLength(1)
  })

  it("keeps a shared pool available when all beneficiaries have zero usage", () => {
    const entitlement = getEmployeeEntitlement("EMP-20260115-0003")
    const display = buildEntitlementGroupPoolDisplay({
      policy: entitlement.policy,
      group: entitlement.groups[0]!,
      benefits: entitlement.benefits,
      usage: entitlement.usage.map((row) => ({
        ...row,
        spent: 0,
        balance: row.allocated,
      })),
      employeeId: "EMP-20260115-0003",
    })

    expect(display).toMatchObject({
      kind: "shared",
      allocated: 600,
      used: 0,
      left: 600,
    })
  })
})
