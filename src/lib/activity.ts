import { cache } from "react";
import { fplapi } from "@/lib/fplapi/client";
import type { components } from "@/lib/fplapi/schema";

export type LeagueActivity = components["schemas"]["LeagueActivityResponse"];

export type ActivityResult =
  | { kind: "ok"; activity: LeagueActivity }
  // 422: more than 50 teams.
  | { kind: "too-big" }
  // 429: fplAPI is tracking as many new leagues as it can for now.
  | { kind: "busy" }
  // 404 for the gameweek: unknown, or its deadline hasn't passed.
  | { kind: "gameweek-unavailable" }
  | { kind: "league-not-found" };

// What each team in a league did in a gameweek, fetched once per request.
export const getActivity = cache(
  async (leagueId: number, event: number): Promise<ActivityResult> => {
    const { data, error, response } = await fplapi().GET(
      "/api/leagues/{league_id}/activity",
      { params: { path: { league_id: leagueId }, query: { event } } },
    );
    if (data) return { kind: "ok", activity: data };
    if (response.status === 422) return { kind: "too-big" };
    if (response.status === 429) return { kind: "busy" };
    if (response.status === 404) {
      const detail = (error as { detail?: unknown } | undefined)?.detail;
      return detail === "League not found"
        ? { kind: "league-not-found" }
        : { kind: "gameweek-unavailable" };
    }
    throw new Error(
      `fplAPI returned ${response.status} for league ${leagueId}'s activity`,
    );
  },
);

// The message above the standings when there are no moves to show for the league,
// or null when there are. A null result means no gameweek has passed its deadline.
export function activityNotice(result: ActivityResult | null): string | null {
  if (result === null) return "The season hasn't started yet.";
  if (result.kind === "too-big") return "Leagues up to 50 teams for now.";
  if (result.kind === "busy") {
    return "Lots of leagues are being added right now. Try again in a few minutes.";
  }
  if (
    result.kind === "ok" &&
    result.activity.pending &&
    result.activity.teams.length === 0
  ) {
    return "We're fetching this league's moves. Check back within the hour.";
  }
  return null;
}
