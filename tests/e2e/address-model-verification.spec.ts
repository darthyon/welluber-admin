import { test, expect, type Page, type Locator } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const ORG_ID = "ORG-20260115-0001";
const SP_ID = "SP-20260101-0001";
const BRANCH_ID = "br_1";

async function waitForAnimation(page: Page) {
  await page.waitForTimeout(300);
}

/**
 * Most forms in this app render a bare <label> followed by its control as a
 * sibling, with no htmlFor/id pair, so getByLabel does not resolve them.
 * LocationPicker is the exception — its fields are properly associated.
 */
function field(page: Page, label: string | RegExp): Locator {
  return page
    .locator("label")
    .filter({ hasText: label })
    .locator("xpath=./following-sibling::input");
}

function selectTrigger(page: Page, label: string | RegExp): Locator {
  return page
    .locator("label")
    .filter({ hasText: label })
    .locator("xpath=./following-sibling::button");
}

/**
 * Reads the value rendered by a <DetailField label=… />.
 * DetailField renders: container > [ div > p(label), div(value) ]
 * so from the label <p>, the value is the next sibling of its wrapper.
 */
function detailLabel(page: Page, label: string): Locator {
  // Scoped to <p> — some pages carry a form <label> with the same text.
  const exact = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
  return page.locator("p").filter({ hasText: exact }).first();
}

function detailValue(page: Page, label: string): Locator {
  return detailLabel(page, label).locator("xpath=../following-sibling::div[1]");
}

async function pickOption(page: Page, combobox: Locator, option: string) {
  await combobox.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/** Fills every non-address field step 1 requires, leaving the address to the caller. */
async function fillOrgStep1NonAddress(page: Page) {
  await field(page, "Company Name").fill("Test Address Org");
  await field(page, "Registration Number").fill("TEST-123456");
  await field(page, "TIN Number").fill("C 1234567890");
  await pickOption(page, selectTrigger(page, "Industry"), "Retail");
  await pickOption(page, selectTrigger(page, "Organisation Type"), "Private Limited (Sdn. Bhd.)");
  await pickOption(page, selectTrigger(page, "Bank Name"), "Maybank Berhad");
  await field(page, "Account Number").fill("1234567890");
  await field(page, "Account Name").fill("Test Org Sdn Bhd");
}

// ─── ADDRESS-01: Org Creation with LocationPicker ─────────────────────────────

test.describe("ADDRESS-01: Org Creation Address Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/organizations/new");
    await expect(page.getByRole("heading", { name: "Add New Organisation" })).toBeVisible({ timeout: 15000 });
  });

  test("ADDRESS-01-01: LocationPicker renders all address fields", async ({ page }) => {
    await waitForAnimation(page);

    // Verify all structured fields are present
    await expect(page.getByLabel(/Street Address/i)).toBeVisible();
    await expect(page.getByLabel("City")).toBeVisible();
    await expect(page.getByLabel(/Postal Code/i)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "State" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Country" })).toBeVisible();
  });

  test("ADDRESS-01-02: LocationPicker accepts manual coordinate input", async ({ page }) => {
    await waitForAnimation(page);

    // Fill address fields
    await page.getByLabel(/Street Address/i).fill("Level 15, Menara Southpoint");
    await page.getByLabel("City").fill("Kuala Lumpur");
    await page.getByLabel(/Postal Code/i).fill("59200");

    // State and Country are Radix comboboxes, not native <select>
    await pickOption(page, page.getByRole("combobox", { name: "State" }), "Kuala Lumpur");
    await pickOption(page, page.getByRole("combobox", { name: "Country" }), "Malaysia");

    // Coordinates live behind a click-to-edit pill with placeholder-only inputs
    await page.getByRole("button", { name: /Set coordinates|^[\d.]+, [\d.]+$/ }).click();
    await waitForAnimation(page);

    // exact: true — the search box placeholder "…autopopulate…" contains "Lat"
    const latInput = page.getByPlaceholder("Lat", { exact: true });
    const lonInput = page.getByPlaceholder("Lon", { exact: true });
    await expect(latInput).toBeVisible();

    await latInput.fill("3.1390");
    await lonInput.fill("101.7036");
    await page.getByRole("button", { name: "Apply coordinates" }).click();
    await waitForAnimation(page);

    // Committed coords are echoed back on the pill as flat lat/lon numbers
    await expect(page.getByRole("button", { name: "3.139, 101.7036" })).toBeVisible();
  });

  test("ADDRESS-01-03: Complete org creation flow captures full address", async ({ page }) => {
    // Fill minimal required fields to pass validation
    await field(page, "Company Name").fill("Test Address Org");
    await field(page, "Registration Number").fill("TEST-123456");
    await field(page, "TIN Number").fill("C 1234567890");
    // Industry is required by createOrganizationSchema
    await pickOption(page, selectTrigger(page, "Industry"), "Retail");

    // Organisation Type is a Radix Select — clicking its text only opens the
    // listbox, which locks page scroll until an option is committed.
    await pickOption(page, selectTrigger(page, "Organisation Type"), "Private Limited (Sdn. Bhd.)");

    // Fill address
    await page.getByLabel(/Street Address/i).fill("No. 1, Jalan Test");
    await page.getByLabel(/Postal Code/i).fill("47800");
    // Postal code blur auto-fills city and state
    await page.getByLabel("City").click();
    await expect(page.getByLabel("City")).toHaveValue("Petaling Jaya");
    await pickOption(page, page.getByRole("combobox", { name: "Country" }), "Malaysia");

    // Fill bank details (minimal)
    // 12 banks exceeds FormSelect's search threshold, so this is the
    // SearchableSelect (cmdk) variant — its items are still role="option".
    await pickOption(page, selectTrigger(page, "Bank Name"), "Maybank Berhad");
    await field(page, "Account Number").fill("1234567890");
    await field(page, "Account Name").fill("Test Org Sdn Bhd");

    // Submit step 1
    await page.getByRole("button", { name: /Next|Continue/i }).first().click();
    await waitForAnimation(page);

    // Should advance to step 2 (HQ Branch setup)
    await expect(page.getByRole("heading", { name: "Set Up HQ Branch" })).toBeVisible({ timeout: 10000 });
  });
});

