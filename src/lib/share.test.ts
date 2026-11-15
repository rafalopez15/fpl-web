import { describe, expect, it } from "vitest";
import { shareDescription, shareNameSize, shareTitle } from "@/lib/share";

describe("shareTitle", () => {
  it("names the league and gameweek", () => {
    expect(shareTitle("FPLDev", 11)).toBe("FPLDev · Gameweek 11 moves");
  });

  it("names only the league before the season", () => {
    expect(shareTitle("FPLDev", null)).toBe("FPLDev · FPL Social");
  });
});

describe("shareDescription", () => {
  it("says what the page shows", () => {
    expect(shareDescription("FPLDev", 11)).toBe(
      "What each team in FPLDev did in Gameweek 11: transfers, hits, chips and captains.",
    );
  });

  it("falls back before the season", () => {
    expect(shareDescription("FPLDev", null)).toBe(
      "FPLDev, a mini-league on FPL Social.",
    );
  });
});

describe("shareNameSize", () => {
  it.each([
    ["FPLDev", 96],
    ["Sixteen chars ok", 96],
    ["A name of 24 characters!", 80],
    ["A league name with thirty-six chars!", 64],
    ["A very long league name that goes on and on past forty", 52],
  ])("sizes %s at %i", (name, size) => {
    expect(shareNameSize(name)).toBe(size);
  });

  it("counts an emoji as one character", () => {
    expect(shareNameSize("⚽".repeat(16))).toBe(96);
  });
});
