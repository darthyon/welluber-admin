import { expect, test } from "@playwright/test"

const EMPLOYEE_ID = "EMP-20260115-0001"

test.describe("Form Navigation", () => {
  test("create flow gates the next step until required fields are valid", async ({
    page,
  }) => {
    await page.goto("/employees/new")

    const actionBar = page.getByTestId("form-action-bar")
    const stepTwo = page.getByRole("button", { name: "2 Employment Details" })
    await expect(stepTwo).toBeDisabled()

    await actionBar.getByRole("button", { name: "Next", exact: true }).click()
    await expect(page.getByRole("heading", { name: "Personal Details" })).toBeVisible()
    await expect(stepTwo).toBeDisabled()

    await page.getByPlaceholder("e.g. Sarah").fill("Jordan")
    await page.getByPlaceholder("e.g. Jenkins").fill("Tan")
    await actionBar.getByRole("button", { name: "Next", exact: true }).click()

    await expect(page.getByRole("heading", { name: "Employment Details" })).toBeVisible()
    await expect(stepTwo).toHaveAttribute("aria-current", "step")
  })

  test("edit flow allows direct step access and keeps save available", async ({
    page,
  }) => {
    await page.goto(`/employees/${EMPLOYEE_ID}/edit`)

    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible()
    await page.getByRole("button", { name: "4 Dependent Details" }).click()

    await expect(page.getByRole("heading", { name: "Dependent Details" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible()
  })

  test("action footer stays within the viewport on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/employees/new")

    const footer = page.getByTestId("form-action-bar")
    await expect(footer).toBeVisible()

    const layout = await footer.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left,
        right: rect.right,
        viewportWidth: window.innerWidth,
        pageWidth: document.documentElement.scrollWidth,
      }
    })

    expect(layout.left).toBeGreaterThanOrEqual(0)
    expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth)
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth)
  })

  test("invalid employee detail does not fall back to a seeded employee", async ({
    page,
  }) => {
    await page.goto("/employees/EMP-INVALID")

    await expect(page.getByRole("heading", { name: "Employee Not Found" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Back To Employees" })).toBeVisible()
    await expect(page.getByText("Robert Fox")).toHaveCount(0)
  })

  test("invalid employee edit returns to the employee directory", async ({ page }) => {
    await page.goto("/employees/EMP-INVALID/edit")

    await expect(page).toHaveURL("/employees")
  })
})
