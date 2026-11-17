import { describe, expect, it } from "vitest";
import { parseTeamId, yourTeamPath } from "@/lib/teams";

describe("parseTeamId", () => {
  it.each([
    ["123456", 123456],
    ["abc", null],
    ["0", null],
    ["99999999999", null],
    [undefined, null],
  ])("reads %j as %s", (raw, id) => {
    expect(parseTeamId(raw)).toBe(id);
  });
});

describe("yourTeamPath", () => {
  it("opens the saved team, or the link flow", () => {
    expect(yourTeamPath("123456")).toBe("/teams/123456");
    expect(yourTeamPath(undefined)).toBe("/teams");
    expect(yourTeamPath("12abc")).toBe("/teams");
  });
});
