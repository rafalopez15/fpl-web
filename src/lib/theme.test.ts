import { describe, expect, it } from "vitest";
import { theme, themeVariables } from "@/lib/theme";

describe("theme", () => {
  it("matches the iOS app's main colors", () => {
    expect(theme.background).toBe("#0F0F23");
    expect(theme.surface).toBe("#1B1B30");
    expect(theme.accent).toBe("#22C55E");
  });

  it("names a CSS variable for every token", () => {
    const variables = themeVariables() as Record<string, string>;
    expect(Object.keys(variables)).toHaveLength(Object.keys(theme).length);
    expect(variables["--background"]).toBe(theme.background);
    expect(variables["--secondary-text"]).toBe(theme.secondaryText);
    expect(variables["--your-row"]).toBe(theme.yourRow);
  });
});
