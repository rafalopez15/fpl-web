import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { activityNotice, getActivity } from "@/lib/activity";
import { respond } from "../../test/respond";

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getActivity", () => {
  const activity = { league_id: 5508, event: 10, pending: false, teams: [] };

  it("returns the gameweek's activity", async () => {
    const fetch = respond(200, activity);
    await expect(getActivity(5508, 10)).resolves.toEqual({
      kind: "ok",
      activity,
    });
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe(
      "https://api.example/api/leagues/5508/activity?event=10",
    );
  });

  it.each([
    [422, { detail: "League too big for activity" }, "too-big"],
    [429, { detail: "Too many new leagues" }, "busy"],
    [404, { detail: "Event deadline hasn't passed" }, "gameweek-unavailable"],
    [404, { detail: "Event not found" }, "gameweek-unavailable"],
    [404, { detail: "League not found" }, "league-not-found"],
  ])("turns a %i (%o) into %s", async (status, body, kind) => {
    respond(status, body);
    await expect(getActivity(5508, 10)).resolves.toEqual({ kind });
  });

  it("throws on any other error", async () => {
    respond(503, { detail: "FPL data is currently unavailable" });
    await expect(getActivity(5508, 10)).rejects.toThrow(
      "fplAPI returned 503 for league 5508's activity",
    );
  });
});

describe("activityNotice", () => {
  const ok = (pending: boolean, teams: number) => ({
    kind: "ok" as const,
    activity: {
      league_id: 5508,
      event: 10,
      pending,
      teams: Array.from({ length: teams }, (_, i) => ({
        entry: i,
        event: 10,
        transfers: [],
        transfers_cost: 0,
      })),
    },
  });

  it.each([
    ["no gameweek yet", null, "The season hasn't started yet."],
    [
      "too many new leagues",
      { kind: "busy" as const },
      "Lots of leagues are being added right now. Try again in a few minutes.",
    ],
    [
      "a league just looked up",
      ok(true, 0),
      "We're fetching this league's moves. Check back within the hour.",
    ],
  ])("explains %s", (_, result, message) => {
    expect(activityNotice(result)).toBe(message);
  });

  it.each([
    ["moves to show", ok(false, 3)],
    ["a league over 50 teams", { kind: "too-big" as const }],
    ["some teams still arriving", ok(true, 3)],
  ])("is quiet with %s", (_, result) => {
    expect(activityNotice(result)).toBeNull();
  });
});
