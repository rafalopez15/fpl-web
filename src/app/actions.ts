"use server";

import { redirect } from "next/navigation";
import { openLeagueTarget } from "@/lib/league-id";

export type OpenLeagueState = { error?: string; input?: string };

export async function openLeague(
  _previous: OpenLeagueState,
  formData: FormData,
): Promise<OpenLeagueState> {
  const input = String(formData.get("league") ?? "");
  const target = openLeagueTarget(input);
  if ("error" in target) return { error: target.error, input };
  redirect(target.href);
}
