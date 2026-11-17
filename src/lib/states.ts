// The shared loading, error, not-found and empty states' wording. The messages for
// FPL being unavailable and a team or league not existing match the iOS app's.

export const LOADING = "Loading…";

export const FPL_DOWN =
  "FPL is down or updating, which is common around gameweek deadlines. Try again in a few minutes.";

export const RETRY = "Try again";

export const PAGE_NOT_FOUND = {
  title: "Page not found",
  message: "There's nothing at this address.",
};

export const LEAGUE_NOT_FOUND = {
  title: "League not found",
  message: "FPL couldn't find this league.",
};

export const TEAM_NOT_FOUND = {
  title: "Team not found",
  message: "No FPL team with that ID. Check the number and try again.",
};

export const OTHER_LEAGUE = "Try another league";

export const COMING_SOON = "Coming soon.";

// The error state's heading: what couldn't be loaded.
export function errorTitle(what: string): string {
  return `Couldn't load ${what}`;
}
