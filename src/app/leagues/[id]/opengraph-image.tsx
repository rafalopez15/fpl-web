import { ImageResponse } from "next/og";
import { findLeague } from "@/lib/leagues";
import { theme } from "@/lib/theme";

export const alt = "A mini-league on FPL Social";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const league = await findLeague((await params).id);

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
      <div style={{ fontSize: 88, lineHeight: 1.1 }}>{league.name}</div>
      <div style={{ fontSize: 36, color: theme.secondaryText }}>
        Mini-league
      </div>
    </div>,
    size,
  );
}
