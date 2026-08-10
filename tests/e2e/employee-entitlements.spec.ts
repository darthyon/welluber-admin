import { expect, test, type Page } from "@playwright/test"

const employeeBenefitsUrl = (employeeId: string) =>
  `/employees/${employeeId}?from=ORG-20260115-0001&tab=benefits`

async function openPersonDetails(
  page: Page,
  employeeId: string,
  beneficiaryId: string
) {
  await page.goto(employeeBenefitsUrl(employeeId))
  const breakdown = page.getByTestId("entitlement-breakdown")
  await breakdown.getByRole("button", { name: "Show Breakdown" }).click()
  const person = breakdown.getByTestId(`allocation-person-${beneficiaryId}`)
  await expect(person).toBeVisible({ timeout: 15000 })
  await person.click()
  return breakdown
}

test.describe("Employee Entitlement Allocation", () => {
  test("shows the summary, collapsed breakdown, and overall allocation drawer", async ({
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
    await expect(
      allocationTable.getByRole("columnheader", { name: "Beneficiary" })
    ).toBeVisible()
    await expect(
      allocationTable.getByText("Employee Policy Amount")
    ).toBeVisible()
    await expect(
      breakdown.getByTestId("allocation-person-employee")
    ).toBeVisible()
    await breakdown.getByTestId("allocation-person-employee").click()
    const drawer = page.getByTestId("entitlement-allocation-drawer")
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText("Robert Fox")).toBeVisible()
    await expect(drawer.getByText("Usage")).toBeVisible()
    await expect(
      drawer.locator('[data-testid="entitlement-allocation-table"]')
    ).toHaveCount(0)
    await expect(drawer.getByText("View Allocation Details")).toHaveCount(0)
  })

  test("opens details for one individual dependent only", async ({ page }) => {
    await openPersonDetails(page, "EMP-20260115-0006", "DEP-0006-1")

    const drawer = page.getByTestId("entitlement-allocation-drawer")
    await expect(drawer.getByText("Individual", { exact: true })).toBeVisible()
    await expect(drawer.getByText("Nadia Faizal")).toBeVisible()
    await expect(drawer.getByText("Aisyah Faizal")).not.toBeVisible()
  })

  test("opens one shared dependent without showing the full roster", async ({
    page,
  }) => {
    await openPersonDetails(page, "EMP-20260115-0004", "DEP-0004-1")

    const drawer = page.getByTestId("entitlement-allocation-drawer")
    await expect(drawer.getByText("Shared", { exact: true })).toBeVisible()
    await expect(drawer.getByText("Linda McKinney")).toBeVisible()
    await expect(drawer.getByText("Tyler McKinney")).not.toBeVisible()
    await expect(
      drawer.getByTestId("entitlement-person-usage")
    ).not.toBeVisible()
  })

  test("opens one combined dependent with its pool context", async ({
    page,
  }) => {
    await openPersonDetails(page, "EMP-20260115-0003", "DEP-0003-1")

    const drawer = page.getByTestId("entitlement-allocation-drawer")
    await expect(
      drawer.getByText("Combined With Employee", { exact: true })
    ).toBeVisible()
    await expect(drawer.getByText("Siti Rahmah")).toBeVisible()
    await expect(drawer.getByText("Adam Tan")).not.toBeVisible()

    await page.keyboard.press("Escape")
    await expect(drawer).not.toBeVisible()
  })

  test("shows the selected person's benefit groups and services in the drawer", async ({
    page,
  }) => {
    await openPersonDetails(page, "EMP-20260115-0003", "DEP-0003-1")

    const drawer = page.getByTestId("entitlement-allocation-drawer")
    const groups = drawer.getByTestId("entitlement-benefit-groups")
    await expect(groups).toBeVisible()
    await expect(groups.getByText("Nutrition & Recovery")).toBeVisible()
    await expect(
      groups.getByText("Nutritional Counselling · Sports Recovery")
    ).toBeVisible()
    await expect(drawer.getByText("Adam Tan")).not.toBeVisible()
  })

  test("shows separate dependent cards and service totals", async ({
    page,
  }) => {
    await page.goto(employeeBenefitsUrl("EMP-20260115-0003"))

    const group = page.getByTestId("entitlement-group-POL-20260115-0009-G1")
    await group.getByRole("button").first().click()

    const summary = group.getByTestId(
      "service-allocation-summary-POL-20260115-0009-B1"
    )
    await expect(summary).toBeVisible()
    await expect(summary.getByText("Total Allocated")).toBeVisible()
    await expect(summary.getByText("Total Used")).toBeVisible()
    await expect(summary.getByText("Balance Left")).toBeVisible()

    const cards = group.getByTestId(
      "service-allocation-cards-POL-20260115-0009-B1"
    )
    await expect(
      cards.getByTestId("entitlement-allocation-table")
    ).toBeVisible()
    await expect(cards.getByTestId("allocation-person-employee")).toBeVisible()
    await expect(
      cards.getByTestId("allocation-person-DEP-0003-1")
    ).toBeVisible()
    await expect(
      cards.getByTestId("allocation-person-DEP-0003-2")
    ).toBeVisible()
    await expect(cards.getByText("Dependents", { exact: true })).toHaveCount(0)
    await expect(cards.locator('[aria-haspopup="dialog"]')).toHaveCount(0)
  })
})
