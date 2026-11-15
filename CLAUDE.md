# fpl-web

FPL Social's web app: league pages people share in group chats. Next.js App Router, TypeScript, on Vercel. It reads everything from **fplAPI** (separate repo), from the server.

Rules for one area load from `.claude/rules/` when you open its files: `claude-md.md`, `workflows.md`. How-tos for people are in `README.md`; decisions and their history are in Linear (team FPL Social, project Web).

## Working guidelines

- State assumptions, and when a request can be read more than one way, lay out the options instead of picking one silently.
- Write the smallest change that solves the problem. No speculative features or configuration nobody asked for.
- Touch only what the task needs; point out other problems instead of fixing them unasked.
- Make each task verifiable, e.g. a test that fails before the fix and passes after.

## Commands

```bash
npm ci                 # install exactly what package-lock.json lists
npm run dev            # http://localhost:3000
npm run lint           # ESLint, zero warnings allowed
npm run format         # Prettier; CI runs format:check
npm run typecheck      # generates route types, then tsc
npm test               # Vitest; test:coverage applies the 80% gate on src/lib
npm run build          # what Vercel runs; catches errors dev mode lets through
```

Run all of them before pushing: each is a required check.

## Next.js version

**Next.js 16 with React 19**, exact versions in `package.json`. Patterns from older versions are often wrong here. Before writing Next.js code, read the guide for that API in `node_modules/next/dist/docs/` (the docs for the installed version).

- **Cache Components is on** (`cacheComponents`, `partialPrefetching` in `next.config.ts`). Exporting `revalidate`, `dynamic` or `fetchCache` from a route is an error. Cache with `"use cache"` plus `cacheLife()`, and wrap request-time work (`params`, uncached data) in `<Suspense>`.
- `params` and `searchParams` are Promises. Type pages with the generated `PageProps<"/route">` and `LayoutProps<"/route">`.
- A request-time `notFound()` streams the not-found UI with status 200 and `noindex` to browsers. Link-preview bots (WhatsApp, iMessage, X) get a real 404, since Next waits for `generateMetadata` for them.

## Code

- **Server Components by default.** Add `"use client"` only to a component that needs interaction, and keep it as small as possible.
- **Data loading and formatting live in `src/lib/`**, as plain functions with Vitest tests. Components call them; they never call `fetch` themselves.
- **Tests sit next to their code** (`league-id.ts` and `league-id.test.ts`), not in a `tests/` folder like fplAPI's.
- **Only fplAPI.** Never read Supabase or FPL directly.
- **Fix ESLint warnings rather than silencing them.** No `eslint-disable` without a reason on the same line.
- **Comments:** short. Say why, not what; no ticket numbers or history.
- **Dependencies are pinned exactly** (no `^`). Dependabot updates them weekly.

## Product rules

- **Team names only.** Managers' real names never appear on a page, in metadata or in a preview image.
- **Phones first.** Pages are opened from group chats: check them at phone width.

## Git and PRs

- Commit or push only when asked.
- One branch per Linear story from an up-to-date `main`, named with the issue id (`fpl-68-repo-setup`). Never commit to a branch whose PR has merged.
- Logical commits, each leaving the app working. Short imperative subject, then a body with what and why.
- PRs merge with a merge commit, never squash or rebase.
- PR title `FPL-<n>: <what it does>`. Description: `Closes FPL-<n>.` or `Part of FPL-<n>.`, one or two sentences, `## Changes`, `## Testing` (say what wasn't checked). Plain sentences, no emoji or hype.
