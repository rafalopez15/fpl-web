import { describe, expect, it } from "vitest";
import type { ActivityResult } from "@/lib/activity";
import type { TeamActivity } from "@/lib/moves";
import {
  shareButtonLabel,
  shareDescription,
  shareNameSize,
  shareSubtitle,
  shareTiles,
  shareTitle,
} from "@/lib/share";

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

describe("shareButtonLabel", () => {
  it.each([
    ["idle", "Share"],
    ["copied", "Link copied"],
    ["failed", "Couldn't copy the link"],
  ] as const)("labels %s as %s", (status, label) => {
    expect(shareButtonLabel(status)).toBe(label);
  });
});

describe("shareSubtitle", () => {
  it("says what the gameweek image shows, or that it's a mini-league", () => {
    expect(shareSubtitle(11)).toBe("What everyone did this gameweek");
    expect(shareSubtitle(null)).toBe("Mini-league");
  });
});

describe("shareTiles", () => {
  const team = (overrides: Partial<TeamActivity>): TeamActivity => ({
    entry: 10,
    entry_name: "Team A",
    event: 11,
    transfers: [],
    transfers_cost: 0,
    chip: null,
    captain: 5,
    vice_captain: 1,
    captain_changed: false,
    ...overrides,
  });
  const ok = (pending: boolean, teams: TeamActivity[]): ActivityResult => ({
    kind: "ok",
    activity: { league_id: 1, event: 11, pending, teams },
  });
  const done = [
    team({
      transfers: [{ element_in: 1, element_out: 2 }],
      transfers_cost: 4,
      chip: "wildcard",
    }),
  ];

  it("shows the totals once every team is done", () => {
    expect(shareTiles(ok(false, done))).toEqual([
      { value: "1", label: "transfers", tone: "text" },
      { value: "−4", label: "in hits", tone: "danger" },
      { value: "1", label: "chips played", tone: "accent" },
    ]);
  });

  it("writes no hits as 0", () => {
    expect(shareTiles(ok(false, [team({})]))?.[1]).toEqual({
      value: "0",
      label: "in hits",
      tone: "text",
    });
  });

  it("leaves the tiles out while teams are pending", () => {
    expect(shareTiles(ok(true, done))).toBeNull();
  });

  it("leaves the tiles out with no teams, no gameweek or no activity", () => {
    expect(shareTiles(ok(false, []))).toBeNull();
    expect(shareTiles(null)).toBeNull();
    expect(shareTiles({ kind: "busy" })).toBeNull();
  });
});
