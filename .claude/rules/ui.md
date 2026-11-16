---
paths:
  - "src/app/**"
  - "src/app/globals.css"
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
- Prefer HTML over state when it does the job (`hidden`, `<details>`).

## Accessibility (FPL-145's quality bar)

- Every control is a real `<button>` or `<a>`, at least 44×44 (`.icon-button`, `.button`, `.text-button`). Icon-only controls get an `aria-label` naming what they act on ("Hide VARiables’s transfers"); toggles get `aria-expanded` and `aria-controls`.
- Icons come from `icons.tsx`, which marks them `aria-hidden`.
- Focus is the global `:focus-visible` rule (2px accent outline). Never remove it.
- Hover styles go inside `@media (hover: hover)`; nothing may depend on hover. Every transition is switched off in the `prefers-reduced-motion: reduce` block.
- No horizontal scroll at 375px: long names truncate (`.team-name`), and flex children that hold text need `min-width: 0`.
- Loading placeholders (`Loading` in `league-view.tsx`) use the same classes as the real bar and cards, so nothing jumps. Change both together.

## Checking a change

- Check the league page at 375px and 1280px, and the share image with a long league name.
- Contrast: measure any new text and background pair; the theme's text colors pass on `--background`, `--surface` and `--raised`.
