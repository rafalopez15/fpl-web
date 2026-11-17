"use client"; // Error boundaries must be Client Components.

import { ErrorState } from "@/components/states";

// A team FPL doesn't have is not-found.tsx instead.
export default function TeamError({ retry }: { retry: () => void }) {
  return <ErrorState what="this team" retry={retry} />;
}
