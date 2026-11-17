// A stand-in fplAPI with fixed data, for end-to-end tests and checking pages locally:
// the app calls fplAPI from its server, so the browser can't mock it.
// Run with `node e2e/fplapi.ts`, then start the app with FPLAPI_URL=http://localhost:4010.
import { createServer } from "node:http";
import type { components } from "../src/lib/fplapi/schema";

type Schemas = components["schemas"];

const PORT = Number(process.env.FIXTURE_PORT ?? 4010);

const LEAGUE_ID = 5508;

const events: Schemas["EventResponse"][] = [1, 2, 3].map((id) => ({
  id,
  name: `Gameweek ${id}`,
  deadline_time: `2026-08-${15 + 7 * (id - 1)}T10:00:00Z`,
  deadline_time_epoch: 0,
  finished: id < 2,
  data_checked: id < 2,
  is_previous: id === 1,
  is_current: id === 2,
  is_next: id === 3,
}));

const elements: Schemas["ElementResponse"][] = [
  [1, "Haaland"],
  [2, "Isak"],
  [3, "Saka"],
  [4, "Palmer"],
].map(([id, web_name]) => ({
  id: id as number,
  web_name: web_name as string,
  team: 1,
  element_type: 4,
  now_cost: 100,
  status: "a",
}));

const league: Schemas["LeagueStandingsResponse"] = {
  id: LEAGUE_ID,
  name: "FPLDev",
  page: 1,
  has_next: false,
  standings: [
    {
      entry: 10,
      entry_name: "VARiables",
      rank: 1,
      total: 140,
      event_total: 70,
    },
    { entry: 20, entry_name: "Expected Toulouse", rank: 2, total: 120 },
  ],
  new_entries: [],
  new_entries_has_next: false,
};

function activity(event: number): Schemas["LeagueActivityResponse"] {
  return {
    league_id: LEAGUE_ID,
    event,
    pending: false,
    teams: [
      {
        entry: 10,
        event,
        transfers: [{ element_in: 2, element_out: 3 }],
        transfers_cost: 4,
        chip: null,
        captain: 1,
        captain_changed: false,
      },
      {
        entry: 20,
        event,
        transfers: [],
        transfers_cost: 0,
        chip: "wildcard",
        captain: 4,
        captain_changed: true,
      },
    ],
  };
}

function route(path: string, query: URLSearchParams): [number, unknown] {
  if (path === "/api/events") return [200, events];
  if (path === "/api/elements") return [200, elements];
  if (path === `/api/leagues/${LEAGUE_ID}`) return [200, league];
  if (path === `/api/leagues/${LEAGUE_ID}/activity`) {
    const event = Number(query.get("event"));
    return events.some((e) => e.id === event && e.id <= 2)
      ? [200, activity(event)]
      : [404, { detail: "Gameweek not found" }];
  }
  if (path.startsWith("/api/leagues/")) {
    return [404, { detail: "League not found" }];
  }
  return [404, { detail: "Not found" }];
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const [status, body] = route(url.pathname, url.searchParams);
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}).listen(PORT, () => {
  console.log(`Stand-in fplAPI on http://localhost:${PORT}`);
});
