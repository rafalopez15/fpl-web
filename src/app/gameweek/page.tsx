import { MessageState } from "@/components/states";
import { PAGES, pageMetadata } from "@/lib/pages";
import { COMING_SOON } from "@/lib/states";

export const metadata = pageMetadata("gameweek");

export default function Page() {
  return <MessageState title={PAGES.gameweek.title} message={COMING_SOON} />;
}
