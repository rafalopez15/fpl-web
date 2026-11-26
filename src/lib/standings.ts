import type { components } from "@/lib/fplapi/schema";
import type { League } from "@/lib/leagues";

export type Standing = components["schemas"]["Standing"];

// The two views of a league, as a switch of links on both pages.
export type LeagueViewKey = "moves" | "standings";

export function leagueViews(
  leagueId: number,
): { key: LeagueViewKey; label: string; href: string }[] {
  return [
    { key: "moves", label: "Moves", href: `/leagues/${leagueId}` },
    {
      key: "standings",
      label: "Standings",
      href: `/leagues/${leagueId}/standings`,
    },
  ];
}

export const VIEW_SWITCH_LABEL = "League view";

export function standingsTitle(leagueName: string): string {
  return `${leagueName} standings`;
}

export const STANDINGS_COLUMNS = {
  rank: "Rank",
  team: "Team",
  gameweek: "GW",
  gameweekFull: "Gameweek points",
  total: "Total",
};

// Places moved since the last gameweek, positive for up. Null when either rank is
// missing or 0, FPL's "not ranked yet".
export function rankChange(standing: Standing): number | null {
  const { rank, last_rank } = standing;
  if (!rank || !last_rank) return null;
  return last_rank - rank;
}

export function rankText(rank: number | null | undefined): string {
  return rank ? rank.toLocaleString("en-GB") : "–";
}

// For screen readers, beside the arrow: "up 2 places".
export function rankChangeText(change: number | null): string | null {
  if (!change) return null;
  const places = Math.abs(change);
  return `${change > 0 ? "up" : "down"} ${places} place${places === 1 ? "" : "s"}`;
}

export function pointsText(points: number | null | undefined): string {
  return points == null ? "–" : String(points);
}

// Under a league cut off at its first page. fplAPI's league response has no size, so
// unlike iOS it can't say "of 11.2M teams".
export function capNote(league: League): string | null {
  return league.has_next
    ? `Showing the top ${league.standings.length} teams`
    : null;
}

export const JOINED_TITLE = "Joined this gameweek";

export function joinedNote(league: League): string {
  const note = "Ranked after FPL's next update.";
  return league.new_entries_has_next
    ? `${note} Only the first ${league.new_entries.length} are shown.`
    : note;
}

export const NO_TEAMS = "No teams in this league yet";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

// "Updated 5 min ago" from last_updated; null without one.
export function updatedText(
  lastUpdated: string | null | undefined,
  now: Date,
): string | null {
  if (!lastUpdated) return null;
  const seconds = Math.max(
    0,
    (now.getTime() - new Date(lastUpdated).getTime()) / 1000,
  );
  const format = new Intl.RelativeTimeFormat("en-GB", {
    numeric: "auto",
    style: "short",
  });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) {
      return `Updated ${format.format(-Math.floor(seconds / size), unit)}`;
    }
  }
  return "Updated just now";
}
