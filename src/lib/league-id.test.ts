import { describe, expect, it } from "vitest";
import {
  MAX_LEAGUE_ID,
  parseLeagueId,
  openLeagueTarget,
  parseLeagueInput,
} from "@/lib/league-id";

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

describe("parseLeagueInput", () => {
  it.each([
    ["a number", "314"],
    ["a number with spaces around it", "  314 "],
    ["a link", "https://fantasy.premierleague.com/leagues/314/standings/c"],
    [
      "a link without https://",
      "fantasy.premierleague.com/leagues/314/standings/c",
    ],
    [
      "a link with www.",
      "https://www.fantasy.premierleague.com/leagues/314/standings/c",
    ],
    [
      "a link in capitals",
      "HTTPS://FANTASY.PREMIERLEAGUE.COM/leagues/314/standings/c",
    ],
    [
      "a link with a query",
      "fantasy.premierleague.com/leagues/314/standings/c?phase=1",
    ],
    ["a link ending at the id", "fantasy.premierleague.com/leagues/314"],
    [
      "a path that only starts like a head-to-head one",
      "fantasy.premierleague.com/leagues/314/standings/hx",
    ],
  ])("reads %s", (_, input) => {
    expect(parseLeagueInput(input)).toEqual({ kind: "league", id: 314 });
  });

  it.each([
    [
      "a head-to-head link",
      "fantasy.premierleague.com/leagues/314/standings/h",
    ],
    [
      "a head-to-head link with a query",
      "https://fantasy.premierleague.com/leagues/314/standings/h?phase=1",
    ],
  ])("tells %s apart", (_, input) => {
    expect(parseLeagueInput(input)).toEqual({ kind: "head-to-head" });
  });

  it.each([
    ["an empty field", ""],
    ["words", "my league"],
    ["a number out of range", "0"],
    ["another site", "https://example.com/leagues/314/standings/c"],
    [
      "a lookalike site",
      "https://fantasy.premierleague.com.example.com/leagues/314",
    ],
    ["a team link", "fantasy.premierleague.com/entry/314/event/11"],
    [
      "a link with letters in the id",
      "fantasy.premierleague.com/leagues/314abc/standings/c",
    ],
    [
      "an id too big for fplAPI",
      "fantasy.premierleague.com/leagues/99999999999/standings/c",
    ],
    ["something that isn't a URL", "https://"],
  ])("rejects %s", (_, input) => {
    expect(parseLeagueInput(input)).toEqual({ kind: "invalid" });
  });
});

describe("openLeagueTarget", () => {
  it("opens the league's page", () => {
    expect(
      openLeagueTarget("fantasy.premierleague.com/leagues/314/standings/c"),
    ).toEqual({
      href: "/leagues/314",
    });
  });

  it("says head-to-head leagues aren't supported", () => {
    expect(
      openLeagueTarget("fantasy.premierleague.com/leagues/314/standings/h"),
    ).toEqual({
      error: "Head-to-head leagues aren't supported yet.",
    });
  });

  it("says when the input isn't a league", () => {
    expect(openLeagueTarget("my league")).toEqual({
      error: "That isn't an FPL league link or number.",
    });
  });
});
