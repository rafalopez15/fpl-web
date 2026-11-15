---
paths:
  - ".github/**"
  - ".gitleaks.toml"
  - ".gitleaksignore"
  - "vercel.json"
---

# Workflows and hosting

## Checks

- `ci.yml`: Lint, Format, Type check, Tests and Build, then one PR comment found by the `<!-- ci-report -->` marker. Only the comment job has `pull-requests: write`. Each check job uploads a `ci-summary-*` artifact; the scripts in `.github/scripts/` write them.
- **The ruleset requires each job by its `name:`** (Lint, Format, Type check, Tests, Build, Gitleaks, Smoke test). Renaming a job blocks every PR until the ruleset is updated.
- `smoke-test.yml` runs on Vercel's `vercel.deployment.success` dispatch and posts a **Smoke test** status. It runs from `main`'s copy only, so changes to it take effect after merge. It needs `repository_dispatch` events on in Vercel's Git settings, and fails if Vercel Authentication is turned on for previews.
- Node comes from `engines.node` in `package.json` (`node-version-file`), the same pin Vercel uses. Don't add a second one.
- Find an issue by exact title from `gh issue list` without `--search`: the search index can miss a new issue.

## Secrets

- No workflow needs a secret yet. One that only `main` should read goes in a GitHub Environment that allows `main` only, used by a job with `if: github.ref == 'refs/heads/main'`.
- Put secrets on the step that uses them, never the job's `env`, so `npm ci` never sees them.
- Dependabot's runs get no secrets and a read-only token, so jobs that need them skip `dependabot[bot]`.

## Actions and gitleaks

- **Pin actions by full commit hash** with the release as a comment (`@<hash> # v7.0.1`), never a tag. Dependabot updates them.
- `gitleaks.yml` scans full history. Its binary is pinned by `GITLEAKS_VERSION` and `GITLEAKS_SHA256`, bumped together by hand.
- **On a finding, rotate the secret first**: the repo is public. On a PR branch, rewrite the branch to drop the commit. Once on `main`, add the fingerprint (`<commit>:<file>:<rule>:<line>`, from the job log) to `.gitleaksignore` after rotating.
- A false positive gets the narrowest allowlist in `.gitleaks.toml` (path plus value regex) or its fingerprint. Never turn a rule off.

## Hosting

- Vercel Hobby, framework preset **Next.js**. "Other" fails the build looking for a `public/` folder.
- Previews are public (Vercel Authentication off) so link-preview crawlers and the smoke test can reach them. Revisit when sign-in arrives.
- No Vercel-specific code: the app must still run with `next start`.
