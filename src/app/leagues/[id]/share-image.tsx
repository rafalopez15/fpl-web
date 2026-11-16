import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getActivity } from "@/lib/activity";
import { resolveLeaguePage } from "@/lib/league-page";
import { gameweekTotals, type GameweekTotals } from "@/lib/moves";
import { shareNameSize } from "@/lib/share";
import { theme } from "@/lib/theme";

export const shareImageSize = { width: 1200, height: 630 };

// Geist, as next/og uses, in both weights the design needs. Given only bold, every
// line would be bold.
const fonts = Promise.all(
  ["Regular", "Bold"].map((weight) =>
    readFile(join(process.cwd(), `assets/fonts/Geist-${weight}.ttf`)),
  ),
);

// The preview image for /leagues/[id] and /leagues/[id]/gameweeks/[event].
export async function shareImage(rawId: string, rawEvent?: string) {
  const { league, event } = await resolveLeaguePage(rawId, rawEvent);
  const result = event === null ? null : await getActivity(league.id, event);
  // Tiles only count teams that are done; with none done there's nothing to show.
  const totals =
    result?.kind === "ok" && result.activity.teams.length > 0
      ? gameweekTotals(result.activity.teams)
      : null;
  const nameSize = shareNameSize(league.name);
  const [regular, bold] = await fonts;

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
          {event === null ? "Mini-league" : "What everyone did this gameweek"}
        </span>
      </div>

      {totals ? <Tiles totals={totals} /> : <div style={{ display: "flex" }} />}
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

function Tiles({ totals }: { totals: GameweekTotals }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Tile value={String(totals.transfers)} label="transfers" />
      <Tile
        value={totals.hits > 0 ? `−${totals.hits}` : "0"}
        label="in hits"
        color={totals.hits > 0 ? theme.danger : theme.text}
      />
      <Tile
        value={String(totals.chips)}
        label="chips played"
        color={theme.accent}
      />
    </div>
  );
}

function Tile({
  value,
  label,
  color = theme.text,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div
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
      <span style={{ fontSize: 52, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 26, color: theme.secondaryText }}>{label}</span>
    </div>
  );
}
