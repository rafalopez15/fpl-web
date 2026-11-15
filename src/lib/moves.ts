import type { components } from "@/lib/fplapi/schema";
import type { League } from "@/lib/leagues";

export type TeamActivity = components["schemas"]["TeamActivity"];
export type PlayerNames = Record<number, string>;

const CHIPS: Record<string, string> = {
  wildcard: "Wildcard",
  freehit: "Free Hit",
  bboost: "Bench Boost",
  "3xc": "Triple Captain",
  manager: "Assistant Manager",
};

// FPL's chip codes as people know them; an unknown one shows as FPL sends it.
export function chipLabel(chip: string): string {
  return CHIPS[chip] ?? chip;
}

function playerName(names: PlayerNames, id: number): string {
  return names[id] ?? "Unknown player";
}

// What a team did, e.g. "2 transfers (−4): Isak in for Watkins, Saka in for Palmer ·
// Captain: Haaland (changed)". Empty when it made no transfers and kept its captain.
export function describeMoves(team: TeamActivity, names: PlayerNames): string {
  const parts: string[] = [];
  const count = team.transfers.length;
  if (count > 0) {
    const hit = team.transfers_cost > 0 ? ` (−${team.transfers_cost})` : "";
    const list = team.transfers
      .map(
        (t) =>
          `${playerName(names, t.element_in)} in for ${playerName(names, t.element_out)}`,
      )
      .join(", ");
    parts.push(`${count} transfer${count === 1 ? "" : "s"}${hit}: ${list}`);
  }
  // Null means there's no earlier gameweek to compare with, so nothing to say.
  if (team.captain_changed && team.captain != null) {
    parts.push(`Captain: ${playerName(names, team.captain)} (changed)`);
  }
  return parts.join(" · ");
}

// Suggested wording, not decided yet: see the PR.
export const ARRIVING = "Moves arriving within the hour";
export const NOT_PLAYING = "Joined after this gameweek";
export const NO_MOVES = "No moves";

export type Row = {
  entry: number;
  rank: number | null;
  name: string;
  chip: string | null;
  // Null when there's no activity to show for the league at all.
  moves: string | null;
  quiet: boolean;
};

export type ActivityView = { pending: boolean; teams: TeamActivity[] } | null;

// The standings' first page in order, then teams that joined since, each with its moves.
export function buildRows(
  league: League,
  activity: ActivityView,
  names: PlayerNames,
): Row[] {
  const byEntry = new Map(activity?.teams.map((t) => [t.entry, t]));
  const teams = [
    ...league.standings.map((s) => ({
      entry: s.entry,
      name: s.entry_name,
      rank: s.rank ?? null,
    })),
    ...league.new_entries.map((e) => ({
      entry: e.entry,
      name: e.entry_name,
      rank: null,
    })),
  ];

  // A league with no team done yet gets one notice above the standings, not one per row.
  const nothingYet =
    !activity || (activity.pending && activity.teams.length === 0);

  return teams.map(({ entry, name, rank }) => {
    const row = { entry, name, rank, chip: null };
    if (nothingYet) return { ...row, moves: null, quiet: true };
    const team = byEntry.get(entry);
    if (!team) {
      return {
        ...row,
        moves: activity.pending ? ARRIVING : NOT_PLAYING,
        quiet: true,
      };
    }
    const chip = team.chip ? chipLabel(team.chip) : null;
    const moves = describeMoves(team, names);
    if (!moves && !chip) return { ...row, moves: NO_MOVES, quiet: true };
    return { ...row, chip, moves, quiet: false };
  });
}
