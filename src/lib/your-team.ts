import type { NextConfig } from "next";

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

// Loaded by next.config.ts, which can't resolve this module's imports: keep it to
// type imports.

// Which team is yours, remembered by the browser. The link flow sets it; a cookie so
// the server can redirect before rendering anything.
export const TEAM_COOKIE = "team";

// Next anchors this as ^…$, so only a whole number of digits counts.
export const TEAM_ID_PATTERN = "(?<team>\\d+)";

// `/` opens your team. Without one it opens the league form, the part of the site
// that works before the link flow exists.
export const homeRedirects: Redirect[] = [
  {
    source: "/",
    has: [{ type: "cookie", key: TEAM_COOKIE, value: TEAM_ID_PATTERN }],
    destination: "/teams/:team",
    permanent: false,
  },
  { source: "/", destination: "/leagues", permanent: false },
];
