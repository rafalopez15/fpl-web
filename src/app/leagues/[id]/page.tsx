import type { Metadata } from "next";
import { Suspense } from "react";
import { findLeague } from "@/lib/fplapi";

export async function generateMetadata({
  params,
}: PageProps<"/leagues/[id]">): Promise<Metadata> {
  const league = await findLeague((await params).id);
  const title = `${league.name} · FPL Social`;
  const description = `${league.name}'s standings on FPL Social.`;
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
      <Suspense fallback={<p className="muted">Loading the league…</p>}>
        <Standings params={params} />
      </Suspense>
    </main>
  );
}

async function Standings({ params }: Pick<PageProps<"/leagues/[id]">, "params">) {
  const league = await findLeague((await params).id);

  return (
    <>
      <h1>{league.name}</h1>
      {league.standings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Team</th>
              <th scope="col" className="num">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {league.standings.map((s) => (
              <tr key={s.entry}>
                <td>{s.rank ?? "–"}</td>
                <td className="team">{s.entry_name}</td>
                <td className="num">{s.total ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">
          No standings yet. They appear after this league&apos;s first gameweek.
        </p>
      )}
    </>
  );
}
