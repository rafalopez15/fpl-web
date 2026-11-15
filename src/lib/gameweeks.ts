import { cache } from "react";
import { fplapi } from "@/lib/fplapi/client";

// The latest gameweek past its deadline (FPL's current one), or null before the season.
export const getLatestGameweek = cache(async (): Promise<number | null> => {
  const { data, response } = await fplapi().GET("/api/events");
  if (!data)
    throw new Error(`fplAPI returned ${response.status} for gameweeks`);
  return data.find((e) => e.is_current)?.id ?? null;
});

// A gameweek from a URL segment, or null when it can't be one.
export function parseGameweek(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const event = Number(raw);
  return event >= 1 && event <= 38 ? event : null;
}

// A league's page for one gameweek. /leagues/{id} itself shows the latest.
export function gameweekPath(leagueId: number, event: number): string {
  return `/leagues/${leagueId}/gameweeks/${event}`;
}
