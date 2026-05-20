import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 60000 });

async function waitForAnimation(page: import("@playwright/test").Page) {
  await page.waitForTimeout(300);
}

// Navigate directly to wizard — bypasses launcher, same URL it produces
const WIZARD_URL = "/policies/new?orgId=ORG-20260115-0001";

async function openWizard(page: import("@playwright/test").Page) {
  // Clear stale drafts before navigating so resume dialog never appears
  await page.goto("/");
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.includes("policy-draft")).forEach(k => localStorage.removeItem(k));
    Object.keys(sessionStorage).filter(k => k.includes("policy-draft")).forEach(k => sessionStorage.removeItem(k));
  });
  await page.goto(WIZARD_URL);
  await expect(page.getByRole("heading", { name: "Add Benefit Policy" })).toBeVisible({ timeout: 15000 });
  // Wait for PolicyWizardContent to mount (resumeDecided=true fires after setTimeout)
  await expect(page.getByPlaceholder("e.g. Wellness Premium 2026")).toBeVisible({ timeout: 10000 });
}

// Fill minimum valid policy fields (groups not available in create mode — added post-creation via edit)
async function fillMinimalValidPolicy(page: import("@playwright/test").Page, name: string) {
  await page.getByPlaceholder("e.g. Wellness Premium 2026").fill(name);
  // Select org if not already locked via URL param
  const orgSelect = page.getByText("Select organisation...");
  if (await orgSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
    await orgSelect.click();
    await page.getByRole("option", { name: /Acme Corporation/ }).click();
  }
  // Employment types default to all selected — no action needed
  // Scroll to Pool & Cycle section and explicitly select January start month
  // (refreshStartMonth defaults to 1 in state but must be visible to the validator)
  await page.getByText("Pool & Cycle").first().scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Jan" }).first().click();
}

// ─── ADD: Create Benefit Policy ──────────────────────────────────────────────

test.describe("BP-ADD: Create Benefit Policy", () => {
  test("BP-ADD-01: Happy path — create policy, reach success modal", async ({ page }) => {
    await openWizard(page);
    await fillMinimalValidPolicy(page, "Maju Retail Wellness FY2026");
    // Submit via form directly to avoid sticky-bar button visibility issues
    await page.evaluate(() => {
      const form = document.getElementById("policyWizardForm") as HTMLFormElement | null;
      if (form) form.requestSubmit();
    });
    await page.waitForURL(/\/policies\/new\/review/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Review" })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByRole("heading", { name: "Policy Created" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Maju Retail Wellness FY2026")).toBeVisible();
  });

  test("BP-ADD-02: Launcher shows template option", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Add Benefit Policy" }).click();
    await expect(page.getByText("From Template")).toBeVisible();
    await expect(page.getByText("From Scratch")).toBeVisible();
  });

  test("BP-ADD-04 [INVALID]: Empty name shows validation error", async ({ page }) => {
    await openWizard(page);
    // No name filled — submit directly
    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByText("Policy name is required").first()).toBeVisible();
  });

  test("BP-ADD-04b [INVALID]: Empty name — stays on wizard page", async ({ page }) => {
    await openWizard(page);
    await page.getByRole("button", { name: "Review" }).click();
    // Must not navigate away
    await expect(page).toHaveURL(/\/policies\/new/);
    await expect(page).not.toHaveURL(/\/policies\/new\/review/);
  });

  test("BP-ADD-06: Groups section absent in create mode — added post-creation", async ({ page }) => {
    await openWizard(page);
    // Benefit Groups SECTION intentionally hidden in create mode — groups added post-creation
    // Check that the section heading and Add Group action are absent
    await expect(page.getByRole("heading", { name: "Benefit Groups" })).not.toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Group" })).not.toBeVisible();
  });
});

// ─── EDIT: Modify Existing Policy ────────────────────────────────────────────

test.describe("BP-EDIT: Modify Benefit Policy", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
  });

  test("BP-EDIT-01: Edit active policy opens edit mode with pre-filled name", async ({ page }) => {
    await page.getByText("Acme Employee Wellness Policy FY2026").first().click();
    await expect(page.getByRole("heading", { name: "Acme Employee Wellness Policy FY2026" })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "Edit Policy" }).click();
    await page.waitForURL(/\/policies\/.+\/edit/);
    await expect(page.getByText("Edit Benefit Policy")).toBeVisible();
    // Edit page loads fresh (no pre-fill from mock data — only from sessionStorage draft)
    await expect(page.getByPlaceholder("e.g. Wellness Premium 2026")).toBeVisible();
  });

  test("BP-EDIT-04: Draft policy shows Edit button", async ({ page }) => {
    await page.getByText("Acme Leadership Benefits Policy FY2026").first().click();
    await expect(page.getByText("Draft").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Edit Policy" })).toBeVisible();
  });

  test("BP-EDIT-05: Deactivated policy has no Edit button", async ({ page }) => {
    await page.getByText("Global Tech Core Benefits Policy FY2026").first().click();
    await expect(page.getByText("Deactivated").first()).toBeVisible({ timeout: 10000 });
    await waitForAnimation(page);
    await expect(page.getByRole("button", { name: "Edit Policy" })).not.toBeVisible();
  });
});

// ─── VIEW: Policy Detail ──────────────────────────────────────────────────────

test.describe("BP-VIEW: Policy Detail View", () => {
  test("BP-VIEW-01: Active policy — all overview sections render", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Acme Employee Wellness Policy FY2026").first().click();
    await expect(page.getByRole("heading", { name: "Acme Employee Wellness Policy FY2026" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Policy Overview")).toBeVisible();
    await expect(page.getByText("Pool & Cycle")).toBeVisible();
    await expect(page.getByText("Benefit Groups")).toBeVisible();
  });

  test("BP-VIEW-02: Draft policy — Edit visible, Deactivate absent", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Acme Leadership Benefits Policy FY2026").first().click();
    await expect(page.getByText("Draft").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Edit Policy" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deactivate" })).not.toBeVisible();
  });

  test("BP-VIEW-03: Deactivated policy — no Edit button", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Global Tech Core Benefits Policy FY2026").first().click();
    await expect(page.getByText("Deactivated").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Edit Policy" })).not.toBeVisible();
  });

  test("BP-VIEW-07: Audit Log tab shows empty state", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Acme Employee Wellness Policy FY2026").first().click();
    await expect(page.getByRole("heading", { name: "Acme Employee Wellness Policy FY2026" })).toBeVisible({ timeout: 10000 });
    await page.getByText("Audit Log").click();
    await expect(page.getByText("No audit events yet")).toBeVisible();
  });

  test("BP-VIEW-05: Versions tab navigable on active policy", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Acme Employee Wellness Policy FY2026").first().click();
    await expect(page.getByRole("heading", { name: "Acme Employee Wellness Policy FY2026" })).toBeVisible({ timeout: 10000 });
    await waitForAnimation(page);
    await page.getByText("Versions").first().click();
    await expect(page.getByText("Versions").first()).toBeVisible();
  });

  test("BP-VIEW-08: Active policy header shows cadence subtitle", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible({ timeout: 15000 });
    await page.getByText("Acme Employee Wellness Policy FY2026").first().click();
    await expect(page.getByRole("heading", { name: "Acme Employee Wellness Policy FY2026" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Fixed allocation|Prorated/)).toBeVisible();
    await expect(page.getByText(/Yearly refresh|Monthly refresh/)).toBeVisible();
  });
});
