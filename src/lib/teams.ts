import { parseLeagueId } from "@/lib/league-id";

// A team id from a URL segment or the cookie, or null when it can't be one. FPL ids
// share fplAPI's limits, so this is the league check.
export function parseTeamId(raw: string | undefined): number | null {
  return raw === undefined ? null : parseLeagueId(raw);
}

// Where "Your team" goes: the saved team, or the link flow.
export function yourTeamPath(cookie: string | undefined): string {
  const id = parseTeamId(cookie);
  return id === null ? "/teams" : `/teams/${id}`;
}
