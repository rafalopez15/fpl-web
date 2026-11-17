import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getActivity } from "@/lib/activity";
import { resolveLeaguePage } from "@/lib/league-page";
import {
  shareNameSize,
  shareSubtitle,
  shareTiles,
  type ShareTile,
} from "@/lib/share";
import { theme } from "@/lib/theme";

export const shareImageSize = { width: 1200, height: 630 };

// Geist, as next/og uses, in both weights the design needs. Given only bold, every
// line would be bold. Static paths so file tracing bundles them; a failed read is
// retried on the next image rather than cached.
let fonts: Promise<Buffer[]> | null = null;

function loadFonts(): Promise<Buffer[]> {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
  ]).catch((error: unknown) => {
    fonts = null;
    throw error;
  });
  return fonts;
}

// The preview image for /leagues/[id] and /leagues/[id]/gameweeks/[event].
export async function shareImage(rawId: string, rawEvent?: string) {
  const { league, event } = await resolveLeaguePage(rawId, rawEvent);
  // The image only needs the league; if activity fails, it goes without tiles.
  const result =
    event === null
      ? null
      : await getActivity(league.id, event).catch(() => null);
  const tiles = shareTiles(result);
  const nameSize = shareNameSize(league.name);
  const [regular, bold] = await loadFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: theme.background,
        color: theme.text,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 700, color: theme.accent }}>
          FPL Social
        </span>
        {event !== null && (
          <span
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              background: theme.surface,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Gameweek {event}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span
          style={{
            fontSize: nameSize,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            // Two lines at most; the size keeps names FPL allows inside them.
            maxHeight: 2.1 * nameSize,
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {league.name}
        </span>
        <span style={{ fontSize: 44, color: theme.secondaryText }}>
          {shareSubtitle(event)}
        </span>
      </div>

      {tiles ? <Tiles tiles={tiles} /> : <div style={{ display: "flex" }} />}
    </div>,
    {
      ...shareImageSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400 },
        { name: "Geist", data: bold, weight: 700 },
      ],
    },
  );
}

const toneColor = {
  text: theme.text,
  danger: theme.danger,
  accent: theme.accent,
};

function Tiles({ tiles }: { tiles: ShareTile[] }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {tiles.map((tile) => (
        <div
          key={tile.label}
          style={{
            flex: 1,
            background: theme.surface,
            borderRadius: 22,
            padding: "22px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: toneColor[tile.tone],
            }}
          >
            {tile.value}
          </span>
          <span style={{ fontSize: 26, color: theme.secondaryText }}>
            {tile.label}
          </span>
        </div>
      ))}
    </div>
  );
}
