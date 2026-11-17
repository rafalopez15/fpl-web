import { MessageState } from "@/components/states";
import { PAGES, pageMetadata } from "@/lib/pages";
import { COMING_SOON } from "@/lib/states";

export const metadata = pageMetadata("account");

// For signed-in people. A placeholder for now.
export default function Page() {
  return <MessageState title={PAGES.account.title} message={COMING_SOON} />;
}
