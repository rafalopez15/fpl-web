// The site navigation. "Your team" goes through / so the server can send you to your
// saved team; `section` is the part of the site it marks as current.
export const NAV_ITEMS = [
  { label: "Your team", href: "/", section: "/teams" },
  { label: "Players", href: "/players", section: "/players" },
] as const;

export const NAV_LABEL = "Main";
export const MENU_LABEL = "Menu";

export function isCurrent(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}
