import { pageMetadata } from "@/lib/pages";
import { LINK } from "@/lib/teams";
import { LinkTeamForm } from "./link-team-form";

export const metadata = pageMetadata("linkTeam");

// Where "Your team" goes before a team is linked. Linking another replaces it.
export default function Page() {
  return (
    <main className="link-team">
      <h1>{LINK.title}</h1>
      <p className="muted">{LINK.blurb}</p>
      <LinkTeamForm />
    </main>
  );
}
