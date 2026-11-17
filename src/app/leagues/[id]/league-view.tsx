import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { activityNotice, getActivity } from "@/lib/activity";
import { formatDeadline, gameweekPath, getDeadline } from "@/lib/gameweeks";
import { resolveLeaguePage } from "@/lib/league-page";
import {
  ARRIVING,
  buildCards,
  CAPTAIN,
  type Card,
  footerNote,
  hitLabel,
  NOT_PLAYING,
  pointsLabel,
  STANDINGS_ORDER,
  teamCount,
  transferCount,
} from "@/lib/moves";
import { getPlayerNames } from "@/lib/players";
import { shareDescription, shareTitle } from "@/lib/share";
import {
  CardToggle,
  Collapsible,
  CollapseAllButton,
  CollapseProvider,
} from "./collapse";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "./icons";
import { ShareButton } from "./share-button";

// Shared by /leagues/[id] (the latest gameweek) and /leagues/[id]/gameweeks/[event].
type Params = Promise<{ id: string; event?: string }>;

export async function leagueMetadata(params: Params): Promise<Metadata> {
  const { id, event } = await params;
  const page = await resolveLeaguePage(id, event);
  const title = shareTitle(page.league.name, page.event);
  const description = shareDescription(page.league.name, page.event);
  return {
    // Already names the site where it needs to; see shareTitle.
    title: { absolute: title },
    description,
    openGraph: { title, description, siteName: "FPL Social", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function LeagueView({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <League params={params} />
    </Suspense>
  );
}

async function League({ params }: { params: Params }) {
  const { id, event: rawEvent } = await params;
  const { league, event, latest } = await resolveLeaguePage(id, rawEvent);

  const [result, deadline] =
    event === null
      ? [null, null]
      : await Promise.all([getActivity(league.id, event), getDeadline(event)]);
  if (result?.kind === "league-not-found") notFound();
  if (result?.kind === "gameweek-unavailable")
    redirect(`/leagues/${league.id}`);

  const activity = result?.kind === "ok" ? result.activity : null;
  // Names are only worth fetching when there's a team to describe.
  const names = activity?.teams.length ? await getPlayerNames() : {};
  const cards = buildCards(league, activity, names);
  const notice = activityNotice(result);
  const collapsible = cards.filter((c) => c.transfers.length > 0);

  return (
    <CollapseProvider entries={collapsible.map((c) => c.entry)}>
      {event !== null && latest !== null && (
        <GameweekBar
          leagueId={league.id}
          event={event}
          latest={latest}
          deadline={deadline}
        />
      )}
      <main className="league">
        <div className="league-header">
          <div>
            <p className="muted small">Mini-league · {teamCount(league)}</p>
            <h1>{league.name}</h1>
          </div>
          <ShareButton title={shareTitle(league.name, event)} />
        </div>
        <div className="list-controls">
          <span className="muted small">{STANDINGS_ORDER}</span>
          {collapsible.length > 0 && <CollapseAllButton />}
        </div>
        {notice && <p className="notice">{notice}</p>}
        <ol className="cards">
          {cards.map((card) => (
            <TeamCard key={card.entry} card={card} />
          ))}
        </ol>
        <p className="muted small footer">{footerNote(league)}</p>
      </main>
    </CollapseProvider>
  );
}

function GameweekBar({
  leagueId,
  event,
  latest,
  deadline,
}: {
  leagueId: number;
  event: number;
  latest: number;
  deadline: string | null;
}) {
  return (
    <div className="gameweek-bar">
      <nav className="stepper" aria-label="Gameweek">
        {event > 1 ? (
          <Link
            href={gameweekPath(leagueId, event - 1)}
            className="icon-button"
            aria-label={`Gameweek ${event - 1}`}
          >
            <ChevronLeft />
          </Link>
        ) : (
          <span className="icon-button disabled" aria-hidden="true">
            <ChevronLeft />
          </span>
        )}
        <div className="stepper-current" aria-current="page">
          <span className="stepper-title">Gameweek {event}</span>
          {deadline && (
            <span className="muted small">{formatDeadline(deadline)}</span>
          )}
        </div>
        {event < latest ? (
          <Link
            href={gameweekPath(leagueId, event + 1)}
            className="icon-button"
            aria-label={`Gameweek ${event + 1}`}
          >
            <ChevronRight />
          </Link>
        ) : (
          // The latest gameweek past its deadline: nothing after it to show yet.
          <span className="icon-button disabled" aria-hidden="true">
            <ChevronRight />
          </span>
        )}
      </nav>
    </div>
  );
}

function TeamCard({ card }: { card: Card }) {
  const listId = `transfers-${card.entry}`;
  return (
    <li className="card">
      <div className="card-head">
        <span className="rank">{card.rank ?? "–"}</span>
        <div className="card-title">
          <span className="team-name">{card.name}</span>
          <span className="muted small">{pointsLabel(card.points)}</span>
        </div>
        {card.chip && <span className="chip">{card.chip}</span>}
        {card.transfers.length > 0 && (
          <CardToggle
            entry={card.entry}
            teamName={card.name}
            controls={listId}
          />
        )}
      </div>

      {card.state === "done" && (
        <div className="summary">
          <span className="pill">{transferCount(card.transfers.length)}</span>
          {card.hit > 0 && (
            <span className="pill hit">{hitLabel(card.hit)}</span>
          )}
          {card.captain && (
            <span className="pill captain">
              <span className="captain-badge" aria-hidden="true">
                C
              </span>
              <span className="visually-hidden">{CAPTAIN}</span>
              <span>{card.captain}</span>
              {card.captainChanged && <span className="new">new</span>}
            </span>
          )}
        </div>
      )}

      {card.transfers.length > 0 && (
        <Collapsible entry={card.entry} id={listId}>
          <ul className="transfers">
            {card.transfers.map((t, i) => (
              <li key={i} className="transfer">
                <span className="transfer-in">
                  <ArrowUp />
                  <span>{t.in}</span>
                </span>
                <span className="transfer-for">for</span>
                <span className="transfer-out">
                  <ArrowDown />
                  <span>{t.out}</span>
                </span>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {card.state === "pending" && (
        <p className="card-state">
          <span className="dot" aria-hidden="true" />
          {ARRIVING}
        </p>
      )}
      {card.state === "joined-later" && (
        <p className="card-state">{NOT_PLAYING}</p>
      )}
    </li>
  );
}

// The same shapes as the real bar and cards, so nothing jumps when they arrive.
function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading the league">
      <div className="gameweek-bar">
        <div className="stepper placeholder" />
      </div>
      <main className="league">
        <div className="league-header">
          <div>
            <span className="bar short" />
            <span className="bar title" />
          </div>
        </div>
        <ol className="cards" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="card placeholder">
              <div className="card-head">
                <span className="rank" />
                <div className="card-title">
                  <span className="bar" />
                  <span className="bar short" />
                </div>
              </div>
              <div className="summary">
                <span className="pill bar-pill" />
                <span className="pill bar-pill" />
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
