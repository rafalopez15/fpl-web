import { vi } from "vitest";

// Answers every fetch with one JSON response, and returns the mock to inspect calls.
export function respond(status: number, body: unknown) {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
