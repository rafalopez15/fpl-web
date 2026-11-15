import { cacheLife } from "next/cache";
import { fplapi } from "@/lib/fplapi/client";
import type { PlayerNames } from "@/lib/moves";

// Every player's short name by id. /api/elements is over half a megabyte and changes
// slowly, so only the names are kept, for hours.
export async function getPlayerNames(): Promise<PlayerNames> {
  "use cache";
  cacheLife("hours");

  const { data, response } = await fplapi().GET("/api/elements");
  if (!data) throw new Error(`fplAPI returned ${response.status} for players`);
  return Object.fromEntries(data.map((e) => [e.id, e.web_name]));
}
