import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findLeague, getLeague, type League } from "@/lib/leagues";

const league: League = {
  id: 314,
  name: "Overall",
  page: 1,
  has_next: true,
  standings: [],
  new_entries: [],
  new_entries_has_next: false,
};

function respond(status: number, body?: unknown) {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    body === undefined
      ? new Response(JSON.stringify({ detail: "League not found" }), { status })
      : Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

// What notFound() throws, so Next renders not-found.tsx.
const NOT_FOUND = expect.objectContaining({
  digest: "NEXT_HTTP_ERROR_FALLBACK;404",
});

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getLeague", () => {
  it("returns the league from fplAPI", async () => {
    const fetch = respond(200, league);
    await expect(getLeague(314)).resolves.toEqual(league);
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://api.example/api/leagues/314");
  });

  it("is null when fplAPI has no such league", async () => {
    respond(404);
    await expect(getLeague(314)).resolves.toBeNull();
  });

  it("throws on any other error", async () => {
    respond(503);
    await expect(getLeague(314)).rejects.toThrow(
      "fplAPI returned 503 for league 314",
    );
  });
});

describe("findLeague", () => {
  it("returns the league for a valid id", async () => {
    respond(200, league);
    await expect(findLeague("314")).resolves.toEqual(league);
  });

  it("is not found for a league fplAPI doesn't know", async () => {
    respond(404);
    await expect(findLeague("314")).rejects.toEqual(NOT_FOUND);
  });

  it("is not found for an id that isn't one, without calling fplAPI", async () => {
    const fetch = respond(200, league);
    await expect(findLeague("abc")).rejects.toEqual(NOT_FOUND);
    expect(fetch).not.toHaveBeenCalled();
  });
});
