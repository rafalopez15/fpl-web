import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { respond } from "../../test/respond";
import {
  gameweekPath,
  getLatestGameweek,
  parseGameweek,
} from "@/lib/gameweeks";

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getLatestGameweek", () => {
  it("is FPL's current gameweek", async () => {
    respond(200, [
      { id: 9, is_current: false },
      { id: 10, is_current: true },
      { id: 11, is_current: false },
    ]);
    await expect(getLatestGameweek()).resolves.toBe(10);
  });

  it("is null before the season's first deadline", async () => {
    respond(200, [{ id: 1, is_current: false }]);
    await expect(getLatestGameweek()).resolves.toBeNull();
  });

  it("throws when fplAPI fails", async () => {
    respond(503, {});
    await expect(getLatestGameweek()).rejects.toThrow(
      "fplAPI returned 503 for gameweeks",
    );
  });
});

describe("parseGameweek", () => {
  it.each([
    ["1", 1],
    ["38", 38],
    ["07", 7],
  ])("reads %s", (raw, event) => {
    expect(parseGameweek(raw)).toBe(event);
  });

  it.each(["0", "39", "100", "abc", "1.5", ""])("rejects %s", (raw) => {
    expect(parseGameweek(raw)).toBeNull();
  });

  it("builds a gameweek's path", () => {
    expect(gameweekPath(5508, 10)).toBe("/leagues/5508/gameweeks/10");
  });
});
