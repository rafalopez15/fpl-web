import type { Metadata } from "next";
import { MessageState } from "@/components/states";
import { PAGE_NOT_FOUND } from "@/lib/states";

export const metadata: Metadata = { title: PAGE_NOT_FOUND.title };

// Addresses that don't exist, and notFound() outside a segment with its own.
export default function NotFound() {
  return <MessageState {...PAGE_NOT_FOUND} />;
}
