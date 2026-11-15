# FPL Social web

The web app for FPL Social: mini-league pages you can share with your league's group chat. Built with Next.js (App Router) and TypeScript, hosted on Vercel. It reads its data from [fplAPI](https://github.com/rafalopez15/fplAPI).

- Production: https://fpl-web-kappa.vercel.app
- PR previews: `https://fpl-web-git-<branch>-fpl-social.vercel.app`, linked from each PR

## Setup

You need Node 26 (the version in `package.json`'s `engines`). With Homebrew: `brew install node`.

```bash
npm ci        # installs exactly what package-lock.json lists
npm run dev   # http://localhost:3000
```

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

Gitleaks isn't covered: bump `GITLEAKS_VERSION` and `GITLEAKS_SHA256` in `.github/workflows/gitleaks.yml` together, from the release's checksums file.
