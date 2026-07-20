import { expect, test } from "@playwright/test"

const employeeUsageUrl = (employeeId: string) =>
  `/employees/${employeeId}?from=ORG-20260115-0001&tab=benefits`

test.describe("Employee Entitlement Pool Displays", () => {
  test("combined benefit usage uses the shared employee and dependent summary rows", async ({
    page,
  }) => {
    await page.goto(employeeUsageUrl("EMP-20260115-0002"))

    await page.getByRole("button", { name: /Gym Access/ }).click()
    const benefitSummary = page.getByTestId(
      "entitlement-benefit-summary-POL-20260115-0002-B1"
    )
    await expect(benefitSummary).toBeVisible({ timeout: 15000 })
    await expect(benefitSummary.getByText("Employee")).toBeVisible()
    await expect(benefitSummary.getByText("Dependents")).toBeVisible()
    await expect(benefitSummary.getByText("Combined Pool")).not.toBeVisible()

    await page.getByRole("button", { name: "View Breakdown" }).click()
    const breakdown = page.getByTestId(
      "entitlement-summary-dependent-breakdown-combined-dep"
    )
    await expect(breakdown.getByText("Dependent Breakdown")).toBeVisible()
    await expect(breakdown.getByText("Utilisation")).toBeVisible()
    await expect(
      breakdown.getByText("Allocated", { exact: true })
    ).not.toBeVisible()
    await expect(breakdown.getByText("Left", { exact: true })).not.toBeVisible()
    await expect(breakdown.getByText("Daniel Wilson")).toBeVisible()
    await expect(breakdown.getByText("Emma Wilson")).toBeVisible()
  })

  test("shared dependent benefit usage omits individual allocation and balance columns", async ({
    page,
  }) => {
    await page.goto(employeeUsageUrl("EMP-20260115-0003"))

    await page.getByRole("button", { name: /Gym Access/ }).click()
    const benefitSummary = page.getByTestId(
      "entitlement-benefit-summary-POL-20260115-0003-B1"
    )
    await expect(benefitSummary).toBeVisible({ timeout: 15000 })
    await expect(benefitSummary.getByText("Dependents")).toBeVisible()
    await expect(
      benefitSummary.getByText("Shared Dependent Pool")
    ).not.toBeVisible()

    await page.getByRole("button", { name: "View Breakdown" }).click()
    const breakdown = page.getByTestId(
      "entitlement-summary-dependent-breakdown-dep-shared"
    )
    await expect(breakdown.getByText("Dependent Breakdown")).toBeVisible()
    await expect(
      breakdown.getByText("Allocated", { exact: true })
    ).not.toBeVisible()
    await expect(breakdown.getByText("Left", { exact: true })).not.toBeVisible()
    await expect(breakdown.getByText("Siti Rahmah")).toBeVisible()
  })

  test("individual pools render direct dependent allocation rows", async ({
    page,
  }) => {
    await page.goto(employeeUsageUrl("EMP-20260115-0006"))

    await page.getByRole("button", { name: "View Breakdown" }).click()
    const breakdown = page.getByTestId(
      "entitlement-summary-dependent-breakdown-dep-individual"
    )
    await expect(breakdown).toBeVisible({ timeout: 15000 })
    await expect(breakdown.getByText("Dependent Allocations")).toBeVisible()
    await expect(
      breakdown.getByText("Allocated", { exact: true })
    ).toBeVisible()
    await expect(breakdown.getByText("Used", { exact: true })).toBeVisible()
    await expect(breakdown.getByText("Left", { exact: true })).toBeVisible()
    await expect(
      breakdown.getByText("Utilisation", { exact: true })
    ).toBeVisible()
    await expect(breakdown.getByText("Nadia Faizal")).toBeVisible()
    await expect(breakdown.getByText("Aisyah Faizal")).toBeVisible()
    await expect(breakdown.getByText("Faris Faizal")).toBeVisible()
    await expect(breakdown.getByText("Hana Faizal")).not.toBeVisible()
    await expect(
      breakdown.getByRole("button", { name: "View All Dependents (6)" })
    ).toBeVisible()

    await breakdown
      .getByRole("button", { name: "View All Dependents (6)" })
      .click()
    await expect(breakdown.getByText("Hana Faizal")).toBeVisible()
    await expect(breakdown.getByText("Juna Faizal")).toBeVisible()
    await expect(
      breakdown.getByRole("button", { name: "Show Fewer Dependents" })
    ).toBeVisible()
  })
})
