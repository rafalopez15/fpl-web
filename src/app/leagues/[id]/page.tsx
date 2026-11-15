import { LeagueView, leagueMetadata } from "./league-view";

// The league's latest gameweek. Earlier ones are at /leagues/[id]/gameweeks/[event].
export function generateMetadata({ params }: PageProps<"/leagues/[id]">) {
  return leagueMetadata(params);
}

export default function LeaguePage({ params }: PageProps<"/leagues/[id]">) {
  return <LeagueView params={params} />;
}
