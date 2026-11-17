import { describe, expect, it } from "vitest";
import {
  COMING_SOON,
  errorTitle,
  FPL_DOWN,
  LEAGUE_NOT_FOUND,
  LOADING,
  OTHER_LEAGUE,
  PAGE_NOT_FOUND,
  RETRY,
  TEAM_NOT_FOUND,
} from "@/lib/states";

describe("state wording", () => {
  it("matches the iOS app for FPL being unavailable", () => {
    expect(FPL_DOWN).toBe(
      "FPL is down or updating, which is common around gameweek deadlines. Try again in a few minutes.",
    );
  });

  it("matches the iOS app for a team or league that doesn't exist", () => {
    expect(TEAM_NOT_FOUND.message).toBe(
      "No FPL team with that ID. Check the number and try again.",
    );
    expect(LEAGUE_NOT_FOUND.message).toBe("FPL couldn't find this league.");
  });

  it("names what couldn't be loaded", () => {
    expect(errorTitle("this league")).toBe("Couldn't load this league");
  });

  it("has wording for the other states", () => {
    expect(PAGE_NOT_FOUND).toEqual({
      title: "Page not found",
      message: "There's nothing at this address.",
    });
    expect(LOADING).toBe("Loading…");
    expect(RETRY).toBe("Try again");
    expect(COMING_SOON).toBe("Coming soon.");
    expect(OTHER_LEAGUE).toBe("Try another league");
  });
});
