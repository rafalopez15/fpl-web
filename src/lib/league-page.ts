import { redirect } from "next/navigation";
import { getLatestGameweek, parseGameweek } from "@/lib/gameweeks";
import { findLeague, type League } from "@/lib/leagues";

export type LeaguePage = {
  league: League;
  // Null before the season's first deadline.
  event: number | null;
  latest: number | null;
};

// The league and gameweek a URL asks for. Without a gameweek it's the latest; an
// unknown or future one goes back to the league's latest, since there's nothing to show.
export async function resolveLeaguePage(
  rawId: string,
  rawEvent?: string,
): Promise<LeaguePage> {
  const [league, latest] = await Promise.all([
    findLeague(rawId),
    getLatestGameweek(),
  ]);
  if (rawEvent === undefined) return { league, event: latest, latest };

  const event = parseGameweek(rawEvent);
  if (event === null || latest === null || event > latest) {
    redirect(`/leagues/${league.id}`);
  }
  return { league, event, latest };
}
