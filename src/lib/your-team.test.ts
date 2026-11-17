import { describe, expect, it } from "vitest";
import { homeRedirects, TEAM_ID_PATTERN } from "@/lib/your-team";

// As Next matches a cookie's value in a redirect.
const saved = (value: string) =>
  value.match(new RegExp(`^${TEAM_ID_PATTERN}$`))?.groups?.team ?? null;

describe("homeRedirects", () => {
  it("opens the saved team first, then the link flow", () => {
    expect(homeRedirects.map((r) => [r.source, r.destination])).toEqual([
      ["/", "/teams/:team"],
      ["/", "/teams"],
    ]);
    expect(homeRedirects.every((r) => r.permanent === false)).toBe(true);
  });

  it.each([
    ["123456", "123456"],
    ["", null],
    ["12abc", null],
    ["../admin", null],
  ])("takes cookie %j as team %s", (value, team) => {
    expect(saved(value)).toBe(team);
  });
});
