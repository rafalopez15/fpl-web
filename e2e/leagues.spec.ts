import { expect, test, type Page } from "@playwright/test";

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
// Next keeps visited pages hidden in the DOM, and getByText would match them.
const main = (page: Page) => page.getByRole("main");
const views = (page: Page) =>
  page.getByRole("navigation", { name: "League view" });

test("switches between a league's moves and standings", async ({ page }) => {
  await page.goto("/leagues/5508");
  await expect(
    views(page).getByRole("link", { name: "Moves" }),
  ).toHaveAttribute("aria-current", "page");

  await views(page).getByRole("link", { name: "Standings" }).click();
  await expect(page).toHaveURL("/leagues/5508/standings");
  await expect(page).toHaveTitle("FPLDev standings · FPL Social");
  await expect(
    views(page).getByRole("link", { name: "Standings" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Gameweek" })).toHaveCount(
    0,
  );

  await views(page).getByRole("link", { name: "Moves" }).click();
  await expect(page).toHaveURL("/leagues/5508");
});

test("shows the standings, with teams that joined apart", async ({ page }) => {
  await page.goto("/leagues/5508/standings");
  await expect(heading(page)).toHaveText("FPLDev");

  const rows = main(page).getByRole("table").getByRole("row");
  await expect(rows).toHaveText([
    /Rank\s*Team\s*GW\s*Total/,
    /1, up 1 place\s*VARiables\s*70\s*140/,
    /2, down 1 place\s*Expected Toulouse\s*–\s*120/,
  ]);
  await expect(main(page).getByText("Updated 5 min ago")).toBeVisible();

  const joined = main(page).getByRole("region", {
    name: "Joined this gameweek",
  });
  await expect(joined.getByRole("link")).toHaveText(["Late Arrivals"]);
  await expect(joined).toContainText("Ranked after FPL's next update.");
});

test("opens a team's page from its row", async ({ page }) => {
  await page.goto("/leagues/5508/standings");
  await main(page).getByRole("link", { name: "Expected Toulouse" }).click();
  await expect(page).toHaveURL("/teams/10");
  await expect(heading(page)).toHaveText("Expected Toulouse");
});

test("gives link-preview bots a 404 for standings of a league that doesn't exist", async ({
  request,
}) => {
  const response = await request.get("/leagues/999/standings", {
    headers: { "User-Agent": "WhatsApp/2.23" },
  });
  expect(response.status()).toBe(404);
});
