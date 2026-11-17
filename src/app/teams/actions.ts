"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type LinkLookup, lookUpTeam, parseTeamId } from "@/lib/teams";
import { TEAM_COOKIE } from "@/lib/your-team";

export type LookUpTeamState = { input?: string; lookup?: LinkLookup };

// "Not my team" posts here too, to start over with the ID kept.
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

// The confirmed team's hidden id, not the editable field.
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
