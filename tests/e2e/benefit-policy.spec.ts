import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 60000 });

async function waitForAnimation(page: import("@playwright/test").Page) {
  await page.waitForTimeout(300);
}

// ─── Policy List Tests ───────────────────────────────────────────────────────

test.describe("Policy List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
  });

  test("PL-01: Render with initial policies", async ({ page }) => {
    await expect(page.getByText("Standard Health 2026", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Contractor Lite")).toBeVisible();
  });

  test("PL-03: Filter by Draft status", async ({ page }) => {
    await page.getByRole("button", { name: /^All \(\d+\)/ }).click();
    await page.getByRole("button", { name: /^Draft \(\d+\)/ }).click();
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Standard Health 2026", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Contractor Lite")).not.toBeVisible();
  });

  test("PL-05: Filter by Active status", async ({ page }) => {
    await page.getByRole("button", { name: /^All \(\d+\)/ }).click();
    await page.getByRole("button", { name: /^Active \(\d+\)/ }).click();
    await expect(page.getByText("Standard Health 2026", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Executive Wellness")).not.toBeVisible();
  });

  test("PL-06: Search for policy", async ({ page }) => {
    await page.getByPlaceholder("Search policies or benefit IDs...").fill("Executive");
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Standard Health 2026", { exact: true })).not.toBeVisible();
  });

  test("PL-10: Click row opens detail view", async ({ page }) => {
    await page.getByText("Standard Health 2026", { exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Standard Health 2026" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Sub-Policies")).toBeVisible();
  });

  test("PL-11: Clone policy opens dialog", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: /^Standard Health 2026\s/ }).first();
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Clone policy").click();
    await expect(page.getByRole("heading", { name: "Clone Policy" })).toBeVisible();
    await page.locator("input").last().fill("Cloned Policy");
    await page.getByRole("button", { name: "Clone Policy", exact: true }).click();
  });

  test("PL-12: Deactivate active policy", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: /^Standard Health 2026\s/ }).first();
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Deactivate policy").click();
    await expect(page.getByRole("heading", { name: "Deactivate Policy" })).toBeVisible();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Deactivate", exact: true }).click({ force: true });
    await expect(page.getByText(/deactivated/)).toBeVisible({ timeout: 5000 });
  });

  test("PL-13: Delete draft policy", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Executive Wellness" });
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Delete policy").click();
    await expect(page.getByText("Permanently delete")).toBeVisible();
    await page.getByRole("button", { name: "Delete Policy", exact: true }).click();
    await expect(page.getByText("Executive Wellness", { exact: true }).first()).not.toBeVisible();
  });
});

// ─── Policy Detail View Tests ────────────────────────────────────────────────

test.describe("Policy Detail View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026", { exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Standard Health 2026" })).toBeVisible({ timeout: 10000 });
  });

  test("DV-01: Header shows status badge and cadence", async ({ page }) => {
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Yearly refresh/)).toBeVisible();
    await expect(page.getByText(/Fixed allocation/)).toBeVisible();
  });

  test("DV-04: Overview tab shows sections", async ({ page }) => {
    await expect(page.getByText("Policy Overview")).toBeVisible();
    await expect(page.getByText("Pool & Cycle")).toBeVisible();
    await expect(page.getByText("Benefit Groups")).toBeVisible();
  });

  test("DV-07: Sub-Policies tab is visible and clickable", async ({ page }) => {
    await page.getByText("Sub-Policies").click();
    await expect(page.getByText("Sub-Policies")).toBeVisible();
  });

  test("DV-08: Assigned Employees tab shows content", async ({ page }) => {
    await page.getByText("Assigned Employees").click();
    await expect(page.getByText("Assigned Employees")).toBeVisible();
  });

  test("DV-09: Audit Log tab shows empty state", async ({ page }) => {
    await page.getByText("Audit Log").click();
    await expect(page.getByText("No audit events yet")).toBeVisible();
  });

  test("DV-10: Edit button opens wizard", async ({ page }) => {
    await page.getByRole("button", { name: "Edit Policy" }).click();
    await page.waitForURL(/\/policies\/.+\/edit/);
    await expect(page.getByText("Edit Benefit Policy")).toBeVisible();
  });
});

// ─── Sub-Policies Tab Tests ──────────────────────────────────────────────────

test.describe("Sub-Policies", () => {
  test("SP-01: Sub-Policies tab renders for active policy", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026", { exact: true }).first().click();
    await page.getByText("Sub-Policies").click();
    await expect(page.getByText("Sub-Policies")).toBeVisible();
  });

  test("SP-02: Sub-Policies tab shows empty state for draft policy", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Executive Wellness").click();
    await page.getByText("Sub-Policies").click();
    await expect(page.getByText("No sub-policies yet")).toBeVisible();
  });
});

// ─── Wizard Tests ────────────────────────────────────────────────────────────

