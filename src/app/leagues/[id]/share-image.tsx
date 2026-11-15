import { ImageResponse } from "next/og";
import { resolveLeaguePage } from "@/lib/league-page";
import { shareNameSize } from "@/lib/share";
import { theme } from "@/lib/theme";

export const shareImageSize = { width: 1200, height: 630 };

// The preview image for /leagues/[id] and /leagues/[id]/gameweeks/[event].
export async function shareImage(rawId: string, rawEvent?: string) {
  const { league, event } = await resolveLeaguePage(rawId, rawEvent);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: theme.background,
        color: theme.text,
      }}
    >
      <div style={{ fontSize: 36, color: theme.accent }}>FPL Social</div>
      <div
        style={{
          fontSize: shareNameSize(league.name),
          lineHeight: 1.1,
          // Two lines at most; the size keeps names FPL allows inside them.
          maxHeight: 2.2 * shareNameSize(league.name),
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {league.name}
      </div>
      <div style={{ fontSize: 44, color: theme.secondaryText }}>
        {event === null ? "Mini-league" : `Gameweek ${event} moves`}
      </div>
    </div>,
    shareImageSize,
  );
}
