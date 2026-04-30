import { test, expect } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function waitForAnimation(page) {
  await page.waitForTimeout(300);
}

// ─── Policy List Tests ───────────────────────────────────────────────────────

test.describe("Policy List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await expect(page.getByRole("heading", { name: "Benefit Policies" })).toBeVisible();
  });

  test("PL-01: Render with initial policies", async ({ page }) => {
    await expect(page.getByText("Standard Health 2026")).toBeVisible();
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Contractor Lite")).toBeVisible();
  });

  test("PL-03: Filter by Draft status", async ({ page }) => {
    await page.getByRole("button", { name: /Draft/ }).click();
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Standard Health 2026")).not.toBeVisible();
    await expect(page.getByText("Contractor Lite")).not.toBeVisible();
  });

  test("PL-05: Filter by Active status", async ({ page }) => {
    await page.getByRole("button", { name: /Active/ }).click();
    await expect(page.getByText("Standard Health 2026")).toBeVisible();
    await expect(page.getByText("Executive Wellness")).not.toBeVisible();
  });

  test("PL-06: Search for policy", async ({ page }) => {
    await page.getByPlaceholder("Search policies...").fill("Executive");
    await expect(page.getByText("Executive Wellness")).toBeVisible();
    await expect(page.getByText("Standard Health 2026")).not.toBeVisible();
  });

  test("PL-10: Click row opens detail view", async ({ page }) => {
    await page.getByText("Standard Health 2026").click();
    await expect(page.getByRole("heading", { name: "Standard Health 2026" })).toBeVisible();
    await expect(page.getByText("Overview")).toBeVisible();
    await expect(page.getByText("Tier Variants")).toBeVisible();
  });

  test("PL-11: Clone policy opens dialog", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Standard Health 2026" });
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Clone policy").click();
    await expect(page.getByText("Clone Policy")).toBeVisible();
    await expect(page.getByDisplayValue("Standard Health 2026 — Copy")).toBeVisible();
  });

  test("PL-12: Deactivate active policy", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Standard Health 2026" });
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Deactivate policy").click();
    await expect(page.getByText("Deactivate Policy")).toBeVisible();
    await page.getByRole("button", { name: "Deactivate" }).click();
    await expect(page.getByText("Policy \"Standard Health 2026\" deactivated")).toBeVisible();
  });

  test("PL-13: Delete draft policy", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Executive Wellness" });
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Delete policy").click();
    await expect(page.getByText("Permanently delete")).toBeVisible();
    await page.getByRole("button", { name: "Delete Policy" }).click();
    await expect(page.getByText("Executive Wellness")).not.toBeVisible();
  });
});

// ─── Policy Detail View Tests ────────────────────────────────────────────────

test.describe("Policy Detail View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026").click();
    await expect(page.getByRole("heading", { name: "Standard Health 2026" })).toBeVisible();
  });

  test("DV-01: Header shows status badge and cadence", async ({ page }) => {
    await expect(page.getByText("Active")).toBeVisible();
    await expect(page.getByText(/Yearly refresh/)).toBeVisible();
    await expect(page.getByText(/Fixed allocation/)).toBeVisible();
  });

  test("DV-04: Overview tab shows sections", async ({ page }) => {
    await expect(page.getByText("Basics")).toBeVisible();
    await expect(page.getByText("Pool & Cycle")).toBeVisible();
    await expect(page.getByText("Benefit Groups")).toBeVisible();
  });

  test("DV-07: Tier Variants tab is visible and clickable", async ({ page }) => {
    await page.getByRole("tab", { name: /Tier Variants/ }).click();
    await expect(page.getByText("Base")).toBeVisible();
  });

  test("DV-08: Assigned Orgs tab shows placeholder", async ({ page }) => {
    await page.getByRole("tab", { name: /Assigned Orgs/ }).click();
    await expect(page.getByText("Assigned Organisations")).toBeVisible();
  });

  test("DV-09: Audit Log tab shows empty state", async ({ page }) => {
    await page.getByRole("tab", { name: /Audit Log/ }).click();
    await expect(page.getByText("No audit events yet")).toBeVisible();
  });

  test("DV-10: Edit button opens wizard", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Edit Benefit Policy")).toBeVisible();
  });
});

// ─── Tier Variants Tests ─────────────────────────────────────────────────────

