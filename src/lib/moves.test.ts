import { describe, expect, it } from "vitest";
import type { League } from "@/lib/leagues";
import {
  ARRIVING,
  buildCards,
  chipLabel,
  collapseAllLabel,
  footerNote,
  gameweekTotals,
  hitLabel,
  NOT_PLAYING,
  pointsLabel,
  teamCount,
  type TeamActivity,
  toggleLabel,
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

// A league with this many standings and new entries; only the counts matter.
function sized(standings: number, joined: number, more: boolean): League {
  return {
    id: 1,
    name: "League",
    page: 1,
    has_next: more,
    standings: Array.from({ length: standings }, (_, i) => ({
      entry: i,
      entry_name: `Team ${i}`,
      rank: i + 1,
      last_rank: i + 1,
      total: 100,
      event_total: 50,
    })),
    new_entries: Array.from({ length: joined }, (_, i) => ({
      entry: 1000 + i,
      entry_name: `New ${i}`,
    })),
    new_entries_has_next: false,
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
    [1, 0, false, "1 team"],
    [20, 3, false, "23 teams"],
    [50, 0, true, "50+ teams"],
    // Teams that joined since don't add to a league with more pages.
    [50, 3, true, "50+ teams"],
  ])(
    "counts %i standings and %i new teams (more: %s) as %s",
    (standings, joined, more, text) => {
      expect(teamCount(sized(standings, joined, more))).toBe(text);
    },
  );

  it("says the page shows the top teams only when there are more", () => {
    expect(footerNote(sized(23, 0, false))).toBe("Updated hourly by FPL");
    expect(footerNote(sized(50, 3, true))).toBe(
      "Top 50 teams · Updated hourly by FPL",
    );
  });

  it("labels the collapse controls", () => {
    expect(collapseAllLabel(false)).toBe("Collapse all");
    expect(collapseAllLabel(true)).toBe("Expand all");
    expect(toggleLabel(true, "VARiables")).toBe("Hide VARiables’s transfers");
    expect(toggleLabel(false, "VARiables")).toBe("Show VARiables’s transfers");
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
