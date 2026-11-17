import { MessageState } from "@/components/states";
import { TEAM_NOT_FOUND } from "@/lib/states";

export default function TeamNotFound() {
  return <MessageState {...TEAM_NOT_FOUND} />;
}
