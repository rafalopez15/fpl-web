"use client"; // Error boundaries must be Client Components.

import { ErrorState } from "@/components/states";

export default function PageError({ retry }: { retry: () => void }) {
  return <ErrorState what="this page" retry={retry} />;
}
