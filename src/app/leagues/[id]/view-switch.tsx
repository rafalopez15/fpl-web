import Link from "next/link";
import {
  leagueViews,
  type LeagueViewKey,
  VIEW_SWITCH_LABEL,
} from "@/lib/standings";

// Links styled as tabs, so each view keeps its own address.
export function ViewSwitch({
  leagueId,
  current,
}: {
  leagueId: number;
  current: LeagueViewKey;
}) {
  return (
    <nav className="view-switch" aria-label={VIEW_SWITCH_LABEL}>
      {leagueViews(leagueId).map((view) => (
        <Link
          key={view.key}
          href={view.href}
          aria-current={view.key === current ? "page" : undefined}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
