import type { Metadata } from "next";

// Each page's title and link-preview description. The root layout adds
// " · FPL Social" to the title.
export const PAGES = {
  linkTeam: {
    title: "Link your team",
    description: "Link your FPL team to see its squad and transfers.",
  },
  team: {
    title: "Team",
    description: "An FPL team's squad, transfers and points.",
  },
  players: {
    title: "Players",
    description: "Every FPL player's price, form and stats.",
  },
  leagues: {
    title: "Your mini-league",
    description: "See what your mini-league did this gameweek.",
  },
  standings: {
    title: "Standings",
    description: "A mini-league's standings.",
  },
  gameweek: {
    title: "Gameweek",
    description: "This gameweek's fixtures, live scores and deadline.",
  },
  notes: { title: "Notes", description: "Your notes on players and teams." },
  following: { title: "Following", description: "The teams you follow." },
  account: { title: "Account", description: "Your FPL Social account." },
} satisfies Record<string, { title: string; description: string }>;

export type PageKey = keyof typeof PAGES;

export const SITE_NAME = "FPL Social";

// A page's title and description, for browsers and for link previews.
export function pageMetadata(key: PageKey): Metadata {
  const { title, description } = PAGES[key];
  return {
    title,
    description,
    openGraph: { title, description, siteName: SITE_NAME, type: "website" },
  };
}
