import { describe, expect, it } from "vitest";
import type { League } from "@/lib/leagues";
import {
  capNote,
  joinedNote,
  leagueViews,
  pointsText,
  rankChange,
  rankChangeText,
  rankText,
  standingsTitle,
  updatedText,
} from "@/lib/standings";

function league(overrides: Partial<League> = {}): League {
  return {
    id: 314,
    name: "Overall",
    page: 1,
    has_next: false,
    standings: [],
    new_entries: [],
    new_entries_has_next: false,
    ...overrides,
  };
}

const standing = (rank: number | null, last_rank: number | null) => ({
  entry: 1,
  entry_name: "VARiables",
  rank,
  last_rank,
});

describe("leagueViews", () => {
  it("links the moves and standings pages", () => {
    expect(leagueViews(314)).toEqual([
      { key: "moves", label: "Moves", href: "/leagues/314" },
      { key: "standings", label: "Standings", href: "/leagues/314/standings" },
    ]);
  });
});

describe("standingsTitle", () => {
  it("names the league", () => {
    expect(standingsTitle("FPLDev")).toBe("FPLDev standings");
  });
});

describe("rankChange", () => {
  it("is positive for a team that moved up", () => {
    expect(rankChange(standing(3, 5))).toBe(2);
  });

  it("is negative for a team that moved down", () => {
    expect(rankChange(standing(5, 3))).toBe(-2);
  });

  it("is 0 for a team that stayed put", () => {
    expect(rankChange(standing(4, 4))).toBe(0);
  });

  it("is null when either rank is missing or 0", () => {
    expect(rankChange(standing(3, 0))).toBeNull();
    expect(rankChange(standing(0, 3))).toBeNull();
    expect(rankChange(standing(3, null))).toBeNull();
    expect(rankChange(standing(null, 3))).toBeNull();
  });
});

describe("rankChangeText", () => {
  it("says which way and how far", () => {
    expect(rankChangeText(2)).toBe("up 2 places");
    expect(rankChangeText(-1)).toBe("down 1 place");
  });

  it("is null without a move", () => {
    expect(rankChangeText(0)).toBeNull();
    expect(rankChangeText(null)).toBeNull();
  });
});

describe("rankText", () => {
  it("groups thousands", () => {
    expect(rankText(3)).toBe("3");
    expect(rankText(12_345)).toBe("12,345");
  });

  it("is a dash until the team is ranked", () => {
    expect(rankText(0)).toBe("–");
    expect(rankText(null)).toBe("–");
    expect(rankText(undefined)).toBe("–");
  });
});

describe("pointsText", () => {
  it("shows points, 0 included, and a dash without any", () => {
    expect(pointsText(70)).toBe("70");
    expect(pointsText(0)).toBe("0");
    expect(pointsText(null)).toBe("–");
  });
});

describe("capNote", () => {
  it("says how many are shown when the league has more", () => {
    const standings = Array.from({ length: 50 }, (_, i) =>
      standing(i + 1, i + 1),
    );
    expect(capNote(league({ has_next: true, standings }))).toBe(
      "Showing the top 50 teams",
    );
  });

  it("is null when every team is shown", () => {
    expect(capNote(league({ standings: [standing(1, 1)] }))).toBeNull();
  });
});

describe("joinedNote", () => {
  const new_entries = [{ entry: 9, entry_name: "Late Arrivals" }];

  it("says when they'll be ranked", () => {
    expect(joinedNote(league({ new_entries }))).toBe(
      "Ranked after FPL's next update.",
    );
  });

  it("says only the first ones are shown when there are more", () => {
    const first50 = Array.from({ length: 50 }, (_, i) => ({
      entry: i,
      entry_name: `Team ${i}`,
    }));
    expect(
      joinedNote(league({ new_entries: first50, new_entries_has_next: true })),
    ).toBe("Ranked after FPL's next update. Only the first 50 are shown.");
  });
});

describe("updatedText", () => {
  const now = new Date("2026-11-22T12:00:00Z");
  const ago = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000).toISOString();

  it("is null without a time", () => {
    expect(updatedText(null, now)).toBeNull();
    expect(updatedText(undefined, now)).toBeNull();
  });

  it("is just now under a minute, or for a time ahead of the clock", () => {
    expect(updatedText(ago(30), now)).toBe("Updated just now");
    expect(updatedText(ago(-60), now)).toBe("Updated just now");
  });

  it("counts minutes, hours and days", () => {
    expect(updatedText(ago(5 * 60 + 59), now)).toBe("Updated 5 min ago");
    expect(updatedText(ago(2 * 3600), now)).toBe("Updated 2 hr ago");
    expect(updatedText(ago(86_400), now)).toBe("Updated yesterday");
    expect(updatedText(ago(3 * 86_400), now)).toBe("Updated 3 days ago");
  });
});
