import { LeagueForm } from "./league-form";

export default function Home() {
  return (
    <main>
      <h1>FPL Social</h1>
      <p className="muted">See what your mini-league did this gameweek.</p>
      <LeagueForm />
    </main>
  );
}
