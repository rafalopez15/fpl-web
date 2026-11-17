"use client"; // Error boundaries must be Client Components.

import Link from "next/link";
import { ErrorState } from "@/components/states";
import { OTHER_LEAGUE } from "@/lib/states";

// A league fplAPI doesn't know is not-found.tsx instead.
export default function LeagueError({ retry }: { retry: () => void }) {
  return (
    <ErrorState what="this league" retry={retry}>
      <Link href="/leagues">{OTHER_LEAGUE}</Link>
    </ErrorState>
  );
}
