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

// Transfers listed before the rest go behind "and N more", so a Wildcard stays short.
export const SHOWN_TRANSFERS = 3;

export type Moves = {
  // e.g. "2 transfers (−4): Isak in for Watkins, Saka in for Palmer"
  transfers: string | null;
  // Transfers past the first SHOWN_TRANSFERS, e.g. ["Raya in for Verbruggen"].
  more: string[];
  // e.g. "Captain: Haaland (changed)"
  captain: string | null;
};

// What a team did. Every part is empty when it made no transfers and kept its captain.
export function describeMoves(team: TeamActivity, names: PlayerNames): Moves {
  const count = team.transfers.length;
  const swaps = team.transfers.map(
    (t) =>
      `${playerName(names, t.element_in)} in for ${playerName(names, t.element_out)}`,
  );
  const hit = team.transfers_cost > 0 ? ` (−${team.transfers_cost})` : "";
  const transfers =
    count === 0
      ? null
      : `${count} transfer${count === 1 ? "" : "s"}${hit}: ${swaps.slice(0, SHOWN_TRANSFERS).join(", ")}`;
  // Null means there's no earlier gameweek to compare with, so nothing to say.
  const captain =
    team.captain_changed && team.captain != null
      ? `Captain: ${playerName(names, team.captain)} (changed)`
      : null;
  return { transfers, more: swaps.slice(SHOWN_TRANSFERS), captain };
}

// The moves on one line, e.g. "1 transfer: Isak in for Watkins · Captain: Haaland
// (changed)". With hidden transfers the captain gets its own line instead.
export function movesLine(moves: Moves): string {
  return [moves.transfers, moves.captain].filter(Boolean).join(" · ");
}

export const ARRIVING = "Moves are being fetched. Check back later.";
export const NOT_PLAYING = "Joined after this gameweek";
export const NO_MOVES = "No moves";

export type Row = {
  entry: number;
  rank: number | null;
  name: string;
  chip: string | null;
  moves: Moves | null;
  // Said instead of moves: no moves, still being fetched, or joined later.
  note: string | null;
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
    const row = { entry, name, rank, chip: null, moves: null };
    if (nothingYet) return { ...row, note: null };
    const team = byEntry.get(entry);
    if (!team) {
      return { ...row, note: activity.pending ? ARRIVING : NOT_PLAYING };
    }
    const chip = team.chip ? chipLabel(team.chip) : null;
    const moves = describeMoves(team, names);
    const quiet = !moves.transfers && !moves.captain;
    if (quiet && !chip) return { ...row, note: NO_MOVES };
    return { ...row, chip, moves: quiet ? null : moves, note: null };
  });
}
