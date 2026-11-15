import { notFound } from "next/navigation";
import { cache } from "react";
import { fplapi } from "@/lib/fplapi/client";
import type { components } from "@/lib/fplapi/schema";
import { parseLeagueId } from "@/lib/league-id";

export type League = components["schemas"]["LeagueStandingsResponse"];

// Null when fplAPI has no such league; its 404 isn't in the spec, hence the status check.
export async function getLeague(id: number): Promise<League | null> {
  const { data, response } = await fplapi().GET("/api/leagues/{league_id}", {
    params: { path: { league_id: id } },
  });
  if (response.status === 404) return null;
  if (!data)
    throw new Error(`fplAPI returned ${response.status} for league ${id}`);
  return data;
}

// The league for a route's [id], fetched once per request for the page and its metadata.
// notFound() for an id that isn't one, or a league fplAPI doesn't know.
export const findLeague = cache(async (rawId: string): Promise<League> => {
  const id = parseLeagueId(rawId);
  const league = id === null ? null : await getLeague(id);
  if (!league) notFound();
  return league;
});
