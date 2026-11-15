import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Stops `next dev` writing AGENTS.md; CLAUDE.md points at the bundled docs instead.
  agentRules: false,
};

export default nextConfig;
