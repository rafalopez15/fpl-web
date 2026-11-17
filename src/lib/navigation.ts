// The site navigation. `section` is the part of the site an item marks as current.
export function navItems(yourTeam: string) {
  return [
    { label: "Your team", href: yourTeam, section: "/teams" },
    { label: "Leagues", href: "/leagues", section: "/leagues" },
    { label: "Players", href: "/players", section: "/players" },
  ];
}

export const NAV_LABEL = "Main";
export const MENU_LABEL = "Menu";

export function isCurrent(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}