test.describe("Tier Variants", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026").click();
    await page.getByRole("tab", { name: /Tier Variants/ }).click();
    await expect(page.getByText("Base")).toBeVisible();
  });

  test("TV-01: Base panel shows groups and services", async ({ page }) => {
    await page.getByRole("button", { name: "Base" }).click();
    await expect(page.getByText("Base Amounts")).toBeVisible();
    await expect(page.getByText("Physical Wellbeing")).toBeVisible();
    await expect(page.getByText("Mental Fitness")).toBeVisible();
  });

  test("TV-05: Nav shows all tiers", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Band 1 — VP and above" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Band 2 — Manager / Senior" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Band 3 — Executive / Associate" })).toBeVisible();
  });

  test("TV-07: Incomplete tier shows orange dot", async ({ page }) => {
    const band3 = page.locator("button", { hasText: "Band 3" });
    await expect(band3.locator(".bg-amber-500")).toBeVisible();
    await expect(band3.getByText("incomplete")).toBeVisible();
  });

  test("TV-08: Complete tier shows override count", async ({ page }) => {
    const band1 = page.locator("button", { hasText: "Band 1" });
    await expect(band1.getByText("2 overrides")).toBeVisible();
  });

  test("TV-10: Add tier inline", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await expect(page.getByPlaceholder("Tier name...")).toBeVisible();
  });

  test("TV-11: Create new tier and auto-select", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Band 4 — Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);
    await expect(page.getByRole("button", { name: "Band 4 — Test" })).toBeVisible();
    await expect(page.getByText("Configure eligibility rules and benefit overrides")).toBeVisible();
  });

  test("TV-15: Select tier shows eligibility and overrides", async ({ page }) => {
    await page.getByRole("button", { name: "Band 1 — VP and above" }).click();
    await expect(page.getByText("Eligibility Rules")).toBeVisible();
    await expect(page.getByText("Benefit Overrides")).toBeVisible();
    await expect(page.getByText("Physical Wellbeing")).toBeVisible();
  });

  test("TV-16: Toggle employment type chip", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Test Tier");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    const fullTimeChip = page.locator("button", { hasText: "Full-time" }).last();
    await fullTimeChip.click();
    await expect(fullTimeChip).toHaveClass(/bg-primary/);
    await fullTimeChip.click();
    await expect(fullTimeChip).not.toHaveClass(/bg-primary/);
  });

  test("TV-20: Override input shows purple border when set", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Test Tier");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    await page.getByRole("button", { name: "Full-time" }).last().click();
    const input = page.locator("input[type='number']").first();
    await input.fill("5000");
    await expect(input).toHaveClass(/border-primary/);
  });

  test("TV-21: Clear override removes purple border", async ({ page }) => {
    await page.getByRole("button", { name: "Band 1 — VP and above" }).click();
    const input = page.locator("input[type='number']").first();
    await expect(input).toHaveValue("5000");
    await page.locator("button[title='Clear override']").first().click();
    await expect(input).toHaveValue("");
    await expect(input).not.toHaveClass(/border-primary/);
  });

  test("TV-23: Save tier updates status", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Save Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    await page.getByRole("button", { name: "Full-time" }).last().click();
    const input = page.locator("input[type='number']").first();
    await input.fill("1000");

    await page.getByRole("button", { name: "Save Tier" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    const tierButton = page.locator("button", { hasText: "Save Test" });
    await expect(tierButton.getByText("1 override")).toBeVisible();
  });

  test("TV-24: Save tier with 0 employment types shows error", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Error Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    await page.getByRole("button", { name: "Save Tier" }).click();
    await expect(page.getByText("Select at least one employment type")).toBeVisible();
  });

  test("TV-26: Remove tier shows confirmation dialog", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Remove Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    await page.getByRole("button", { name: "Remove Tier" }).click();
    await expect(page.getByText(/Remove Remove Test/)).toBeVisible();
  });

  test("TV-27: Confirm remove tier", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Remove Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    await page.getByRole("button", { name: "Remove Tier" }).click();
    await page.getByRole("button", { name: "Remove Tier" }).nth(1).click();
    await waitForAnimation(page);
    await expect(page.getByRole("button", { name: "Remove Test" })).not.toBeVisible();
  });

  test("TV-14: Draft policy disables add tier", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Executive Wellness").click();
    await page.getByRole("tab", { name: /Tier Variants/ }).click();
    const addButton = page.getByRole("button", { name: "+ Add tier" });
    await expect(addButton).toBeDisabled();
  });
});

// ─── Wizard Tests ────────────────────────────────────────────────────────────

