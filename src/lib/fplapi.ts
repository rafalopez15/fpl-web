import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

// Hand-written from fplAPI's /openapi.json (LeagueStandingsResponse).
export type Standing = {
  entry: number;
  entry_name: string;
  rank: number | null;
  last_rank: number | null;
  total: number | null;
  event_total: number | null;
};

export type NewEntry = {
  entry: number;
  entry_name: string;
};

export type League = {
  id: number;
  name: string;
  last_updated: string | null;
  page: number;
  has_next: boolean;
  standings: Standing[];
  new_entries: NewEntry[];
  new_entries_has_next: boolean;
};

// fplAPI answers 422 for ids Postgres can't store.
const MAX_ID = 2_147_483_647;

function baseUrl(): string {
  const url = process.env.FPLAPI_URL;
  if (!url) throw new Error("FPLAPI_URL is not set");
  return url.replace(/\/$/, "");
}

export function parseLeagueId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= MAX_ID ? id : null;
}

// Null when fplAPI has no such league. Matches fplAPI's 5-minute CDN cache.
export async function getLeague(id: number): Promise<League | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const res = await fetch(`${baseUrl()}/api/leagues/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fplAPI returned ${res.status} for league ${id}`);
  return res.json();
}

// For a route's [id] param: calls notFound() for a bad id or unknown league.
export async function findLeague(rawId: string): Promise<League> {
  const id = parseLeagueId(rawId);
  const league = id === null ? null : await getLeague(id);
  if (!league) notFound();
  return league;
}
