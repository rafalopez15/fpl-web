"use server";

import { redirect } from "next/navigation";
import { parseLeagueInput } from "@/lib/league-id";

export type OpenLeagueState = { error?: string; input?: string };

export async function openLeague(
  _previous: OpenLeagueState,
  formData: FormData,
): Promise<OpenLeagueState> {
  const input = String(formData.get("league") ?? "");
  const id = parseLeagueInput(input);
  if (id === null) {
    return { error: "That isn't an FPL league link or number.", input };
  }
  redirect(`/leagues/${id}`);
}
