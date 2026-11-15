import type { CSSProperties } from "react";

// The iOS app's Theme (fpl-social's Theme.swift), so both apps look like one product.
export const theme = {
  background: "#0F0F23",
  surface: "#1B1B30",
  raised: "#2A2A44",
  border: "#27273B",
  text: "#F8FAFC",
  secondaryText: "#94A3B8",
  accent: "#22C55E",
  onAccent: "#0F0F23",
  warning: "#FBBF24",
  danger: "#F87171",
  yourRow: "rgb(34 197 94 / 0.15)",
} as const;

// Each token as a CSS variable, e.g. secondaryText → --secondary-text.
export function themeVariables(): CSSProperties {
  return Object.fromEntries(
    Object.entries(theme).map(([token, value]) => [
      `--${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
      value,
    ]),
  );
}
