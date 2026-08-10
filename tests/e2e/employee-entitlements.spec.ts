import { expect, test, type Page } from "@playwright/test"

const employeeBenefitsUrl = (employeeId: string) =>
  `/employees/${employeeId}?from=ORG-20260115-0001&tab=benefits`

async function openBreakdown(page: Page, employeeId: string) {
  await page.goto(employeeBenefitsUrl(employeeId))
  const breakdown = page.getByTestId("entitlement-breakdown")
  await breakdown.getByRole("button", { name: "Show Breakdown" }).click()
  return breakdown
}

test.describe("Employee Entitlement Allocation", () => {
  test("shows the summary, collapsed breakdown, and static allocation table", async ({
    page,
  }) => {
    await page.goto(employeeBenefitsUrl("EMP-20260115-0001"))

    const summary = page.getByTestId("entitlement-summary")
    await expect(summary).toBeVisible({ timeout: 15000 })
    await expect(summary.getByText("Allocation Summary")).toBeVisible()
    await expect(summary.getByText("Overall Usage")).toBeVisible()
    await expect(summary.getByText("RM 1,500.00")).toBeVisible()
    await expect(summary.getByText("RM 300.00")).toBeVisible()
    await expect(summary.getByText("RM 1,200.00")).toBeVisible()

    const breakdown = page.getByTestId("entitlement-breakdown")
    await expect(breakdown.getByText("Breakdown")).toBeVisible()
    await expect(breakdown.getByText("Allocation Type")).not.toBeVisible()
    await breakdown.getByRole("button", { name: "Show Breakdown" }).click()

    const allocationTable = breakdown.getByTestId(
      "entitlement-allocation-table"
    )
    await expect(allocationTable).toBeVisible()
    const allocationRule = summary.getByTestId("entitlement-allocation-rule")
    await expect(allocationRule).toBeVisible()
    await allocationRule.hover()
    await expect(page.getByRole("tooltip")).toBeVisible()
    await expect(
      allocationTable
        .getByTestId("allocation-section-employee")
        .getByRole("columnheader", { name: "Employee" })
    ).toBeVisible()
    await expect(
      allocationTable
        .getByTestId("allocation-section-employee")
        .getByText("Allocation", { exact: true })
    ).toBeVisible()

    const employee = breakdown.getByTestId("allocation-person-employee")
    await expect(employee).toBeVisible()
    await expect(employee).not.toHaveAttribute("aria-haspopup", "dialog")
    await expect(page.getByTestId("entitlement-allocation-drawer")).toHaveCount(
      0
    )
  })

  test("shows individual dependent rows without drawer affordances", async ({
    page,
  }) => {
    const breakdown = await openBreakdown(page, "EMP-20260115-0006")
    const allocationTable = breakdown.getByTestId(
      "entitlement-allocation-table"
    )
    const dependentSection = allocationTable.getByTestId(
      "allocation-section-dependent"
    )

    await expect(dependentSection).toBeVisible()
    await expect(dependentSection.getByText("All Dependents")).toBeVisible()
    await expect(
      dependentSection.getByTestId("allocation-person-DEP-0006-1")
    ).toBeVisible()
    await expect(dependentSection.getByText("Nadia Faizal")).toBeVisible()
    await expect(dependentSection.getByText("Aisyah Faizal")).toBeVisible()
    await expect(
      allocationTable.locator('[aria-haspopup="dialog"]')
    ).toHaveCount(0)
    await expect(page.getByTestId("entitlement-allocation-drawer")).toHaveCount(
      0
    )
  })

  test("shows shared dependent rows as one shared pool", async ({ page }) => {
    const breakdown = await openBreakdown(page, "EMP-20260115-0004")
    const allocationTable = breakdown.getByTestId(
      "entitlement-allocation-table"
    )
    const dependentSection = allocationTable.getByTestId(
      "allocation-section-dependent"
    )

    await expect(dependentSection.getByText("All Dependents")).toBeVisible()
    await expect(dependentSection.getByText("Linda McKinney")).toBeVisible()
    await expect(dependentSection.getByText("Tyler McKinney")).toBeVisible()
    await expect(
      dependentSection.getByText("Shared Between Dependents", { exact: true })
    ).toHaveCount(4)
    await expect(
      allocationTable.locator('[aria-haspopup="dialog"]')
    ).toHaveCount(0)
  })

  test("shows combined dependent rows without drawer affordances", async ({
    page,
  }) => {
    const breakdown = await openBreakdown(page, "EMP-20260115-0003")
    const allocationTable = breakdown.getByTestId(
      "entitlement-allocation-table"
    )
    const dependentSection = allocationTable.getByTestId(
      "allocation-section-dependent"
    )

    await expect(dependentSection.getByText("All Dependents")).toBeVisible()
    await expect(dependentSection.getByText("Siti Rahmah")).toBeVisible()
    await expect(dependentSection.getByText("Adam Tan")).toBeVisible()
    await expect(
      dependentSection.getByText("Combined With Employee", { exact: true })
    ).toHaveCount(2)
    await expect(dependentSection.getByText("—", { exact: true })).toHaveCount(
      4
    )
    await expect(
      allocationTable.locator('[aria-haspopup="dialog"]')
    ).toHaveCount(0)
  })

  test("shows separate dependent rows and service totals", async ({ page }) => {
    await page.goto(employeeBenefitsUrl("EMP-20260115-0003"))

    const group = page.getByTestId("entitlement-group-POL-20260115-0009-G1")
    await expect(
      group.getByTestId("group-allocation-summary-POL-20260115-0009-G1")
    ).toHaveCount(0)

    await group.getByRole("button").first().click()

    const summary = group.getByTestId(
      "service-allocation-summary-POL-20260115-0009-B1"
    )
    await expect(summary).toBeVisible()
    await expect(summary.getByText("Allocated", { exact: true })).toBeVisible()
    await expect(summary.getByText("Used", { exact: true })).toBeVisible()
    await expect(
      summary.getByText("Balance Left", { exact: true })
    ).toBeVisible()
    await expect(summary.getByText("Usage", { exact: true })).toBeVisible()
    await expect(
      summary.getByTestId("entitlement-allocation-rule")
    ).toHaveCount(0)

    const table = group.getByTestId(
      "service-allocation-cards-POL-20260115-0009-B1"
    )
    await expect(
      table.getByTestId("entitlement-allocation-table")
    ).toBeVisible()
    await expect(table.getByTestId("allocation-person-employee")).toBeVisible()
    await expect(
      table.getByTestId("allocation-person-DEP-0003-1")
    ).toBeVisible()
    await expect(
      table.getByTestId("allocation-person-DEP-0003-2")
    ).toBeVisible()
    await expect(table.getByText("Dependents", { exact: true })).toHaveCount(0)
    await expect(table.locator('[aria-haspopup="dialog"]')).toHaveCount(0)
  })
})
