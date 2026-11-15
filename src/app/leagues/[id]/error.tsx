"use client"; // Error boundaries must be Client Components.

import Link from "next/link";

// fplAPI failing, timing out or unreachable. A league fplAPI doesn't know is
// not-found.tsx instead.
export default function LeagueError({ retry }: { retry: () => void }) {
  return (
    <main>
      <h1>Couldn&apos;t load this league</h1>
      <p className="muted">Something went wrong reaching FPL. Try again.</p>
      <p className="actions">
        <button type="button" className="button" onClick={() => retry()}>
          Retry
        </button>
        <Link href="/">Try another league</Link>
      </p>
    </main>
  );
}
