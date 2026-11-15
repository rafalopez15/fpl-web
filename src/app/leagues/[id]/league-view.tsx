import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { activityNotice, getActivity } from "@/lib/activity";
import { gameweekPath } from "@/lib/gameweeks";
import { resolveLeaguePage } from "@/lib/league-page";
import { buildRows, type Moves, movesLine, type Row } from "@/lib/moves";
import { getPlayerNames } from "@/lib/players";
import { shareDescription, shareTitle } from "@/lib/share";

// Shared by /leagues/[id] (the latest gameweek) and /leagues/[id]/gameweeks/[event].
type Params = Promise<{ id: string; event?: string }>;

export async function leagueMetadata(params: Params): Promise<Metadata> {
  const { id, event } = await params;
  const page = await resolveLeaguePage(id, event);
  const title = shareTitle(page.league.name, page.event);
  const description = shareDescription(page.league.name, page.event);
  return {
    title,
    description,
    openGraph: { title, description, siteName: "FPL Social", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function LeagueView({ params }: { params: Params }) {
  return (
    <main>
      <p>
        <Link href="/">FPL Social</Link>
      </p>
      <Suspense fallback={<Loading />}>
        <League params={params} />
      </Suspense>
    </main>
  );
}

async function League({ params }: { params: Params }) {
  const { id, event: rawEvent } = await params;
  const { league, event, latest } = await resolveLeaguePage(id, rawEvent);

  const result = event === null ? null : await getActivity(league.id, event);
  if (result?.kind === "league-not-found") notFound();
  if (result?.kind === "gameweek-unavailable")
    redirect(`/leagues/${league.id}`);

  const activity = result?.kind === "ok" ? result.activity : null;
  // Names are only worth fetching when there's a team to describe.
  const names = activity?.teams.length ? await getPlayerNames() : {};
  const rows = buildRows(league, activity, names);
  const notice = activityNotice(result);

  return (
    <>
      <h1>{league.name}</h1>
      {event !== null && latest !== null && (
        <Stepper leagueId={league.id} event={event} latest={latest} />
      )}
      {notice && <p className="notice">{notice}</p>}
      <Standings rows={rows} />
    </>
  );
}

function Stepper({
  leagueId,
  event,
  latest,
}: {
  leagueId: number;
  event: number;
  latest: number;
}) {
  return (
    <nav className="stepper" aria-label="Gameweeks">
      {event > 1 ? (
        <Link href={gameweekPath(leagueId, event - 1)} rel="prev">
          <span aria-hidden="true">‹ </span>GW {event - 1}
        </Link>
      ) : (
        <span />
      )}
      <span className="stepper-current" aria-current="page">
        Gameweek {event}
      </span>
      {event < latest ? (
        <Link href={gameweekPath(leagueId, event + 1)} rel="next">
          GW {event + 1}
          <span aria-hidden="true"> ›</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function Standings({ rows }: { rows: Row[] }) {
  return (
    <ol className="standings">
      {rows.map((row) => (
        <li key={row.entry} className="standing">
          <span className="rank">{row.rank ?? "–"}</span>
          <div>
            <p className="team">
              {row.name}
              {row.chip && <span className="chip">{row.chip}</span>}
            </p>
            {row.moves && <TeamMoves moves={row.moves} />}
            {row.note && <p className="moves muted">{row.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Transfers past the first few open on a tap, with <details>: no JavaScript needed.
function TeamMoves({ moves }: { moves: Moves }) {
  if (moves.more.length === 0)
    return <p className="moves">{movesLine(moves)}</p>;
  return (
    <div className="moves">
      <p>{moves.transfers}</p>
      <details className="more">
        <summary>and {moves.more.length} more</summary>
        <p>{moves.more.join(", ")}</p>
      </details>
      {moves.captain && <p>{moves.captain}</p>}
    </div>
  );
}

function Loading() {
  return (
    <div aria-busy="true">
      <p className="muted">Loading the league…</p>
      <ol className="standings" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="standing placeholder">
            <span className="rank" />
            <div>
              <span className="bar" />
              <span className="bar short" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
