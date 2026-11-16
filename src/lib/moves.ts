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

export function transferCount(count: number): string {
  if (count === 0) return "No transfers";
  return `${count} transfer${count === 1 ? "" : "s"}`;
}

// A hit as FPL shows it, e.g. "−4 pts", with a minus sign rather than a hyphen.
export function hitLabel(cost: number): string {
  return `−${cost} pts`;
}

// The league's size; the page shows the standings' first page, so a bigger one is "50+".
export function teamCount(shown: number, more: boolean): string {
  if (more) return `${shown}+ teams`;
  return `${shown} team${shown === 1 ? "" : "s"}`;
}

export function pointsLabel(total: number | null): string {
  return total === null ? "New to the league" : `${total} pts`;
}

export const ARRIVING = "Moves arriving within the hour";
export const NOT_PLAYING = "Joined after this gameweek";

export type Transfer = { in: string; out: string };

export type Card = {
  entry: number;
  rank: number | null;
  name: string;
  // Null for a team that joined after the standings were last worked out.
  points: number | null;
  // done: its gameweek is stored. pending: not yet, while the league is pending.
  // joined-later: missing once nothing is pending. standings: no moves to show at all.
  state: "done" | "pending" | "joined-later" | "standings";
  chip: string | null;
  transfers: Transfer[];
  // The hit in points, 0 for none.
  hit: number;
  captain: string | null;
  captainChanged: boolean;
};

export type ActivityView = { pending: boolean; teams: TeamActivity[] } | null;

// One card per team: the standings' first page in order, then teams that joined since.
export function buildCards(
  league: League,
  activity: ActivityView,
  names: PlayerNames,
): Card[] {
  const byEntry = new Map(activity?.teams.map((t) => [t.entry, t]));
  const teams = [
    ...league.standings.map((s) => ({
      entry: s.entry,
      name: s.entry_name,
      rank: s.rank ?? null,
      points: s.total ?? null,
    })),
    ...league.new_entries.map((e) => ({
      entry: e.entry,
      name: e.entry_name,
      rank: null,
      points: null,
    })),
  ];
  // A league with no team done yet gets one notice above the cards, not one per card.
  const nothingYet =
    !activity || (activity.pending && activity.teams.length === 0);

  return teams.map((team) => {
    const empty = {
      ...team,
      chip: null,
      transfers: [],
      hit: 0,
      captain: null,
      captainChanged: false,
    };
    if (nothingYet) return { ...empty, state: "standings" };
    const done = byEntry.get(team.entry);
    if (!done) {
      return { ...empty, state: activity.pending ? "pending" : "joined-later" };
    }
    return {
      ...team,
      state: "done",
      chip: done.chip ? chipLabel(done.chip) : null,
      transfers: done.transfers.map((t) => ({
        in: playerName(names, t.element_in),
        out: playerName(names, t.element_out),
      })),
      hit: done.transfers_cost,
      captain: done.captain == null ? null : playerName(names, done.captain),
      // Null means no earlier gameweek to compare with, so it isn't called new.
      captainChanged: done.captain_changed === true,
    };
  });
}

export type GameweekTotals = { transfers: number; hits: number; chips: number };

// The share image's tiles, counting only teams whose gameweek is stored.
export function gameweekTotals(teams: TeamActivity[]): GameweekTotals {
  return {
    transfers: teams.reduce((sum, t) => sum + t.transfers.length, 0),
    hits: teams.reduce((sum, t) => sum + t.transfers_cost, 0),
    chips: teams.filter((t) => t.chip).length,
  };
}
