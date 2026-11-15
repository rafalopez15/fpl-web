import { afterEach, describe, expect, it, vi } from "vitest";
import { fplapi } from "@/lib/fplapi/client";

describe("fplapi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("calls the fplAPI in FPLAPI_URL", async () => {
    vi.stubEnv("FPLAPI_URL", "https://api.example/");
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json([]));
    vi.stubGlobal("fetch", fetch);

    await fplapi().GET("/api/events");

    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://api.example/api/events");
  });

  it("fails clearly without FPLAPI_URL", () => {
    vi.stubEnv("FPLAPI_URL", "");
    expect(() => fplapi()).toThrow("FPLAPI_URL is not set");
  });
});
