import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findLeague } from "@/lib/leagues";

export async function generateMetadata({
  params,
}: PageProps<"/leagues/[id]">): Promise<Metadata> {
  const league = await findLeague((await params).id);
  const title = `${league.name} · FPL Social`;
  const description = `${league.name}, a mini-league on FPL Social.`;
  return {
    title,
    description,
    openGraph: { title, description, siteName: "FPL Social", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function LeaguePage({ params }: PageProps<"/leagues/[id]">) {
  return (
    <main>
      <p>
        <Link href="/">FPL Social</Link>
      </p>
      <Suspense fallback={<p className="muted">Loading the league…</p>}>
        <LeagueName params={params} />
      </Suspense>
    </main>
  );
}

async function LeagueName({
  params,
}: Pick<PageProps<"/leagues/[id]">, "params">) {
  const league = await findLeague((await params).id);
  return (
    <>
      <h1>{league.name}</h1>
      <p className="muted">
        Standings and this gameweek&apos;s moves are coming soon.
      </p>
    </>
  );
}
