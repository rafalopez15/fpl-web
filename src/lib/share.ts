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
