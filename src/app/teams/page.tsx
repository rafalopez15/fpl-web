import { MessageState } from "@/components/states";
import { PAGES, pageMetadata } from "@/lib/pages";
import { COMING_SOON } from "@/lib/states";

export const metadata = pageMetadata("linkTeam");

// The link flow, a placeholder for now.
export default function Page() {
  return <MessageState title={PAGES.linkTeam.title} message={COMING_SOON} />;
}
