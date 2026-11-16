import { describe, expect, it } from "vitest";
import type { League } from "@/lib/leagues";
import {
  ARRIVING,
  buildCards,
  chipLabel,
  gameweekTotals,
  hitLabel,
  NOT_PLAYING,
  pointsLabel,
  teamCount,
  type TeamActivity,
  transferCount,
} from "@/lib/moves";

const names = { 1: "Isak", 2: "Watkins", 3: "Saka", 4: "Palmer", 5: "Haaland" };
const swap = (element_in: number, element_out: number) => ({
  element_in,
  element_out,
});

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

describe("wording", () => {
  it.each([
    [0, "No transfers"],
    [1, "1 transfer"],
    [12, "12 transfers"],
  ])("counts %i transfers as %s", (count, text) => {
    expect(transferCount(count)).toBe(text);
  });

  it.each([
    [1, false, "1 team"],
    [23, false, "23 teams"],
    [50, true, "50+ teams"],
  ])("counts %i teams (more: %s) as %s", (shown, more, text) => {
    expect(teamCount(shown, more)).toBe(text);
  });

  it("writes a hit with a minus sign", () => {
    expect(hitLabel(4)).toBe("−4 pts");
  });

  it("writes points, or that a team is new", () => {
    expect(pointsLabel(712)).toBe("712 pts");
    expect(pointsLabel(null)).toBe("New to the league");
  });

  it("uses the decided wording for teams without moves", () => {
    expect(ARRIVING).toBe("Moves arriving within the hour");
    expect(NOT_PLAYING).toBe("Joined after this gameweek");
  });

  it.each([
    ["wildcard", "Wildcard"],
    ["freehit", "Free Hit"],
    ["bboost", "Bench Boost"],
    ["3xc", "Triple Captain"],
    ["manager", "Assistant Manager"],
    ["newchip", "newchip"],
  ])("labels chip %s as %s", (chip, label) => {
    expect(chipLabel(chip)).toBe(label);
  });
});

describe("buildCards", () => {
  const standing = (entry: number, rank: number, total: number) => ({
    entry,
    entry_name: `Team ${entry}`,
    rank,
    last_rank: rank,
    total,
    event_total: 50,
  });
  const league: League = {
    id: 5508,
    name: "FPLDev",
    page: 1,
    has_next: false,
    standings: [
      standing(10, 1, 712),
      standing(20, 2, 698),
      standing(30, 3, 690),
    ],
    new_entries: [{ entry: 40, entry_name: "Team 40" }],
    new_entries_has_next: false,
  };

  it("keeps the standings' order with points, then new entries", () => {
    const cards = buildCards(league, { pending: false, teams: [] }, names);
    expect(cards.map((c) => [c.rank, c.name, c.points])).toEqual([
      [1, "Team 10", 712],
      [2, "Team 20", 698],
      [3, "Team 30", 690],
      [null, "Team 40", null],
    ]);
  });

  it("gives a done team its transfers, hit, chip and captain", () => {
    const [card] = buildCards(
      league,
      {
        pending: false,
        teams: [
          team({
            entry: 10,
            transfers: [swap(1, 2), swap(3, 4)],
            transfers_cost: 4,
            chip: "bboost",
            captain_changed: true,
          }),
        ],
      },
      names,
    );
    expect(card).toMatchObject({
      state: "done",
      chip: "Bench Boost",
      transfers: [
        { in: "Isak", out: "Watkins" },
        { in: "Saka", out: "Palmer" },
      ],
      hit: 4,
      captain: "Haaland",
      captainChanged: true,
    });
  });

  it("always shows a done team's captain, even when unchanged", () => {
    const [card] = buildCards(
      league,
      { pending: false, teams: [team()] },
      names,
    );
    expect(card).toMatchObject({
      transfers: [],
      captain: "Haaland",
      captainChanged: false,
    });
  });

  it("doesn't call a captain new without an earlier gameweek", () => {
    const [card] = buildCards(
      league,
      { pending: false, teams: [team({ captain_changed: null })] },
      names,
    );
    expect(card.captainChanged).toBe(false);
  });

  it("names a player it doesn't know, and has no captain when FPL has none", () => {
    const [card] = buildCards(
      league,
      {
        pending: false,
        teams: [team({ transfers: [swap(99, 2)], captain: null })],
      },
      names,
    );
    expect(card.transfers).toEqual([{ in: "Unknown player", out: "Watkins" }]);
    expect(card.captain).toBeNull();
  });

  it("marks teams missing while pending, and teams that joined later", () => {
    const pending = buildCards(
      league,
      { pending: true, teams: [team()] },
      names,
    );
    expect(pending.map((c) => c.state)).toEqual([
      "done",
      "pending",
      "pending",
      "pending",
    ]);
    const done = buildCards(league, { pending: false, teams: [team()] }, names);
    expect(done[3].state).toBe("joined-later");
  });

  it("shows the standings alone while no team is done, or without activity", () => {
    for (const activity of [{ pending: true, teams: [] }, null]) {
      const cards = buildCards(league, activity, names);
      expect(cards.every((c) => c.state === "standings")).toBe(true);
    }
  });
});

describe("gameweekTotals", () => {
  it("adds up transfers, hits and chips across the teams that are done", () => {
    const totals = gameweekTotals([
      team({ transfers: [swap(1, 2), swap(3, 4)], transfers_cost: 4 }),
      team({ transfers: [swap(1, 2)], chip: "wildcard" }),
      team({ chip: "3xc", transfers_cost: 8 }),
      team(),
    ]);
    expect(totals).toEqual({ transfers: 3, hits: 12, chips: 2 });
  });

  it("is all zero with no team done", () => {
    expect(gameweekTotals([])).toEqual({ transfers: 0, hits: 0, chips: 0 });
  });
});
