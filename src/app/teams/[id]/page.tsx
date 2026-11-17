import { MessageState } from "@/components/states";
import { PAGES, pageMetadata } from "@/lib/pages";
import { COMING_SOON } from "@/lib/states";

export const metadata = pageMetadata("team");

// Any team, not only yours. A placeholder for now.
export default function Page() {
  return <MessageState title={PAGES.team.title} message={COMING_SOON} />;
}
