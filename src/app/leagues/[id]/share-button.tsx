"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

// The system share sheet where there is one (phones), else copies the link.
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

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
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="button share-button" onClick={share}>
      <ShareIcon />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
