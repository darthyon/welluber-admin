import { expect, test, type Page } from "@playwright/test"

const ORG_ID = "ORG-20260115-0001"
const SP_ID = "SP-20260101-0001"
const EMPLOYEE_ID = "EMP-20260115-0001"
const POLICY_ID = "POL-20260115-0001"

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

  test("organization policy edit review keeps the organization context", async ({
    page,
  }) => {
    await page.goto(`/organizations/${ORG_ID}/policies/${POLICY_ID}/edit`)

    await page.getByRole("button", { name: "Review Changes" }).click()

    await expect(page).toHaveURL(
      `/organizations/${ORG_ID}/policies/${POLICY_ID}/edit/review`
    )
  })

  test("organization policy group editing returns to the policy tab", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, draft }) => sessionStorage.setItem(key, JSON.stringify(draft)),
      {
        key: `policy-groups-draft-${POLICY_ID}`,
        draft: {
          policy: { id: POLICY_ID, organizationId: ORG_ID },
          groups: [
            {
              id: `${POLICY_ID}-G1`,
              policyId: POLICY_ID,
              name: "Gym Membership",
              coverageScope: "Employee",
              distributionType: "IndividualBenefitAmount",
              isTaxable: false,
            },
          ],
          benefits: [
            {
              id: `${POLICY_ID}-B1`,
              groupId: `${POLICY_ID}-G1`,
              serviceId: "service-gym",
              amount: 200,
              coPayment: { required: false, type: "Percentage", value: 0 },
            },
          ],
        },
      }
    )
    await page.goto(`/policies/${POLICY_ID}/groups/edit?orgId=${ORG_ID}`)

    await page.getByRole("button", { name: "Save Changes" }).click()

    await expect(page).toHaveURL(`/organizations/${ORG_ID}?tab=policies`)
  })

  test("organization policy version cancellation returns to the policy tab", async ({
    page,
  }) => {
    await page.goto(`/policies/${POLICY_ID}/versions/new?orgId=${ORG_ID}`)

    await page.getByRole("button", { name: "Cancel" }).click()

    await expect(page).toHaveURL(`/organizations/${ORG_ID}?tab=policies`)
  })

  test("organization branch cancellation returns to the branches tab", async ({
    page,
  }) => {
    await page.goto(`/organizations/${ORG_ID}/branches/new`)

    await page
      .getByTestId("form-action-bar")
      .getByRole("button", { name: "Cancel", exact: true })
      .click()

    await expect(page).toHaveURL(`/organizations/${ORG_ID}?tab=branches`)
  })

  test("service provider edit cancellation returns to the provider", async ({
    page,
  }) => {
    await page.goto(`/service-providers/${SP_ID}/edit`)

    await page
      .getByTestId("form-action-bar")
      .getByRole("button", { name: "Cancel", exact: true })
      .click()

    await expect(page).toHaveURL(`/service-providers/${SP_ID}`)
  })

  test("invalid contextual records show not-found states", async ({ page }) => {
    await page.goto("/organizations/ORG-INVALID")
    await expect(
      page.getByRole("heading", { name: "Organisation Not Found" })
    ).toBeVisible()

    await page.goto("/service-providers/SP-INVALID/edit")
    await expect(
      page.getByRole("heading", { name: "Service Provider Not Found" })
    ).toBeVisible()

    await page.goto("/service-providers/SP-INVALID/voucher-packages/new")
    await expect(
      page.getByRole("heading", { name: "Service Provider Not Found" })
    ).toBeVisible()

    await page.goto(`/organizations/${ORG_ID}/branches/BR-INVALID/edit`)
    await expect(
      page.getByRole("heading", { name: "Branch Not Found" })
    ).toBeVisible()
  })

  test("finance sidebar destinations resolve to intentional placeholders", async ({
    page,
  }) => {
    await page.goto("/invoices")
    await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
    await expect(page.getByText("Coming Soon", { exact: true })).toBeVisible()

    await page.goto("/settlements")
    await expect(page.getByRole("heading", { name: "Settlements" })).toBeVisible()
    await expect(page.getByText("Coming Soon", { exact: true })).toBeVisible()
  })

  test("invalid organization portal slugs do not show Acme data", async ({
    page,
  }) => {
    await page.goto("/invalid-organization/dashboard")
    await expect(
      page.getByRole("heading", { name: "Organisation Not Found" })
    ).toBeVisible()
    await expect(page.getByText("Acme Corporation Sdn Bhd")).toHaveCount(0)

    await page.goto("/invalid-organization/settings")
    await expect(
      page.getByRole("heading", { name: "Organisation Not Found" })
    ).toBeVisible()
    await expect(page.getByText("Acme Corporation Sdn Bhd")).toHaveCount(0)
  })

  test("employee claims export downloads the filtered records", async ({ page }) => {
    await page.goto(`/employees/${EMPLOYEE_ID}?tab=claims`)

    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: "Export CSV" }).click()

    const file = await download
    expect(file.suggestedFilename()).toBe(`employee-claims-${EMPLOYEE_ID}.csv`)
  })

  test("account statement opens and downloads as CSV", async ({ page }) => {
    await page.goto("/accounts/ACC-20260115-0001")
    await page.getByRole("button", { name: "More Actions" }).click()
    await page.getByRole("button", { name: "View Statement" }).click()

    await expect(page.getByRole("heading", { name: "Account Statement" })).toBeVisible()
    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: "Download CSV" }).click()
    const file = await download
    expect(file.suggestedFilename()).toContain("statement.csv")
  })

  test("top-up history attachment action opens a record state", async ({ page }) => {
    await page.goto(
      `/organizations/${ORG_ID}?tab=branches&branchId=BR-20260115-0001`
    )
    await page.getByRole("tab", { name: "Configuration" }).click()
    await page.getByRole("button", { name: "History" }).click()

    const attachment = page.getByRole("button", { name: /View attachment for/ }).first()
    await attachment.click()
    await expect(page.getByRole("heading", { name: "Top-Up Attachment" })).toBeVisible()
  })

  test("account settings menu navigates to platform settings", async ({ page }) => {
    await page.goto("/dashboard")
    await page.getByRole("button", { name: "Admin WellUber Admin" }).click()
    await page.getByText("Account Settings", { exact: true }).click()

    await expect(page).toHaveURL("/settings")
  })
})
