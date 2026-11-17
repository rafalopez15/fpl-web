import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SITE_NAME } from "@/lib/pages";
import { theme, themeVariables } from "@/lib/theme";
import "./globals.css";
import { HeaderNav } from "./header-nav";
import { SiteNavFallback } from "./site-nav";

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
        {/* Scrolls away; the league page's gameweek bar sticks instead. */}
        <header className="brand-row">
          <Link href="/" className="brand">
            {SITE_NAME}
          </Link>
          <Suspense fallback={<SiteNavFallback yourTeam="/teams" />}>
            <HeaderNav />
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}
