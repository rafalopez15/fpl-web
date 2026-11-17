import type { NextConfig } from "next";
import { homeRedirects } from "./src/lib/your-team";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Stops `next dev` writing AGENTS.md; CLAUDE.md points at the bundled docs instead.
  agentRules: false,
  redirects: async () => homeRedirects,
};

export default nextConfig;
