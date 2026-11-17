"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type LinkLookup, lookUpTeam, parseTeamId } from "@/lib/teams";
import { TEAM_COOKIE } from "@/lib/your-team";

export type LookUpTeamState = { input?: string; lookup?: LinkLookup };

// Looks up the ID for "Is this your team?". "Not my team" comes back here too, to
// start over with the same ID in the field.
export async function lookUpTeamAction(
  _previous: LookUpTeamState,
  formData: FormData,
): Promise<LookUpTeamState> {
  const input = String(formData.get("team") ?? "");
  if (formData.get("intent") === "reject") return { input };
  return { input, lookup: await lookUpTeam(input) };
}

// Browsers cap cookies at 400 days.
const MAX_AGE = 400 * 24 * 60 * 60;

// The id comes from a hidden field holding the team that was looked up or shown, not
// the editable one, so only a confirmed team is linked. One that doesn't parse
// starts the link flow over.
export async function linkTeam(formData: FormData) {
  const id = parseTeamId(String(formData.get("id") ?? ""));
  if (id === null) redirect("/teams");
  (await cookies()).set(TEAM_COOKIE, String(id), {
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect(`/teams/${id}`);
}

// Back to the link flow, as on iOS.
export async function unlinkTeam() {
  (await cookies()).delete(TEAM_COOKIE);
  redirect("/teams");
}
