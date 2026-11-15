import { describe, expect, it } from "vitest";
import type { League } from "@/lib/leagues";
import {
  ARRIVING,
  buildRows,
  chipLabel,
  describeMoves,
  NO_MOVES,
  NOT_PLAYING,
  type TeamActivity,
} from "@/lib/moves";

const names = { 1: "Isak", 2: "Watkins", 3: "Saka", 4: "Palmer", 5: "Haaland" };

function team(overrides: Partial<TeamActivity> = {}): TeamActivity {
  return {
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
  };
}

describe("describeMoves", () => {
  it("describes transfers with a hit and a captain change", () => {
    const moves = describeMoves(
      team({
        transfers: [
          { element_in: 1, element_out: 2 },
          { element_in: 3, element_out: 4 },
        ],
        transfers_cost: 4,
        captain_changed: true,
      }),
      names,
    );
    expect(moves).toBe(
      "2 transfers (−4): Isak in for Watkins, Saka in for Palmer · Captain: Haaland (changed)",
    );
  });

  it("says one transfer without a hit", () => {
    const moves = describeMoves(
      team({ transfers: [{ element_in: 1, element_out: 2 }] }),
      names,
    );
    expect(moves).toBe("1 transfer: Isak in for Watkins");
  });

  it("says only a captain change", () => {
    expect(describeMoves(team({ captain_changed: true }), names)).toBe(
      "Captain: Haaland (changed)",
    );
  });

  it("says nothing about the captain without an earlier gameweek to compare", () => {
    expect(describeMoves(team({ captain_changed: null }), names)).toBe("");
  });

  it("is empty for a team that did nothing", () => {
    expect(describeMoves(team(), names)).toBe("");
  });

  it("names a player it doesn't know", () => {
    const moves = describeMoves(
      team({ transfers: [{ element_in: 99, element_out: 2 }] }),
      names,
    );
    expect(moves).toBe("1 transfer: Unknown player in for Watkins");
  });
});

describe("chipLabel", () => {
  it.each([
    ["wildcard", "Wildcard"],
    ["freehit", "Free Hit"],
    ["bboost", "Bench Boost"],
    ["3xc", "Triple Captain"],
    ["manager", "Assistant Manager"],
    ["newchip", "newchip"],
  ])("labels %s as %s", (chip, label) => {
    expect(chipLabel(chip)).toBe(label);
  });
});

describe("buildRows", () => {
  const league: League = {
    id: 5508,
    name: "FPLDev",
    page: 1,
    has_next: false,
    standings: [
      {
        entry: 10,
        entry_name: "Team A",
        rank: 1,
        last_rank: 1,
        total: 700,
        event_total: 60,
      },
      {
        entry: 20,
        entry_name: "Team B",
        rank: 2,
        last_rank: 2,
        total: 690,
        event_total: 50,
      },
      {
        entry: 30,
        entry_name: "Team C",
        rank: 3,
        last_rank: 3,
        total: 680,
        event_total: 40,
      },
    ],
    new_entries: [{ entry: 40, entry_name: "Team D" }],
    new_entries_has_next: false,
  };

  it("keeps the standings' order, then new entries without a rank", () => {
    const rows = buildRows(league, { pending: false, teams: [] }, names);
    expect(rows.map((r) => [r.rank, r.name])).toEqual([
      [1, "Team A"],
      [2, "Team B"],
      [3, "Team C"],
      [null, "Team D"],
    ]);
  });

  it("shows moves, chips and teams that did nothing", () => {
    const rows = buildRows(
      league,
      {
        pending: false,
        teams: [
          team({ entry: 10, transfers: [{ element_in: 1, element_out: 2 }] }),
          team({ entry: 20, chip: "bboost" }),
          team({ entry: 30 }),
          team({ entry: 40 }),
        ],
      },
      names,
    );
    expect(rows[0]).toMatchObject({
      moves: "1 transfer: Isak in for Watkins",
      chip: null,
      quiet: false,
    });
    expect(rows[1]).toMatchObject({
      moves: "",
      chip: "Bench Boost",
      quiet: false,
    });
    expect(rows[2]).toMatchObject({ moves: NO_MOVES, quiet: true });
  });

  it("says moves are arriving for teams missing while pending", () => {
    const rows = buildRows(
      league,
      { pending: true, teams: [team({ entry: 10 })] },
      names,
    );
    expect(rows[0].moves).toBe(NO_MOVES);
    expect(rows[1]).toMatchObject({ moves: ARRIVING, quiet: true });
  });

  it("says a team missing once nothing is pending joined later, not that it made no moves", () => {
    const rows = buildRows(
      league,
      { pending: false, teams: [team({ entry: 10 })] },
      names,
    );
    expect(rows[3]).toMatchObject({ moves: NOT_PLAYING, quiet: true });
  });

  it("shows the standings alone while no team is done yet", () => {
    const rows = buildRows(league, { pending: true, teams: [] }, names);
    expect(rows.every((r) => r.moves === null)).toBe(true);
  });

  it("shows the standings alone without activity", () => {
    const rows = buildRows(league, null, names);
    expect(rows.every((r) => r.moves === null)).toBe(true);
  });
});
