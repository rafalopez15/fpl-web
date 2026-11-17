import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingState, MessageState } from "@/components/states";
import { PAGES, pageMetadata } from "@/lib/pages";
import { COMING_SOON } from "@/lib/states";
import { parseTeamId } from "@/lib/teams";

// Link-preview bots wait for metadata, so this gives them a 404 for a mistyped id.
export async function generateMetadata({ params }: PageProps<"/teams/[id]">) {
  if (parseTeamId((await params).id) === null) notFound();
  return pageMetadata("team");
}

// Any team, not only yours. A placeholder for now.
export default function TeamPage({ params }: PageProps<"/teams/[id]">) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Team params={params} />
    </Suspense>
  );
}

async function Team({ params }: Pick<PageProps<"/teams/[id]">, "params">) {
  if (parseTeamId((await params).id) === null) notFound();
  return <MessageState title={PAGES.team.title} message={COMING_SOON} />;
}