// ─── ADDRESS-02: Org Edit Pre-fills Address ───────────────────────────────────

test.describe("ADDRESS-02: Org Edit Address Pre-fill", () => {
  test("ADDRESS-02-01: Edit page loads existing address with all fields", async ({ page }) => {
    await page.goto(`/organizations/${ORG_ID}/edit`);
    await expect(page.getByRole("heading", { name: "Edit Organisation" })).toBeVisible({ timeout: 15000 });

    await waitForAnimation(page);

    // Address line should be pre-filled from the org record
    const addressLine = page.getByLabel(/Street Address/i);
    await expect(addressLine).toBeVisible();
    expect((await addressLine.inputValue()).length).toBeGreaterThan(0);

    // Verify remaining address fields render and carry values
    await expect(page.getByLabel("City")).toBeVisible();
    await expect(page.getByLabel(/Postal Code/i)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "State" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Country" })).toBeVisible();
    expect((await page.getByLabel("City").inputValue()).length).toBeGreaterThan(0);
  });
});

// ─── ADDRESS-03: Branch Detail Display ────────────────────────────────────────

test.describe("ADDRESS-03: Branch Detail Address Display", () => {
  test("ADDRESS-03-01: Host branch detail shows flat coordinates", async ({ page }) => {
    // Host branch detail is an in-page view driven by query state, not a route
    await page.goto(`/organizations/${ORG_ID}?tab=branches&branchId=${BRANCH_ID}`);
    await expect(detailLabel(page, "Street Address")).toBeVisible({ timeout: 15000 });

    // Coordinates render as flat lat/lon numbers, not a nested geo object
    await expect(detailLabel(page, "Latitude")).toBeVisible();
    await expect(detailLabel(page, "Longitude")).toBeVisible();
    await expect(detailValue(page, "Latitude")).toHaveText(/^\d+\.\d+$/);
    await expect(detailValue(page, "Longitude")).toHaveText(/^\d+\.\d+$/);

    // Country and city come from the address; timezone is stored outside it
    await expect(detailValue(page, "City")).toHaveText("Kuala Lumpur");
    await expect(detailValue(page, "Country")).toHaveText("Malaysia");
  });

  test("ADDRESS-03-02: Org portal branch detail uses 'line' not 'street'", async ({ page }) => {
    await page.goto(`/acme-corp/branches/${BRANCH_ID}`);
    await expect(page.getByRole("heading", { name: /ACME HQ/ })).toBeVisible({ timeout: 15000 });

    // Portal labels the street line simply "Address" and reads address.line
    await expect(detailLabel(page, "Address")).toBeVisible();
    await expect(detailValue(page, "Address")).toHaveText(/\S+/);
    await expect(detailValue(page, "City")).toHaveText("Kuala Lumpur");
    await expect(detailValue(page, "State")).toHaveText(/\S+/);
  });
});

// ─── ADDRESS-04: Branch Card Display ──────────────────────────────────────────

test.describe("ADDRESS-04: Branch Card Address Summary", () => {
  test("ADDRESS-04-01: Branch card shows city, state summary", async ({ page }) => {
    await page.goto(`/organizations/${ORG_ID}?tab=branches`);

    // Branches tab defaults to the table view; cards are behind the toggle,
    // which is local useState so it can't be driven from the URL.
    await page.getByRole("button", { name: "Cards view" }).click();

    const branchCard = page.getByTestId("branch-card").first();
    await expect(branchCard).toBeVisible({ timeout: 15000 });

    // Card summarises location as "City, State" from the flat address model
    await expect(branchCard.getByText("Kuala Lumpur, Wilayah Persekutuan")).toBeVisible();
  });
});

// ─── ADDRESS-05: Profile Tab Address Display ──────────────────────────────────

test.describe("ADDRESS-05: Org Profile Tab Address", () => {
  test("ADDRESS-05-01: Profile tab shows address from org data", async ({ page }) => {
    // Profile is the default tab on org detail
    await page.goto(`/organizations/${ORG_ID}`);
    await expect(page.getByRole("heading", { name: "Business Address" })).toBeVisible({ timeout: 15000 });

    await waitForAnimation(page);

    // All five address components render from data, none placeholder "—"
    for (const label of ["Address Line", "Country", "Postal Code", "City", "State"]) {
      await expect(detailLabel(page, label)).toBeVisible();
      await expect(detailValue(page, label)).not.toHaveText("—");
    }
  });
});

// ─── ADDRESS-06: Service Provider Branch Form ─────────────────────────────────

test.describe("ADDRESS-06: SP Branch Form Address Normalization", () => {
  test("ADDRESS-06-01: SP branch form accepts full address", async ({ page }) => {
    // SP branch form is a query-state view inside the SP detail Branches tab
    await page.goto(`/service-providers/${SP_ID}?tab=branches&branchView=add`);

    const branchName = page.getByPlaceholder("e.g. Zenith KLCC");
    await expect(branchName).toBeVisible({ timeout: 15000 });
    await branchName.fill("Test SP Branch");

    // SP branch form reuses the shared LocationPicker
    await page.getByLabel(/Street Address/i).fill("No. 10, Jalan SP");
    await page.getByLabel(/Postal Code/i).fill("10000");
    await page.getByLabel("City").click();

    // Postal lookup fills city and state from the flat address model
    await expect(page.getByLabel("City")).toHaveValue("George Town");
    await expect(page.getByLabel(/Street Address/i)).toHaveValue("No. 10, Jalan SP");
    await expect(page.getByRole("combobox", { name: "State" })).toContainText("Penang");
  });
});

// ─── ADDRESS-07: Address Round-Trips ──────────────────────────────────────────
//
// The real risk in the flat-address refactor is a field key that survives one
// direction but not the other. These assert against hardcoded literals rather
// than imported fixtures, so a mapping change plus a matching fixture change
// still fails the test.

test.describe("ADDRESS-07: Address Round-Trip", () => {
  test("ADDRESS-07-01: Address survives the step 1 → step 2 → step 1 round trip", async ({ page }) => {
    await page.goto("/organizations/new");
    await expect(page.getByRole("heading", { name: "Add New Organisation" })).toBeVisible({ timeout: 15000 });

    await fillOrgStep1NonAddress(page);

    // Coordinates first — committing them reverse-geocodes and overwrites the
    // rest of the address, which would clobber anything typed beforehand.
    await page.getByRole("button", { name: "Set coordinates" }).click();
    await page.getByPlaceholder("Lat", { exact: true }).fill("3.1390");
    await page.getByPlaceholder("Lon", { exact: true }).fill("101.7036");
    await page.getByRole("button", { name: "Apply coordinates" }).click();
    await waitForAnimation(page);

    await page.getByLabel(/Street Address/i).fill("Level 15, Menara Southpoint");
    await page.getByLabel(/Postal Code/i).fill("59200");
    await page.getByLabel("City").fill("Kuala Lumpur");
    await pickOption(page, page.getByRole("combobox", { name: "State" }), "Kuala Lumpur");
    await pickOption(page, page.getByRole("combobox", { name: "Country" }), "Malaysia");

    // Forward to step 2
    await page.getByRole("button", { name: /Next|Continue/i }).first().click();
    await expect(page.getByRole("heading", { name: "Set Up HQ Branch" })).toBeVisible({ timeout: 15000 });

    // …and back to step 1
    await page.getByRole("button", { name: "Back" }).first().click();
    await expect(page.getByRole("heading", { name: "Add New Organisation" })).toBeVisible({ timeout: 15000 });

    // Every component of the flat Address must come back intact
    await expect(page.getByLabel(/Street Address/i)).toHaveValue("Level 15, Menara Southpoint");
    await expect(page.getByLabel("City")).toHaveValue("Kuala Lumpur");
    await expect(page.getByLabel(/Postal Code/i)).toHaveValue("59200");
    await expect(page.getByRole("combobox", { name: "State" })).toContainText("Kuala Lumpur");
    await expect(page.getByRole("combobox", { name: "Country" })).toContainText("Malaysia");
    // lat/lon are flat numbers on the address, echoed by the pill
    await expect(page.getByRole("button", { name: "3.139, 101.7036" })).toBeVisible();
  });

  test("ADDRESS-07-02: Edit page maps every stored address field into the form", async ({ page }) => {
    await page.goto(`/organizations/${ORG_ID}/edit`);
    await expect(page.getByRole("heading", { name: "Edit Organisation" })).toBeVisible({ timeout: 15000 });

    // Hardcoded on purpose — these must match the org's stored address exactly.
    await expect(page.getByLabel(/Street Address/i)).toHaveValue("Level 15, Menara Southpoint, Mid Valley City");
    await expect(page.getByLabel("City")).toHaveValue("Kuala Lumpur");
    await expect(page.getByLabel(/Postal Code/i)).toHaveValue("59200");
    // A stored state outside the picker's option list renders blank and is
    // silently lost on save — this asserts it resolves to a real option.
    await expect(page.getByRole("combobox", { name: "State" })).toContainText("Kuala Lumpur");
    await expect(page.getByRole("combobox", { name: "Country" })).toContainText("Malaysia");
  });
});

// ─── ADDRESS-08: Address Validation & Edge Cases ──────────────────────────────

test.describe("ADDRESS-08: Address Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/organizations/new");
    await expect(page.getByRole("heading", { name: "Add New Organisation" })).toBeVisible({ timeout: 15000 });
  });

  test("ADDRESS-08-01 [INVALID]: Empty address blocks step 1 and reports the missing line", async ({ page }) => {
    // Everything valid except the address
    await fillOrgStep1NonAddress(page);

    await page.getByRole("button", { name: /Next|Continue/i }).first().click();
    await waitForAnimation(page);

    // addressFormSchema requires line; LocationPicker surfaces that message
    await expect(page.getByText("Address line is required")).toBeVisible();
    // Must not advance
    await expect(page.getByRole("heading", { name: "Set Up HQ Branch" })).toBeHidden();
  });

  test("ADDRESS-08-02: Postal code lookup fills city and state, unknown codes leave them alone", async ({ page }) => {
    const city = page.getByLabel("City");
    const postal = page.getByLabel(/Postal Code/i);

    // Known code → city and state auto-populate
    await postal.fill("11900");
    await page.getByLabel(/Street Address/i).click();
    await expect(city).toHaveValue("Bayan Lepas");
    await expect(page.getByRole("combobox", { name: "State" })).toContainText("Penang");

    // Unknown 5-digit code → previous values are preserved, not blanked
    await postal.fill("99999");
    await page.getByLabel(/Street Address/i).click();
    await expect(city).toHaveValue("Bayan Lepas");
    await expect(page.getByRole("combobox", { name: "State" })).toContainText("Penang");
  });

  test("ADDRESS-08-03 [INVALID]: Non-numeric coordinates are rejected, not stored as NaN", async ({ page }) => {
    await page.getByRole("button", { name: "Set coordinates" }).click();
    await page.getByPlaceholder("Lat", { exact: true }).fill("not-a-number");
    await page.getByPlaceholder("Lon", { exact: true }).fill("also-bad");
    await page.getByRole("button", { name: "Apply coordinates" }).click();
    await waitForAnimation(page);

    // Pill falls back to its empty state rather than showing NaN
    await expect(page.getByRole("button", { name: "Set coordinates" })).toBeVisible();
    await expect(page.getByText("NaN")).toHaveCount(0);
  });
});
