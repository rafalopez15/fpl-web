import createClient from "openapi-fetch";
import type { paths } from "./schema";

// Server only: without a NEXT_PUBLIC_ prefix, FPLAPI_URL never reaches the browser.
export function fplapi() {
  const baseUrl = process.env.FPLAPI_URL;
  if (!baseUrl) throw new Error("FPLAPI_URL is not set");
  return createClient<paths>({ baseUrl: baseUrl.replace(/\/$/, "") });
}
