import Link from "next/link";

export default function LeagueNotFound() {
  return (
    <main>
      <h1>League not found</h1>
      <p className="muted">FPL couldn&apos;t find this league.</p>
      <p>
        <Link href="/">Try another league</Link>
      </p>
    </main>
  );
}
