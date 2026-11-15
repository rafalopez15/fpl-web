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

export type LeagueInput =
  | { kind: "league"; id: number }
  | { kind: "head-to-head" }
  | { kind: "invalid" };

// What someone types in "Your mini-league": a league number, or an FPL league link
// such as fantasy.premierleague.com/leagues/314/standings/c, with or without https://.
// Head-to-head links are told apart: fplAPI answers 404 for those leagues.
export function parseLeagueInput(input: string): LeagueInput {
  const text = input.trim();
  if (/^\d+$/.test(text)) return league(parseLeagueId(text));

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { kind: "invalid" };
  }
  if (!FPL_HOSTS.has(url.hostname)) return { kind: "invalid" };
  const match = url.pathname.match(/^\/leagues\/(\d+)(?:\/|$)/);
  if (!match) return { kind: "invalid" };
  if (/^\/leagues\/\d+\/standings\/h(?:\/|$)/.test(url.pathname)) {
    return { kind: "head-to-head" };
  }
  return league(parseLeagueId(match[1]));
}

function league(id: number | null): LeagueInput {
  return id === null ? { kind: "invalid" } : { kind: "league", id };
}

// Where the "Your mini-league" field goes, or the message it shows instead.
export function openLeagueTarget(
  input: string,
): { href: string } | { error: string } {
  const parsed = parseLeagueInput(input);
  if (parsed.kind === "league") return { href: `/leagues/${parsed.id}` };
  if (parsed.kind === "head-to-head") {
    return { error: "Head-to-head leagues aren't supported yet." };
  }
  return { error: "That isn't an FPL league link or number." };
}
