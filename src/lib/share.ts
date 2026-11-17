import type { ActivityResult } from "@/lib/activity";
import { gameweekTotals } from "@/lib/moves";

// What a shared league link says, e.g. "FPLDev · Gameweek 11 moves".
export function shareTitle(leagueName: string, event: number | null): string {
  return event === null
    ? `${leagueName} · FPL Social`
    : `${leagueName} · Gameweek ${event} moves`;
}

export function shareDescription(
  leagueName: string,
  event: number | null,
): string {
  return event === null
    ? `${leagueName}, a mini-league on FPL Social.`
    : `What each team in ${leagueName} did in Gameweek ${event}: transfers, hits, chips and captains.`;
}

// The league name's size in the 1200×630 preview, so a long name still fits in two
// lines. Counts characters, not UTF-16 units, so emoji count once.
export function shareNameSize(leagueName: string): number {
  const length = [...leagueName].length;
  if (length <= 16) return 96;
  if (length <= 24) return 80;
  if (length <= 36) return 64;
  return 52;
}

export type ShareStatus = "idle" | "copied" | "failed";

export function shareButtonLabel(status: ShareStatus): string {
  if (status === "copied") return "Link copied";
  if (status === "failed") return "Couldn't copy the link";
  return "Share";
}

export function shareSubtitle(event: number | null): string {
  return event === null ? "Mini-league" : "What everyone did this gameweek";
}

export type ShareTile = {
  value: string;
  label: string;
  tone: "text" | "danger" | "accent";
};

// The preview's tiles, or null while any team is pending: chat apps cache previews
// for a long time, so partial totals would stick around looking final.
export function shareTiles(result: ActivityResult | null): ShareTile[] | null {
  if (result?.kind !== "ok") return null;
  const { pending, teams } = result.activity;
  if (pending || teams.length === 0) return null;
  const totals = gameweekTotals(teams);
  return [
    { value: String(totals.transfers), label: "transfers", tone: "text" },
    {
      value: totals.hits > 0 ? `−${totals.hits}` : "0",
      label: "in hits",
      tone: totals.hits > 0 ? "danger" : "text",
    },
    { value: String(totals.chips), label: "chips played", tone: "accent" },
  ];
}
