import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/pages";
import { theme, themeVariables } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: `%s · ${SITE_NAME}`, default: SITE_NAME },
  description: "See what your mini-league did this gameweek.",
};

export const viewport: Viewport = {
  themeColor: theme.background,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={themeVariables()}>
      <body>
        {/* Room for menu items later; scrolls away under the gameweek bar. */}
        <header className="brand-row">
          <Link href="/" className="brand">
            FPL Social
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
