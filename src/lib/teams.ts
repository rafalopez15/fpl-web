import { notFound } from "next/navigation";
import { cache } from "react";
import { fplapi } from "@/lib/fplapi/client";
import type { components } from "@/lib/fplapi/schema";
import { parseFplUrl, parseLeagueId } from "@/lib/league-id";
import { FPL_DOWN, TEAM_NOT_FOUND } from "@/lib/states";

// fplAPI calls a team a manager.
export type Team = components["schemas"]["ManagerResponse"];

// A team id from a URL segment or the cookie, or null when it can't be one. FPL ids
// share fplAPI's limits, so this is the league check.
export function parseTeamId(raw: string | undefined): number | null {
  return raw === undefined ? null : parseLeagueId(raw);
}

// Where "Your team" goes: the saved team, or the link flow.
// The number, or the FPL address the hint shows (/entry/<id>/…).
export function parseTeamInput(input: string): number | null {
  const text = input.trim();
  if (/^\d+$/.test(text)) return parseTeamId(text);
  const match = parseFplUrl(text)?.pathname.match(/^\/entry\/(\d+)(?:\/|$)/);
  return match ? parseTeamId(match[1]) : null;
}

export function yourTeamPath(cookie: string | undefined): string {
  const id = parseTeamId(cookie);
  return id === null ? "/teams" : `/teams/${id}`;
}

export type TeamResult =
  | { kind: "ok"; team: Team }
  | { kind: "not-found" }
  | { kind: "fpl-unavailable" };

// 503 is FPL down. Neither status is in the spec, hence the checks.
export async function getTeam(id: number): Promise<TeamResult> {
  const { data, response } = await fplapi().GET("/api/managers/{manager_id}", {
    params: { path: { manager_id: id } },
  });
  if (response.status === 404) return { kind: "not-found" };
  if (response.status === 503) return { kind: "fpl-unavailable" };
  if (!data)
    throw new Error(`fplAPI returned ${response.status} for team ${id}`);
  return { kind: "ok", team: data };
}

// Once per request, for the page and its metadata.
export const findTeam = cache(async (rawId: string): Promise<Team> => {
  const id = parseTeamId(rawId);
  if (id === null) notFound();
  const result = await getTeam(id);
  if (result.kind === "not-found") notFound();
  if (result.kind === "fpl-unavailable") throw new Error(FPL_DOWN);
  return result.team;
});

const number = new Intl.NumberFormat("en-GB");

// "563 pts · Rank 1,571,477", or "ID 1" before either exists.
export function teamSummary(team: Team): string {
  const parts: string[] = [];
  if (team.summary_overall_points != null) {
    parts.push(`${number.format(team.summary_overall_points)} pts`);
  }
  if (team.summary_overall_rank != null) {
    parts.push(`Rank ${number.format(team.summary_overall_rank)}`);
  }
  return parts.length ? parts.join(" · ") : `ID ${team.id}`;
}

// A dash for what FPL hasn't got yet, e.g. a new team's rank.
export function teamStats(team: Team): { label: string; value: string }[] {
  const value = (n: number | null | undefined) =>
    n == null ? "–" : number.format(n);
  return [
    { label: "Points", value: value(team.summary_overall_points) },
    { label: "Overall rank", value: value(team.summary_overall_rank) },
    {
      label: team.current_event ? `GW${team.current_event} points` : "Gameweek",
      value: value(team.summary_event_points),
    },
  ];
}

export function teamLabel(isYours: boolean): string {
  return isYours ? "Your FPL team" : "FPL team";
}

export const LINK = {
  title: "Link your FPL team",
  blurb:
    "See your team here and open it from Your team. Linking is kept in this browser; you don't need to sign in.",
  field: "Manager ID",
  hint: "On the FPL website, open your team's Points page. Your ID is the number after /entry/ in the address, e.g. fantasy.premierleague.com/entry/1234567/event/9.",
  find: "Find team",
  finding: "Finding…",
  question: "Is this your team?",
  confirm: "Link team",
  linking: "Linking…",
  reject: "Not my team",
};

export const UNLINK = {
  button: "Unlink team",
  message: "You can link it again any time with its manager ID.",
  cancel: "Cancel",
};

export function unlinkTitle(teamName: string): string {
  return `Unlink ${teamName}?`;
}

export const PLACEHOLDERS = [
  {
    title: "Squad",
    message: "This team's squad and live points are coming soon.",
  },
  { title: "Transfers", message: "This team's transfers are coming soon." },
];

// A warning is FPL's side, which retrying may fix; an error is the ID.
export type LinkLookup =
  | { kind: "found"; id: number; name: string; summary: string }
  | { kind: "error"; message: string; warning: boolean };

// The server failing to reach fplAPI, not the person being offline.
export const NOT_REACHED = "Couldn't reach FPL. Try again in a few minutes.";

export async function lookUpTeam(input: string): Promise<LinkLookup> {
  const id = parseTeamInput(input);
  // iOS treats an ID too big for fplAPI as no such team, too.
  if (id === null) {
    return { kind: "error", message: TEAM_NOT_FOUND.message, warning: false };
  }
  let result: TeamResult;
  try {
    result = await getTeam(id);
  } catch {
    return { kind: "error", message: NOT_REACHED, warning: true };
  }
  if (result.kind === "not-found") {
    return { kind: "error", message: TEAM_NOT_FOUND.message, warning: false };
  }
  if (result.kind === "fpl-unavailable") {
    return { kind: "error", message: FPL_DOWN, warning: true };
  }
  const { team } = result;
  return {
    kind: "found",
    id: team.id,
    name: team.name,
    summary: teamSummary(team),
  };
}
