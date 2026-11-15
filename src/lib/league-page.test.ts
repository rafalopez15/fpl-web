import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLeaguePage } from "@/lib/league-page";
import type { League } from "@/lib/leagues";

const league: League = {
  id: 5508,
  name: "FPLDev",
  page: 1,
  has_next: false,
  standings: [],
  new_entries: [],
  new_entries_has_next: false,
};

// fplAPI by path: the league's standings and the gameweeks.
function fplapi(events: { id: number; is_current: boolean }[]) {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const url = (input as Request).url;
    if (url.endsWith("/api/events")) return Response.json(events);
    if (url.endsWith("/api/leagues/5508")) return Response.json(league);
    return Response.json({ detail: "League not found" }, { status: 404 });
  });
  vi.stubGlobal("fetch", fetch);
}

const current = [
  { id: 9, is_current: false },
  { id: 10, is_current: true },
  { id: 11, is_current: false },
];

// What redirect() throws, so Next sends the browser there.
const redirectsTo = (path: string) =>
  expect.objectContaining({ digest: expect.stringContaining(`;${path};`) });

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("resolveLeaguePage", () => {
  it("shows the latest gameweek by default", async () => {
    fplapi(current);
    await expect(resolveLeaguePage("5508")).resolves.toEqual({
      league,
      event: 10,
      latest: 10,
    });
  });

  it("shows an earlier gameweek", async () => {
    fplapi(current);
    await expect(resolveLeaguePage("5508", "3")).resolves.toEqual({
      league,
      event: 3,
      latest: 10,
    });
  });

  it.each([
    ["a future gameweek", "11"],
    ["a gameweek that doesn't exist", "39"],
    ["something that isn't a gameweek", "abc"],
  ])("sends %s back to the latest", async (_, raw) => {
    fplapi(current);
    await expect(resolveLeaguePage("5508", raw)).rejects.toEqual(
      redirectsTo("/leagues/5508"),
    );
  });

  it("has no gameweek before the season", async () => {
    fplapi([{ id: 1, is_current: false }]);
    await expect(resolveLeaguePage("5508")).resolves.toEqual({
      league,
      event: null,
      latest: null,
    });
    await expect(resolveLeaguePage("5508", "1")).rejects.toEqual(
      redirectsTo("/leagues/5508"),
    );
  });

  it("is not found for a league fplAPI doesn't know", async () => {
    fplapi(current);
    await expect(resolveLeaguePage("1")).rejects.toEqual(
      expect.objectContaining({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }),
    );
  });
});