test.describe("Benefit Policy Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policies");
    await page.getByRole("button", { name: "Create New Policy" }).click();
    await expect(page.getByText("Create Benefit Policy")).toBeVisible();
  });

  test("WZ-01: Empty name validation", async ({ page }) => {
    await page.getByRole("button", { name: "Next Step" }).click();
    await expect(page.getByText("Policy name is required")).toBeVisible();
  });

  test("WZ-03: No employment types validation", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Test Policy");
    await page.getByRole("button", { name: "Full-time" }).click();
    await page.getByRole("button", { name: "Next Step" }).click();
    await expect(page.getByText("Select at least one employment type")).toBeVisible();
  });

  test("WZ-04: Valid basics advances to step 2", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Test Policy");
    await page.getByRole("button", { name: "Next Step" }).click();
    await expect(page.getByText("Pool Config")).toBeVisible();
  });

  test("WZ-21: Save as draft shows activation modal", async ({ page }) => {
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("Draft Test");
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByText("Save as Draft").click();
    await expect(page.getByText("Policy Created")).toBeVisible();
    await expect(page.getByRole("button", { name: "Activate & set up tiers" })).toBeVisible();
  });
});

// ─── Integration Tests ───────────────────────────────────────────────────────

test.describe("Integration", () => {
  test("E2E-01: Create → Save Draft → Activate", async ({ page }) => {
    await page.goto("/policies");
    await page.getByRole("button", { name: "Create New Policy" }).click();

    // Step 1
    await page.getByPlaceholder("e.g. Wellness Premium 2026").fill("E2E Test Policy");
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 2
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 3
    await page.getByRole("button", { name: "Add Group" }).click();
    await page.locator("input[placeholder='Group Name']").fill("Test Group");
    await page.getByRole("button", { name: "Add Service" }).first().click();
    await page.locator("input[type='number']").first().fill("100");
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 4 - Save draft
    await page.getByText("Save as Draft").click();
    await expect(page.getByText("Policy Created")).toBeVisible();

    // Activate
    await page.getByRole("button", { name: "Activate & set up tiers" }).click();
    await waitForAnimation(page);

    // Verify active
    await expect(page.getByText("E2E Test Policy")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
  });

  test("E2E-03: Full tier lifecycle", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026").click();
    await page.getByRole("tab", { name: /Tier Variants/ }).click();

    // Add tier
    await page.getByRole("button", { name: "+ Add tier" }).click();
    await page.getByPlaceholder("Tier name...").fill("Lifecycle Test");
    await page.keyboard.press("Enter");
    await waitForAnimation(page);

    // Configure
    await page.getByRole("button", { name: "Full-time" }).last().click();
    await page.locator("input[type='number']").first().fill("999");
    await page.getByRole("button", { name: "Save Tier" }).click();

    // Verify
    await expect(page.locator("button", { hasText: "Lifecycle Test" }).getByText("1 override")).toBeVisible();

    // Remove
    await page.getByRole("button", { name: "Remove Tier" }).click();
    await page.getByRole("button", { name: "Remove Tier" }).nth(1).click();
    await waitForAnimation(page);

    // Verify removed
    await expect(page.getByRole("button", { name: "Lifecycle Test" })).not.toBeVisible();
  });

  test("E2E-04: Clone with tiers", async ({ page }) => {
    await page.goto("/policies");
    const row = page.locator("tr", { hasText: "Standard Health 2026" });
    await row.locator("[data-testid='action-popover-trigger']").click();
    await page.getByText("Clone policy").click();
    await page.getByRole("button", { name: "Clone Policy" }).click();
    await waitForAnimation(page);

    // Open cloned policy
    await page.getByText("Standard Health 2026 — Copy").click();
    await page.getByRole("tab", { name: /Tier Variants/ }).click();

    // Verify tiers copied
    await expect(page.getByRole("button", { name: "Band 1 — VP and above" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Band 2 — Manager / Senior" })).toBeVisible();
  });

  test("E2E-05: Edit active policy shows banner", async ({ page }) => {
    await page.goto("/policies");
    await page.getByText("Standard Health 2026").click();
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Changes apply to future assignments only")).toBeVisible();
  });

  test("E2E-07: Org page → View policy → Detail view", async ({ page }) => {
    await page.goto("/organizations/org_1");
    await page.getByRole("tab", { name: /Benefit Policy/ }).click();
    await page.getByText("Wellness Allocation").click();
    await expect(page.getByText("Overview")).toBeVisible();
    await expect(page.getByText("Tier Variants")).toBeVisible();
  });
});
