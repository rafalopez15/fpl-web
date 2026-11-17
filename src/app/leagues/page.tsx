import { pageMetadata } from "@/lib/pages";
import { LeagueForm } from "./league-form";

export const metadata = pageMetadata("leagues");

export default function Leagues() {
  return (
    <main>
      <h1>See what your mini-league did this gameweek</h1>
      <LeagueForm />
    </main>
  );
}
