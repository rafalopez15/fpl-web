import { cookies } from "next/headers";
import { yourTeamPath } from "@/lib/teams";
import { TEAM_COOKIE } from "@/lib/your-team";
import { SiteNav } from "./site-nav";

// Reads the saved team on the server, so "Your team" links straight to it.
export async function HeaderNav() {
  const team = (await cookies()).get(TEAM_COOKIE)?.value;
  return <SiteNav yourTeam={yourTeamPath(team)} />;
}
