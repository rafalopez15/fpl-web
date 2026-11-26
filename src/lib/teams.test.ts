import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FPL_DOWN, TEAM_NOT_FOUND } from "@/lib/states";
import {
  findTeam,
  getTeam,
  lookUpTeam,
  NOT_REACHED,
  parseTeamId,
  parseTeamInput,
  type Team,
  teamLabel,
  teamStats,
  teamSummary,
  unlinkTitle,
  yourTeamPath,
} from "@/lib/teams";

const team: Team = {
  id: 123456,
  name: "VARiables",
  current_event: 9,
  summary_overall_points: 563,
  summary_overall_rank: 1_571_477,
  summary_event_points: 71,
  leagues: [],
};

function respond(status: number, body?: unknown) {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    body === undefined
      ? new Response(JSON.stringify({ detail: "Not found" }), { status })
      : Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const NOT_FOUND = expect.objectContaining({
  digest: "NEXT_HTTP_ERROR_FALLBACK;404",
});

beforeEach(() => vi.stubEnv("FPLAPI_URL", "https://api.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("parseTeamId", () => {
  it.each([
    ["123456", 123456],
    ["abc", null],
    ["0", null],
    ["99999999999", null],
    [undefined, null],
  ])("reads %j as %s", (raw, id) => {
    expect(parseTeamId(raw)).toBe(id);
  });
});

describe("parseTeamInput", () => {
  it.each([
    ["123456", 123456],
    [" 123456 ", 123456],
    ["https://fantasy.premierleague.com/entry/123456/event/9", 123456],
    ["fantasy.premierleague.com/entry/123456/history", 123456],
    ["www.fantasy.premierleague.com/entry/123456", 123456],
    ["https://example.com/entry/123456/event/9", null],
    ["fantasy.premierleague.com/leagues/314/standings/c", null],
    ["fantasy.premierleague.com/entry/0/event/9", null],
    ["https://", null],
    ["abc", null],
  ])("reads %j as %s", (input, id) => {
    expect(parseTeamInput(input)).toBe(id);
  });
});

describe("yourTeamPath", () => {
  it("opens the saved team, or the link flow", () => {
    expect(yourTeamPath("123456")).toBe("/teams/123456");
    expect(yourTeamPath(undefined)).toBe("/teams");
    expect(yourTeamPath("12abc")).toBe("/teams");
  });
});

describe("getTeam", () => {
  it("returns the team from fplAPI", async () => {
    const fetch = respond(200, team);
    await expect(getTeam(123456)).resolves.toEqual({ kind: "ok", team });
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://api.example/api/managers/123456");
  });

  it("tells a missing team from FPL being down", async () => {
    respond(404);
    await expect(getTeam(1)).resolves.toEqual({ kind: "not-found" });
    respond(503);
    await expect(getTeam(1)).resolves.toEqual({ kind: "fpl-unavailable" });
  });

  it("throws on any other error", async () => {
    respond(500);
    await expect(getTeam(1)).rejects.toThrow("fplAPI returned 500 for team 1");
  });
});

describe("findTeam", () => {
  it("returns the team", async () => {
    respond(200, team);
    await expect(findTeam("123456")).resolves.toEqual(team);
  });

  it("is not found for an id that can't be one, without asking fplAPI", async () => {
    const fetch = respond(200, team);
    await expect(findTeam("abc")).rejects.toEqual(NOT_FOUND);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("is not found for a team FPL doesn't have", async () => {
    respond(404);
    await expect(findTeam("7")).rejects.toEqual(NOT_FOUND);
  });

  it("throws for error.tsx when FPL is down", async () => {
    respond(503);
    await expect(findTeam("8")).rejects.toThrow(FPL_DOWN);
  });
});

describe("the team card", () => {
  it("sums up points and rank", () => {
    expect(teamSummary(team)).toBe("563 pts · Rank 1,571,477");
  });

  it("shows the ID for a team with neither yet", () => {
    expect(
      teamSummary({
        id: 1,
        name: "New",
        leagues: [],
        summary_overall_rank: null,
      }),
    ).toBe("ID 1");
  });

  it("lists points, overall rank and the gameweek's points", () => {
    expect(teamStats(team)).toEqual([
      { label: "Points", value: "563" },
      { label: "Overall rank", value: "1,571,477" },
      { label: "GW9 points", value: "71" },
    ]);
  });

  it("dashes what FPL hasn't got yet", () => {
    expect(teamStats({ id: 1, name: "New", leagues: [] })).toEqual([
      { label: "Points", value: "–" },
      { label: "Overall rank", value: "–" },
      { label: "Gameweek", value: "–" },
    ]);
  });

  it("says whose team it is", () => {
    expect(teamLabel(true)).toBe("Your FPL team");
    expect(teamLabel(false)).toBe("FPL team");
  });

  it("names the team when asking to unlink it", () => {
    expect(unlinkTitle("VARiables")).toBe("Unlink VARiables?");
  });
});

describe("lookUpTeam", () => {
  it("finds the team to confirm", async () => {
    respond(200, team);
    await expect(lookUpTeam(" 123456 ")).resolves.toEqual({
      kind: "found",
      id: 123456,
      name: "VARiables",
      summary: "563 pts · Rank 1,571,477",
    });
  });

  it("finds the team from its FPL address", async () => {
    const fetch = respond(200, team);
    await expect(
      lookUpTeam("https://fantasy.premierleague.com/entry/123456/event/9"),
    ).resolves.toMatchObject({ kind: "found", id: 123456 });
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://api.example/api/managers/123456");
  });

  it.each(["abc", "0", "99999999999"])(
    "says there's no such team for %j, without asking fplAPI",
    async (input) => {
      const fetch = respond(200, team);
      await expect(lookUpTeam(input)).resolves.toEqual({
        kind: "error",
        message: TEAM_NOT_FOUND.message,
        warning: false,
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("says there's no such team when FPL has none", async () => {
    respond(404);
    await expect(lookUpTeam("7")).resolves.toEqual({
      kind: "error",
      message: TEAM_NOT_FOUND.message,
      warning: false,
    });
  });

  it("warns when FPL is down or updating", async () => {
    respond(503);
    await expect(lookUpTeam("7")).resolves.toEqual({
      kind: "error",
      message: FPL_DOWN,
      warning: true,
    });
  });

  it("says FPL couldn't be reached, not the person's connection", async () => {
    expect(NOT_REACHED).toBe("Couldn't reach FPL. Try again in a few minutes.");
  });

  it("warns when fplAPI can't be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    await expect(lookUpTeam("7")).resolves.toEqual({
      kind: "error",
      message: NOT_REACHED,
      warning: true,
    });
  });
});
