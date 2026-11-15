# fpl-web

FPL Social's web app: league pages people share in group chats. Next.js App Router, TypeScript, on Vercel. It reads everything from **fplAPI** (separate repo), from the server.

How-tos for people are in `README.md`; decisions and their history are in Linear (team FPL Social, project Web).

## Next.js version

**Next.js 16.4.6 with React 19.3**, pinned exactly in `package.json`. Patterns from older versions are often wrong here. Before writing Next.js code, read the guide for that API in `node_modules/next/dist/docs/` (the docs for the installed version).

- **Cache Components is on** (`cacheComponents`, `partialPrefetching` in `next.config.ts`). Exporting `revalidate`, `dynamic` or `fetchCache` from a route is an error. Cache with `"use cache"` plus `cacheLife()`, and wrap request-time work (`params`, uncached data) in `<Suspense>`.
- `params` and `searchParams` are Promises. Type pages with the generated `PageProps<"/route">` and `LayoutProps<"/route">`.
- A request-time `notFound()` streams the not-found UI with status 200 and `noindex` to browsers. Link-preview bots (WhatsApp, iMessage, X) get a real 404, since Next waits for `generateMetadata` for them.

## Commands

```bash
npm install
cp .env.example .env.local   # then set FPLAPI_URL
npm run dev                  # http://localhost:3000
npm run lint
npm run typecheck            # generates route types, then tsc
npm run build
```

## Code

- **Server Components by default.** Add `"use client"` only to a component that needs interaction, and keep it as small as possible.
- **Data loading lives in `src/lib/`**, as plain functions. Components call them; they never call `fetch` themselves.
- **Only fplAPI.** Never read Supabase or FPL directly. The base URL is `FPLAPI_URL` (server-only, no `NEXT_PUBLIC_`); keep `.env.example` in step.
- **Comments:** short. Say why, not what; no ticket numbers or history.

## Product rules

- **Team names only.** Managers' real names never appear on a page, in metadata or in a preview image.
- **Phones first.** Pages are opened from group chats: check them at phone width.

## Git and PRs

- Commit or push only when asked.
- One branch per Linear story, named with the issue id (`fpl-67-nextjs-prototype`).
- Logical commits, each leaving the app working. Short imperative subject, then a body with what and why.
- PRs merge with a merge commit, never squash or rebase.
- PR title `FPL-<n>: <what it does>`. Description: `Closes FPL-<n>.` or `Part of FPL-<n>.`, one or two sentences, `## Changes`, `## Testing` (say what wasn't checked). Plain sentences, no emoji or hype.
