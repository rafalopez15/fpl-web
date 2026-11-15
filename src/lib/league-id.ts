// fplAPI answers 422 for ids Postgres can't store.
export const MAX_LEAGUE_ID = 2_147_483_647;

// A league id from a URL segment, or null when it isn't one fplAPI can look up.
export function parseLeagueId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= MAX_LEAGUE_ID ? id : null;
}
