import { describe, expect, it } from "vitest";
import { MAX_LEAGUE_ID, parseLeagueId } from "@/lib/league-id";

describe("parseLeagueId", () => {
  it("reads a league number", () => {
    expect(parseLeagueId("314")).toBe(314);
  });

  it("ignores leading zeros", () => {
    expect(parseLeagueId("007")).toBe(7);
  });

  it("accepts the largest id fplAPI can look up", () => {
    expect(parseLeagueId(String(MAX_LEAGUE_ID))).toBe(MAX_LEAGUE_ID);
  });

  it.each([
    ["zero", "0"],
    ["one past the largest id", String(MAX_LEAGUE_ID + 1)],
    ["more than 10 digits", "12345678901"],
    ["a negative number", "-1"],
    ["a decimal", "1.5"],
    ["letters", "abc"],
    ["digits with letters", "314abc"],
    ["surrounding spaces", " 314 "],
    ["an empty string", ""],
  ])("rejects %s", (_, raw) => {
    expect(parseLeagueId(raw)).toBeNull();
  });
});
