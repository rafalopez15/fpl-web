import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowDown, ArrowUp } from "@/components/icons";
import { findLeague } from "@/lib/leagues";
import { teamCount } from "@/lib/moves";
import { PAGES, SITE_NAME } from "@/lib/pages";
import {
  capNote,
  JOINED_TITLE,
  joinedNote,
  NO_TEAMS,
  pointsText,
  rankChange,
  rankChangeText,
  rankText,
  type Standing,
  STANDINGS_COLUMNS,
  standingsTitle,
  updatedText,
} from "@/lib/standings";
import { ViewSwitch } from "../view-switch";

// Bots wait for metadata, so a missing league gets them a 404.
export async function generateMetadata({
  params,
}: PageProps<"/leagues/[id]/standings">): Promise<Metadata> {
  const league = await findLeague((await params).id);
  const title = standingsTitle(league.name);
  const description = PAGES.standings.description;
  return {
    title,
    description,
    openGraph: { title, description, siteName: SITE_NAME, type: "website" },
  };
}

// Always the latest standings, so no gameweek stepper.
export default function StandingsPage({
  params,
}: PageProps<"/leagues/[id]/standings">) {
  return (
    <Suspense fallback={<Loading />}>
      <Standings params={params} />
    </Suspense>
  );
}

async function Standings({
  params,
}: Pick<PageProps<"/leagues/[id]/standings">, "params">) {
  const league = await findLeague((await params).id);
  await connection();
  const updated = updatedText(league.last_updated, new Date());
  const cap = capNote(league);
  const joinedId = `joined-${league.id}`;

  return (
    <main className="league">
      <div className="league-header">
        <div>
          <p className="muted small">Mini-league · {teamCount(league)}</p>
          <h1>{league.name}</h1>
        </div>
      </div>
      <ViewSwitch leagueId={league.id} current="standings" />

      {league.standings.length > 0 && (
        <table className="standings">
          <thead>
            <tr>
              <th scope="col" className="standing-rank">
                {STANDINGS_COLUMNS.rank}
              </th>
              <th scope="col">{STANDINGS_COLUMNS.team}</th>
              <th scope="col" className="standing-points">
                <abbr title={STANDINGS_COLUMNS.gameweekFull}>
                  {STANDINGS_COLUMNS.gameweek}
                </abbr>
              </th>
              <th scope="col" className="standing-points">
                {STANDINGS_COLUMNS.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {league.standings.map((s) => (
              <StandingRow key={s.entry} standing={s} />
            ))}
          </tbody>
        </table>
      )}
      {(cap || updated) && (
        <p className="muted small footer">
          {[cap, updated].filter(Boolean).join(" · ")}
        </p>
      )}

      {league.new_entries.length > 0 && (
        <section className="joined" aria-labelledby={joinedId}>
          <h2 id={joinedId}>{JOINED_TITLE}</h2>
          <ul className="joined-list">
            {league.new_entries.map((e) => (
              <li key={e.entry}>
                <Link href={`/teams/${e.entry}`} className="team-name">
                  {e.entry_name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="muted small">{joinedNote(league)}</p>
        </section>
      )}

      {league.standings.length === 0 && league.new_entries.length === 0 && (
        <p className="muted">{NO_TEAMS}</p>
      )}
    </main>
  );
}

function StandingRow({ standing }: { standing: Standing }) {
  const change = rankChange(standing);
  const changeText = rankChangeText(change);
  return (
    <tr>
      <td className="standing-rank">
        {change !== null && change > 0 && <ArrowUp className="rank-up" />}
        {change !== null && change < 0 && <ArrowDown className="rank-down" />}
        <span>{rankText(standing.rank)}</span>
        {changeText && <span className="visually-hidden">, {changeText}</span>}
      </td>
      <td className="standing-team">
        <Link href={`/teams/${standing.entry}`} className="team-name">
          {standing.entry_name}
        </Link>
      </td>
      <td className="standing-points muted">
        {pointsText(standing.event_total)}
      </td>
      <td className="standing-points standing-total">
        {pointsText(standing.total)}
      </td>
    </tr>
  );
}

// The same shapes as the header, switch and table, so nothing jumps.
function Loading() {
  return (
    <main
      className="league"
      aria-busy="true"
      aria-label="Loading the standings"
    >
      <div className="league-header">
        <div>
          <span className="bar short" />
          <span className="bar title" />
        </div>
      </div>
      <div className="view-switch placeholder" aria-hidden="true" />
      <div className="standings placeholder" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="bar" />
        ))}
      </div>
    </main>
  );
}
