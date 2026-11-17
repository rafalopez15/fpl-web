import Link from "next/link";
import { MessageState } from "@/components/states";
import { LEAGUE_NOT_FOUND, OTHER_LEAGUE } from "@/lib/states";

export default function LeagueNotFound() {
  return (
    <MessageState {...LEAGUE_NOT_FOUND}>
      <Link href="/leagues">{OTHER_LEAGUE}</Link>
    </MessageState>
  );
}
