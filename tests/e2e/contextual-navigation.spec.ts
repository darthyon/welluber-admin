import { expect, test, type Page } from "@playwright/test"

const ORG_ID = "ORG-20260115-0001"
const SP_ID = "SP-20260101-0001"
const EMPLOYEE_ID = "EMP-20260115-0001"

function breadcrumb(page: Page) {
  return page.getByRole("navigation", { name: "Breadcrumb" })
}

test.describe("Contextual Form Navigation", () => {
  test("organization employee creation keeps the organization context", async ({
    page,
  }) => {
    await page.goto(`/organizations/${ORG_ID}/employees/new`)

    const crumbs = breadcrumb(page)
    await expect(crumbs.getByRole("link", { name: "Organizations" })).toBeVisible()
    await expect(crumbs.getByRole("link", { name: "Employees" })).toHaveAttribute(
      "href",
      `/organizations/${ORG_ID}?tab=employees`
    )
    await expect(crumbs.getByText("Add Employee", { exact: true })).toBeVisible()
  })

  test("organization policy creation returns to the policy tab", async ({
    page,
  }) => {
    await page.goto(`/organizations/${ORG_ID}/policies/new`)

    const crumbs = breadcrumb(page)
    await expect(
      crumbs.getByRole("link", { name: "Benefit Policies" })
    ).toHaveAttribute("href", `/organizations/${ORG_ID}?tab=policies`)
    await expect(
      crumbs.getByText("Add Benefit Policy", { exact: true })
    ).toBeVisible()
  })

  test("service provider branch creation uses the canonical subpage", async ({
    page,
  }) => {
    await page.goto(`/service-providers/${SP_ID}/branches/new`)

    await expect(page).toHaveURL(`/service-providers/${SP_ID}/branches/new`)
    const crumbs = breadcrumb(page)
    await expect(crumbs.getByRole("link", { name: "Branches" })).toHaveAttribute(
      "href",
      `/service-providers/${SP_ID}?tab=branches`
    )
    await expect(crumbs.getByText("Add Branch", { exact: true })).toBeVisible()
  })

  test("legacy service provider branch creation redirects to the subpage", async ({
    page,
  }) => {
    await page.goto(
      `/service-providers/${SP_ID}?tab=branches&branchView=add`
    )

    await expect(page).toHaveURL(`/service-providers/${SP_ID}/branches/new`)
  })

  test("global employee edit keeps a valid employee breadcrumb", async ({
    page,
  }) => {
    await page.goto(`/employees/${EMPLOYEE_ID}/edit`)

    const crumbs = breadcrumb(page)
    await expect(crumbs.getByRole("link", { name: "Employees" })).toHaveAttribute(
      "href",
      "/employees"
    )
    await expect(crumbs.getByText("Edit Employee", { exact: true })).toBeVisible()
  })
})
