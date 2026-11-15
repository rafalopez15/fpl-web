import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPL Social",
  description: "See what your mini-league did this gameweek.",
};

export const viewport: Viewport = {
  themeColor: "#0b1530",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
