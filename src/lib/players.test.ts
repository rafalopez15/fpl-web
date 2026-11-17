import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { respond } from "../../test/respond";
import { getPlayerNames } from "@/lib/players";

// Outside Next there's no cache to configure.
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getPlayerNames", () => {
  it("keeps each player's short name by id", async () => {
    respond(200, [
      { id: 1, web_name: "Isak" },
      { id: 2, web_name: "Watkins" },
    ]);
    await expect(getPlayerNames()).resolves.toEqual({
      1: "Isak",
      2: "Watkins",
    });
  });

  it("throws when fplAPI fails", async () => {
    respond(503, { detail: "FPL data is currently unavailable" });
    await expect(getPlayerNames()).rejects.toThrow(
      "fplAPI returned 503 for players",
    );
  });
});
