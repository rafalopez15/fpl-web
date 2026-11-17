import { describe, expect, it } from "vitest";
import { isCurrent, MENU_LABEL, NAV_ITEMS } from "@/lib/navigation";

describe("navigation", () => {
  it("starts with Your team and Players", () => {
    expect(NAV_ITEMS.map((i) => [i.label, i.href])).toEqual([
      ["Your team", "/"],
      ["Players", "/players"],
    ]);
    expect(MENU_LABEL).toBe("Menu");
  });

  it.each([
    ["/teams", "/teams", true],
    ["/teams/123", "/teams", true],
    ["/teamsheet", "/teams", false],
    ["/players", "/teams", false],
    ["/", "/teams", false],
  ])("on %s, marks %s as current: %s", (pathname, section, current) => {
    expect(isCurrent(pathname, section)).toBe(current);
  });
});
