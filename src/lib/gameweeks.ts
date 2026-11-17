import { cache } from "react";
import { fplapi } from "@/lib/fplapi/client";

// Every gameweek's id and deadline, fetched once per request.
const getGameweeks = cache(async () => {
  const { data, response } = await fplapi().GET("/api/events");
  if (!data)
    throw new Error(`fplAPI returned ${response.status} for gameweeks`);
  return data;
});

// The latest gameweek past its deadline (FPL's current one), or null before the season.
export async function getLatestGameweek(): Promise<number | null> {
  return (await getGameweeks()).find((e) => e.is_current)?.id ?? null;
}

// A gameweek's deadline as FPL sends it (ISO 8601, UTC), or null if it has none.
export async function getDeadline(event: number): Promise<string | null> {
  const gameweek = (await getGameweeks()).find((e) => e.id === event);
  return gameweek?.deadline_time ?? null;
}

// e.g. "Deadline Sat 21 Nov, 11:00", in UK time like FPL itself. The server can't
// know each visitor's time zone, so it shows FPL's.
export function formatDeadline(iso: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  // British English writes September as "Sept"; the bar uses three letters throughout.
  const month = parts.month.slice(0, 3);
  return `Deadline ${parts.weekday} ${parts.day} ${month}, ${parts.hour}:${parts.minute}`;
}

// A gameweek from a URL segment, or null when it can't be one.
export function parseGameweek(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const event = Number(raw);
  return event >= 1 && event <= 38 ? event : null;
}

// A league's page for one gameweek. /leagues/{id} itself shows the latest.
export function gameweekPath(leagueId: number, event: number): string {
  return `/leagues/${leagueId}/gameweeks/${event}`;
}
