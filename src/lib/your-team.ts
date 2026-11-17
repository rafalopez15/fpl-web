import type { NextConfig } from "next";

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

// Which team is yours, remembered by the browser. The link flow sets it; a cookie so
// the server can redirect before rendering anything.
export const TEAM_COOKIE = "team";

// Next anchors this as ^…$, so only a whole number of digits counts.
export const TEAM_ID_PATTERN = "(?<team>\\d+)";

// `/` opens your team, or the link flow at /teams when none is saved.
export const homeRedirects: Redirect[] = [
  {
    source: "/",
    has: [{ type: "cookie", key: TEAM_COOKIE, value: TEAM_ID_PATTERN }],
    destination: "/teams/:team",
    permanent: false,
  },
  { source: "/", destination: "/teams", permanent: false },
];
