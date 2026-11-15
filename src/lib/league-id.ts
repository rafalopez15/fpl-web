// fplAPI answers 422 for ids Postgres can't store.
export const MAX_LEAGUE_ID = 2_147_483_647;

// A league id from a URL segment, or null when it isn't one fplAPI can look up.
export function parseLeagueId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= MAX_LEAGUE_ID ? id : null;
}

const FPL_HOSTS = new Set([
  "fantasy.premierleague.com",
  "www.fantasy.premierleague.com",
]);

// What someone types in "Your mini-league": a league number, or an FPL league link
// such as fantasy.premierleague.com/leagues/314/standings/c, with or without https://.
export function parseLeagueInput(input: string): number | null {
  const text = input.trim();
  if (/^\d+$/.test(text)) return parseLeagueId(text);

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (!FPL_HOSTS.has(url.hostname)) return null;
  const match = url.pathname.match(/^\/leagues\/(\d+)(?:\/|$)/);
  return match ? parseLeagueId(match[1]) : null;
}
