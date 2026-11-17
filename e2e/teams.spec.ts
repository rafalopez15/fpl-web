import { expect, test, type Page } from "@playwright/test";

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const field = (page: Page) => page.getByLabel("Manager ID");

async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name })
    .click();
}

async function find(page: Page, id: string) {
  await field(page).fill(id);
  await page.getByRole("button", { name: "Find team" }).click();
}

test("links a team by its ID, then unlinks it", async ({ page }) => {
  await page.goto("/teams");
  await expect(heading(page)).toHaveText("Link your FPL team");

  await find(page, "999");
  await expect(page.locator("#team-error")).toHaveText(
    "No FPL team with that ID. Check the number and try again.",
  );

  await find(page, "503");
  await expect(page.locator("#team-error")).toContainText(
    "FPL is down or updating",
  );

  // "Not my team" starts over.
  await find(page, "10");
  await expect(page.getByText("Is this your team?")).toBeVisible();
  await expect(page.getByText("540 pts · Rank 2,004,118")).toBeVisible();
  await page.getByRole("button", { name: "Not my team" }).click();
  await expect(page.getByRole("button", { name: "Find team" })).toBeVisible();

  await find(page, "123456");
  await page.getByRole("button", { name: "Link team" }).click();
  await expect(page).toHaveURL("/teams/123456");
  await expect(heading(page)).toHaveText("VARiables");
  await expect(page.getByText("Your FPL team", { exact: true })).toBeVisible();

  // Your team and / open it now.
  await page.goto("/");
  await expect(page).toHaveURL("/teams/123456");

  await page.getByRole("button", { name: "Unlink team" }).click();
  await expect(
    page.getByRole("heading", { name: "Unlink VARiables?" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Unlink team" })
    .click();
  await expect(page).toHaveURL("/teams");
  await expect(heading(page)).toHaveText("Link your FPL team");
  await navigate(page, "Your team");
  await expect(page).toHaveURL("/teams");
  await page.goto("/");
  await expect(page).toHaveURL("/leagues");
});

test("makes someone else's team yours when none is linked", async ({
  page,
  context,
}) => {
  await page.goto("/teams/10");
  await expect(heading(page)).toHaveText("Expected Toulouse");
  await expect(page.getByText("FPL team", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Squad" })).toBeVisible();
  await page.getByRole("button", { name: "Link team" }).click();
  await expect(page.getByText("Your FPL team", { exact: true })).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === "team")?.value).toBe(
    "10",
  );

  // With a team linked, another team's page doesn't offer it.
  await page.goto("/teams/123456");
  await expect(heading(page)).toHaveText("VARiables");
  await expect(page.getByText("Is this your team?")).toHaveCount(0);
});

test("shows Team not found for a team FPL doesn't have", async ({
  page,
  request,
}) => {
  await page.goto("/teams/999");
  await expect(heading(page)).toHaveText("Team not found");
  const response = await request.get("/teams/999", {
    headers: { "User-Agent": "WhatsApp/2.23" },
  });
  expect(response.status()).toBe(404);
});

test("shows the error state when FPL is down", async ({ page }) => {
  await page.goto("/teams/503");
  await expect(heading(page)).toHaveText("Couldn't load this team");
});
