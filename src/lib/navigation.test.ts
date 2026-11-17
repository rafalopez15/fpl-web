import { describe, expect, it } from "vitest";
import { isCurrent, MENU_LABEL, navItems } from "@/lib/navigation";

describe("navigation", () => {
  it("has Your team, Leagues and Players", () => {
    expect(navItems("/teams/123").map((i) => [i.label, i.href])).toEqual([
      ["Your team", "/teams/123"],
      ["Leagues", "/leagues"],
      ["Players", "/players"],
    ]);
    expect(MENU_LABEL).toBe("Menu");
  });

  it.each([
    ["/teams", "/teams", true],
    ["/teams/123", "/teams", true],
    ["/teamsheet", "/teams", false],
    ["/leagues/5508", "/leagues", true],
    ["/players", "/teams", false],
  ])("on %s, marks %s as current: %s", (pathname, section, current) => {
    expect(isCurrent(pathname, section)).toBe(current);
  });
});