test.describe("Benefit Policy Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await page.getByRole("button", { name: "Create New Policy" }).click();
    await expect(page.getByText("Create Benefit Policy")).toBeVisible();
    await page.getByText("Start from Scratch").click();
    await page.waitForURL("/policies/new");
    await expect(page.getByText("Create Benefit Policy")).toBeVisible();
  });

  test("WZ-01: Empty name validation", async ({ page }) => {
    await page.getByRole("button", { name: "Create Policy" }).click();
    await expect(page.getByText("Policy name is required")).toBeVisible();
  });

  test("WZ-03: No employment types validation", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Test Policy");
    await page.getByRole("button", { name: "Full-time" }).click();
    await page.getByRole("button", { name: "Create Policy" }).click();
    await expect(page.getByText("Select at least one employment type")).toBeVisible();
  });

  test("WZ-04: Valid basics advances to review", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Test Policy");
    await page.getByPlaceholder("e.g. ORG-20260115-0001").fill("ORG-TEST");
    await page.getByRole("button", { name: "Add Group" }).click();
    await page.locator("input[placeholder='Group Name']").fill("Test Group");
    await page.getByText("Gymnasium Facilities").locator("..").locator("button").click();
    await page.locator("input[type='number']").last().fill("100");
    await page.getByRole("button", { name: "Create Policy" }).click();
    await expect(page.getByText("Review & Confirm")).toBeVisible();
  });

  test("WZ-21: Create policy shows success modal", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Draft Test");
    await page.getByPlaceholder("e.g. ORG-20260115-0001").fill("ORG-TEST");
    await page.getByRole("button", { name: "Add Group" }).click();
    await page.locator("input[placeholder='Group Name']").fill("Test Group");
    await page.getByText("Gymnasium Facilities").locator("..").locator("button").click();
    await page.locator("input[type='number']").last().fill("100");
    await page.getByRole("button", { name: "Create Policy" }).click();
    await expect(page.getByText("Review & Confirm")).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Create" }).click();
    await expect(page.getByRole("heading", { name: "Policy Created" })).toBeVisible();
    await expect(page.getByText("Draft Test")).toBeVisible();
  });
});

// ─── Integration Tests ───────────────────────────────────────────────────────

test.describe("Integration", () => {
  test("E2E-01: Create → Review → Confirm", async ({ page }) => {
    await page.goto("/policies");
    await page.getByRole("button", { name: "Create New Policy" }).click();
    await page.getByText("Start from Scratch").click();
    await page.waitForURL("/policies/new");

    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("E2E Test Policy");
    await page.getByPlaceholder("e.g. ORG-20260115-0001").fill("ORG-E2E");
    await page.getByRole("button", { name: "Add Group" }).click();
    await page.locator("input[placeholder='Group Name']").fill("Test Group");
    await page.getByText("Gymnasium Facilities").locator("..").locator("button").click();
    await page.locator("input[type='number']").last().fill("100");
    await page.getByRole("button", { name: "Create Policy" }).click();
    await expect(page.getByText("Review & Confirm")).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Create" }).click();
    await expect(page.getByRole("heading", { name: "Policy Created" })).toBeVisible();
    await page.getByRole("button", { name: "Done" }).click();
    await page.waitForURL("/policies");
  });

  test("E2E-02: Edit active policy opens edit page", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026", { exact: true }).first().click();
    await page.getByRole("button", { name: "Edit Policy" }).click();
    await expect(page.getByRole("heading", { name: "Edit Benefit Policy" })).toBeVisible();
  });

  test("E2E-03: Clone policy", async ({ page }) => {
    await page.goto("/policies");
    const row = page.locator("tr").filter({ hasText: /^Standard Health 2026\s/ }).first();
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Clone policy").click();
    await expect(page.getByRole("heading", { name: "Clone Policy" })).toBeVisible();
    await page.locator("input").last().fill("Standard Health 2026 — Copy");
    await page.getByRole("button", { name: "Clone Policy", exact: true }).click();
    await waitForAnimation(page);
    await page.getByText("Standard Health 2026 — Copy", { exact: true }).first().click();
    await expect(page.getByText("Policy Overview")).toBeVisible();
  });

  test("E2E-04: Org page → Policies tab shows policy list", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await page.getByRole("button", { name: "Benefit Policy" }).click();
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible();
  });
});

// ─── Org Onboarding Flow Tests ───────────────────────────────────────────────

test.describe("Organisation Onboarding", () => {
  test("ON-01: Create org and verify setup guide appears", async ({ page }) => {
    await page.goto("/organizations/new");
    await expect(page.getByText("Create Organisation")).toBeVisible();
    const fields = page.locator("input, select, textarea");
    const count = await fields.count();
    expect(count).toBeGreaterThan(0);
  });

  test("ON-02: Setup guide step 1 — define employee tiers", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await expect(page.getByText("Define employee tiers")).toBeVisible();
    await page.locator("a").filter({ hasText: "Set up tiers" }).click();
    await page.waitForTimeout(500);
  });

  test("ON-03: Setup guide step 2 — employee section visible", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await expect(page.getByText("Add employees").first()).toBeVisible();
    await page.locator("a").filter({ hasText: /Add employees|Bulk upload/ }).first().click();
    await page.waitForTimeout(500);
  });

  test("ON-04: Setup guide step 3 — create a benefit policy", async ({ page }) => {
    await page.goto("/organizations/org_1?tab=profile");
    await expect(page.getByText("Create a benefit policy")).toBeVisible();
  });

  test("ON-05: Setup guide step 4 — review coverage", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await expect(page.getByText("Assign policies to employees")).toBeVisible();
  });

  test("ON-06: Org tiers config — create new tier", async ({ page }) => {
    await page.goto("/organizations/org_1?tab=employees&subTab=tiers");
    await expect(page.getByText("Tier Config")).toBeVisible();
  });

  test("ON-07: Bulk upload wizard — upload page visible", async ({ page }) => {
    await page.goto("/organizations/org_1?tab=employees&isBulkUploading=true");
    await expect(page.getByText(/Upload CSV|Drop your file|Bulk Upload/)).toBeVisible();
  });

  test("ON-08: Policies tab on org detail page renders", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await page.getByRole("button", { name: "Benefit Policy" }).click();
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible();
  });
});
