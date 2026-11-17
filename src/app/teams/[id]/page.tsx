import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { LoadingState } from "@/components/states";
import { PAGES, SITE_NAME } from "@/lib/pages";
import {
  findTeam,
  LINK,
  parseTeamId,
  PLACEHOLDERS,
  type Team,
  teamLabel,
  teamStats,
  UNLINK,
  unlinkTitle,
} from "@/lib/teams";
import { TEAM_COOKIE } from "@/lib/your-team";
import { linkTeam, unlinkTeam } from "../actions";

// Bots wait for metadata, so a missing team gets them a 404.
export async function generateMetadata({
  params,
}: PageProps<"/teams/[id]">): Promise<Metadata> {
  const team = await findTeam((await params).id);
  const description = PAGES.team.description;
  return {
    title: team.name,
    description,
    openGraph: {
      title: team.name,
      description,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

// Any team, so links to it can be shared.
export default function TeamPage({ params }: PageProps<"/teams/[id]">) {
  return (
    <Suspense fallback={<LoadingState />}>
      <TeamView params={params} />
    </Suspense>
  );
}

async function TeamView({ params }: Pick<PageProps<"/teams/[id]">, "params">) {
  const team = await findTeam((await params).id);
  const linked = parseTeamId((await cookies()).get(TEAM_COOKIE)?.value);
  const isYours = linked === team.id;

  return (
    <main className="team">
      <TeamCard team={team} isYours={isYours} />
      {linked === null && <ClaimCard team={team} />}
      {PLACEHOLDERS.map((p) => (
        <section key={p.title} className="placeholder-section">
          <h2>{p.title}</h2>
          <p className="muted">{p.message}</p>
        </section>
      ))}
    </main>
  );
}

// Ids include the team id: Next keeps visited team pages hidden in the DOM.
function TeamCard({ team, isYours }: { team: Team; isYours: boolean }) {
  const titleId = `team-title-${team.id}`;
  return (
    <section className="team-card" aria-labelledby={titleId}>
      <div className="team-card-head">
        <div className="team-card-title">
          <p className="label">{teamLabel(isYours)}</p>
          <h1 id={titleId}>{team.name}</h1>
          <p className="muted small">ID {team.id}</p>
        </div>
        {isYours && <UnlinkButton team={team} />}
      </div>
      <dl className="team-stats">
        {teamStats(team).map((stat) => (
          <div key={stat.label}>
            <dt className="muted small">{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Asks first, as iOS does.
function UnlinkButton({ team }: { team: Team }) {
  const id = `unlink-${team.id}`;
  return (
    <>
      <button type="button" className="text-button" popoverTarget={id}>
        {UNLINK.button}
      </button>
      <div
        id={id}
        popover="auto"
        className="dialog"
        role="dialog"
        aria-labelledby={`${id}-title`}
      >
        <h2 id={`${id}-title`}>{unlinkTitle(team.name)}</h2>
        <p className="muted">{UNLINK.message}</p>
        <form action={unlinkTeam} className="dialog-actions">
          <button
            type="button"
            className="button secondary"
            popoverTarget={id}
            popoverTargetAction="hide"
          >
            {UNLINK.cancel}
          </button>
          <button type="submit" className="button danger">
            {UNLINK.button}
          </button>
        </form>
      </div>
    </>
  );
}

function ClaimCard({ team }: { team: Team }) {
  return (
    <form action={linkTeam} className="confirm-card">
      <p className="label">{LINK.question}</p>
      <input type="hidden" name="id" value={team.id} />
      <div className="confirm-actions">
        <button type="submit" className="button">
          {LINK.confirm}
        </button>
      </div>
    </form>
  );
}
