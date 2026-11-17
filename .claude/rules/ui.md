---
paths:
  - "src/app/**"
  - "src/components/**"
  - "src/app/globals.css"
  - "e2e/**"
---

# UI

## Theme and type

- **Colors only from `src/lib/theme.ts`**: CSS uses its variables (`var(--surface)`, `var(--secondary-text)`); a shade it doesn't have is a `color-mix()` of them, never a new hex. Dark only.
- **Text on cards is `--text`, `--secondary-text`, `--accent`, `--danger` or `--warning`.** Slate greys like `#64748B` look fine but fail 4.5:1 on `--surface`.
- System font only (SF Pro on Apple, like the iOS app). The share image is the exception: `next/og` can't read CSS, so it imports `theme` and loads Geist Regular and Bold from `assets/fonts`. Pass both weights, or every line renders bold.
- Hits use a minus sign, "−4 pts" (U+2212), not a hyphen.

## Components

- **Server Components by default.** A Client Component only for real interaction (`collapse.tsx`, `share-button.tsx`), as small as possible; server-rendered markup goes into it as `children`, as the transfer list does in `Collapsible`.
- **Wording lives in `src/lib`** (`moves.ts`, `gameweeks.ts`) with tests, not in JSX: counts, labels, state text, deadlines.
- Prefer HTML over state when it does the job (`hidden`, `<details>`, `popover`).
- **Visited pages stay in the DOM, hidden** (Cache Components keeps up to three). An `id` on a page that can open for different records includes the record's id (`team-title-${team.id}`), or a hidden copy takes over `aria-labelledby` and `popoverTarget`.
- **Shared states** from `src/components/states.tsx`, not new markup: `LoadingState` (a `Suspense` fallback, never a root `loading.tsx`: bots lose their 404), `ErrorState` (in `error.tsx`), `MessageState` (not-found, placeholders, nothing to show). Their wording is in `src/lib/states.ts`, matching iOS.
- **Every page sets its title and description** with `pageMetadata` from `src/lib/pages.ts`; the root layout adds " · FPL Social".

## Layout

- Content goes in `<main>` (`--page-width`, centred). One breakpoint for desktop: `@media (min-width: 640px)`.
- The header scrolls away on phones, so a page's own sticky bar sits at `top: 0`, like the gameweek bar.

## Accessibility (FPL-145's quality bar)

- Every control is a real `<button>` or `<a>`, at least 44×44 (`.icon-button`, `.button`, `.text-button`). Icon-only controls get an `aria-label` naming what they act on ("Hide VARiables’s transfers"); toggles get `aria-expanded` and `aria-controls`.
- Icons come from `icons.tsx`, which marks them `aria-hidden`.
- Focus is the global `:focus-visible` rule (2px accent outline). Never remove it.
- Hover styles go inside `@media (hover: hover)`; nothing may depend on hover. Every transition is switched off in the `prefers-reduced-motion: reduce` block.
- No horizontal scroll at 375px: long names truncate (`.team-name`), and flex children that hold text need `min-width: 0`.
- Loading placeholders (`Loading` in `league-view.tsx`) use the same classes as the real bar and cards, so nothing jumps. Change both together.

## Checking a change

Locally first, then the Vercel preview. Push only once the local checks pass, so the preview checks the deploy rather than basic behavior.

- **Locally** (`node e2e/fplapi.ts`, then `FPLAPI_URL=http://localhost:4010 npm run dev`): the league page at 375px and 1280px, the share image with a long league name, and the cases production data rarely has: a pending league, a league over 50 teams, teams that joined later, no team done.
- **Contrast:** measure any new text and background pair; the theme's text colors pass on `--background`, `--surface` and `--raised`.
- **E2E queries skip hidden pages:** `getByRole`, or `getByText` inside `getByRole("main")`. A bare `getByText` or CSS locator also matches visited pages Next keeps hidden, and fails depending on timing.
- **Wording gets a test, not a look.** Counts, labels and state text come from `src/lib`, so a wrong string fails `npm test` before anyone opens a browser.
- **On the preview** (the PR's): only what local can't show. Fonts and assets bundled on Vercel, the share image as a link-preview bot fetches it, and real leagues at real sizes.
- **Not checked:** say in the PR's Testing section which checks ran locally, which ran on the preview, and which didn't run.
