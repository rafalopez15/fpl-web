import { LeagueView, leagueMetadata } from "../../league-view";

// One gameweek of a league, so a link keeps showing that gameweek.
export function generateMetadata({
  params,
}: PageProps<"/leagues/[id]/gameweeks/[event]">) {
  return leagueMetadata(params);
}

export default function GameweekPage({
  params,
}: PageProps<"/leagues/[id]/gameweeks/[event]">) {
  return <LeagueView params={params} />;
}
