import { expect, test, type Page } from "@playwright/test";

// Through the header's links, or the menu on phones.
async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name })
    .click();
}

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const current = (page: Page) =>
  page.getByRole("navigation", { name: "Main" }).locator("[aria-current=page]");

test("walks the navigation", async ({ page, context }) => {
  // No team saved: Your team is the link flow.
  await page.goto("/");
  await expect(page).toHaveURL("/teams");
  await expect(heading(page)).toHaveText("Link your team");

  await navigate(page, "Players");
  await expect(page).toHaveURL("/players");
  await expect(page).toHaveTitle("Players · FPL Social");
  await expect(current(page)).toHaveText("Players");

  await navigate(page, "Your team");
  await expect(page).toHaveURL("/teams");
  await expect(current(page)).toHaveText("Your team");

  // A saved team: Your team opens it. The link flow will set the cookie in a server
  // action, which clears the router's cached redirect; here a reload does that.
  await context.addCookies([
    { name: "team", value: "123456", url: page.url() },
  ]);
  await page.reload();
  await navigate(page, "Your team");
  await expect(page).toHaveURL("/teams/123456");

  // A league from the form, with the stand-in fplAPI's data.
  await page.goto("/leagues");
  await page.getByLabel("Your mini-league").fill("5508");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL("/leagues/5508");
  await expect(heading(page)).toHaveText("FPLDev");
  await expect(page.getByText("VARiables")).toBeVisible();
});

test("opens every page in the URL scheme", async ({ page }) => {
  for (const [path, title] of [
    ["/teams/123456", "Team"],
    ["/players", "Players"],
    ["/leagues", "See what your mini-league did this gameweek"],
    ["/leagues/5508/standings", "Standings"],
    ["/gameweek", "Gameweek"],
    ["/notes", "Notes"],
    ["/following", "Following"],
    ["/account", "Account"],
  ]) {
    await page.goto(path);
    await expect(heading(page)).toHaveText(title);
  }
});

test("shows the not-found page for an address that doesn't exist", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(heading(page)).toHaveText("Page not found");
});

test("gives link-preview bots a 404 for a league that doesn't exist", async ({
  request,
}) => {
  const response = await request.get("/leagues/999", {
    headers: { "User-Agent": "WhatsApp/2.23" },
  });
  expect(response.status()).toBe(404);
});
