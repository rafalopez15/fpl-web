import { ImageResponse } from "next/og";
import { findLeague } from "@/lib/fplapi";

export const alt = "League standings on FPL Social";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const league = await findLeague((await params).id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b1530",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 36, color: "#00e08a" }}>FPL Social</div>
        <div style={{ fontSize: 88, lineHeight: 1.1 }}>{league.name}</div>
        <div style={{ fontSize: 36, color: "#aab4cc" }}>League standings</div>
      </div>
    ),
    size,
  );
}
