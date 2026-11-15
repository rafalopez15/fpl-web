# FPL Social web

The web app for FPL Social: mini-league pages you can share with your league's group chat. Built with Next.js (App Router) and TypeScript, hosted on Vercel. It reads its data from [fplAPI](https://github.com/rafalopez15/fplAPI).

- Production: https://fpl-web-kappa.vercel.app
- PR previews: `https://fpl-web-git-<branch>-fpl-social.vercel.app`, linked from each PR

## Setup

You need Node 26 (the version in `package.json`'s `engines`). With Homebrew: `brew install node`.

```bash
npm ci                        # installs exactly what package-lock.json lists
cp .env.example .env.local    # points the app at production fplAPI
npm run dev                   # http://localhost:3000
```

## Environments

The app calls fplAPI from its server only, at the base URL in `FPLAPI_URL` (without `/api`). The browser never calls fplAPI, so fplAPI needs no CORS setup for it.

| Where       | `FPLAPI_URL`                                       |
| ----------- | -------------------------------------------------- |
| Production  | `https://fpl-api-six.vercel.app`, a Vercel env var |
| PR previews | The same production API, Vercel's Preview env var  |
| Local       | `.env.local`, copied from `.env.example`           |

Previews are the staging environment: there's no separate one. They read real data from production fplAPI, which is safe while the app only reads public FPL data with no sign-in. Leagues opened on a preview count toward production's league tracking, which is fine at testing volume. There's no Supabase config until sign-in arrives.

### Testing against an unmerged fplAPI change

To point one web branch's previews at an fplAPI PR's preview:

1. In Vercel, open the `fpl-web` project → Settings → Environment Variables, and add `FPLAPI_URL` for the **Preview** environment, limited to your web branch. Its value is the fplAPI PR's preview URL without `/api`, e.g. `https://fpl-api-git-<branch>-fpl-social.vercel.app`.
2. Redeploy the web branch (push a commit, or Redeploy in Vercel). Other branches keep using production.
3. If the web change needs the new API fields, regenerate the client from that preview: `FPLAPI_URL=<preview url> npm run generate:api`.
4. After the fplAPI PR merges, run `npm run generate:api` again so the committed client comes from production, then delete the branch's variable in Vercel.

## fplAPI client

`src/lib/fplapi/schema.d.ts` holds TypeScript types generated from fplAPI's OpenAPI spec by [openapi-typescript](https://openapi-ts.dev/), and [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) calls the API with them. Never edit the generated file by hand:

```bash
npm run generate:api                               # from production's spec
FPLAPI_URL=<fplAPI base url> npm run generate:api  # from another fplAPI
```

A daily workflow (`api-client.yml`) regenerates it from production's spec and opens an "fplAPI client is out of date" issue, or comments on the open one, when the committed file differs. Run it by hand from the Actions tab.

## Commands

| Command                 | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                           |
| `npm run lint`          | ESLint; fails on any warning                         |
| `npm run format`        | Formats every file with Prettier                     |
| `npm run format:check`  | Checks formatting without changing files, as CI does |
| `npm run typecheck`     | Generates Next's route types, then runs `tsc`        |
| `npm test`              | Runs the Vitest tests                                |
| `npm run test:coverage` | Tests with coverage; fails under 80% on `src/lib`    |
| `npm run build`         | Production build, as Vercel runs it                  |
| `npm start`             | Serves the production build locally                  |
| `npm run generate:api`  | Regenerates the fplAPI client from production's spec |

## Checks on every PR

CI (`.github/workflows/ci.yml`) runs Lint, Format, Type check, Tests and Build, and posts one comment on the PR with the results, updated on each push. Gitleaks scans the history for secrets. After Vercel deploys the preview, the smoke test requests it and posts a **Smoke test** status. All of these are required before a PR can merge.

To run the smoke test against any URL: Actions → Smoke test → Run workflow, or locally `.github/scripts/smoke-test.sh <url>`.

## Vercel project

The project is `fpl-web` in the `fpl-social` team, on the Hobby plan. Its settings:

- **Framework preset:** Next.js. With "Other", the build fails looking for a `public/` folder.
- **Node.js version:** 26.x. `engines.node` in `package.json` overrides it anyway.
- **Deployment Protection:** Vercel Authentication off, so link-preview crawlers (WhatsApp, iMessage) and the smoke test can reach previews.
- **Git:** `repository_dispatch` events on, which start the smoke test.

Pushing to `main` deploys production; every other branch gets a preview.

## Updating dependencies

Dependabot opens PRs weekly for npm packages and GitHub Actions, a week after each release. Minor and patch updates come grouped, and each major update gets its own PR. Next.js and React are the exception: their updates, major ones included, always come together in one PR.

When Dependabot bumps `openapi-typescript`, run `npm run generate:api` on its branch and commit any change, or the daily client check will report a spec change that didn't happen.

Gitleaks isn't covered: bump `GITLEAKS_VERSION` and `GITLEAKS_SHA256` in `.github/workflows/gitleaks.yml` together, from the release's checksums file.
