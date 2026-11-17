"use client";

import { useEffect, useRef, useState } from "react";
import { shareButtonLabel, type ShareStatus } from "@/lib/share";
import { ShareIcon } from "@/components/icons";

// The system share sheet where there is one (phones), else copies the link.
export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(reset.current), []);

  function show(next: ShareStatus) {
    clearTimeout(reset.current);
    setStatus(next);
    reset.current = setTimeout(() => setStatus("idle"), 2000);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet rejects; nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      show("copied");
    } catch {
      show("failed");
    }
  }

  return (
    <button type="button" className="button share-button" onClick={share}>
      <ShareIcon />
      <span aria-live="polite">{shareButtonLabel(status)}</span>
    </button>
  );
}
