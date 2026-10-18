# Design Tokens — Colour

The RouteX colour system is defined in `frontend/src/index.css` using the Tailwind CSS v4
`@theme` block. Tokens are referenced in markup either as arbitrary values
(`bg-[#087F8C]`) or via their theme names.

## Brand tokens (light mode)

| Token | Hex | Role | Notes |
|---|---|---|---|
| `--color-routex-navy` | `#142B3B` | Primary ink / header / dark surfaces | Deep slate navy. Primary text colour on light backgrounds. |
| `--color-routex-teal` | `#087F8C` | Primary action / brand accent | Primary buttons, active states, links, focus rings, marker fills. |
| `--color-routex-offwhite` | `#F7F9FA` | App background | Light mode page canvas. Cool off-white, not pure white. |
| `--color-routex-white` | `#FFFFFF` | Card surface | Card and panel background in light mode. |
| `--color-routex-amber` | `#F2B544` | Warning / freshness | Used for stale-data messaging and demo-data markers. |
| `--color-routex-red` | `#D64545` | Danger / rejected | Errors, rejected reports, destructive actions. |
| `--color-routex-green` | `#27865B` | Success / resolved | Resolved statuses and successful confirmations. |
| `--color-routex-slate` | `#667784` | Secondary text / muted | Supporting copy, captions, inactive nav. |
| `--color-routex-border` | `#DCE4E8` | Hairline border | Light mode dividers and card borders. |

## Dark mode tokens

| Token | Hex | Role |
|---|---|---|
| `--color-dark-bg` | `#0B161E` | Page background in dark mode |
| `--color-dark-card` | `#142533` | Card / panel surface in dark mode |
| `--color-dark-surface` | `#1B3142` | Raised control surface (inputs, chips, hover) |
| `--color-dark-border` | `#284459` | Hairline border in dark mode |
| `--color-dark-text` | `#F1F5F9` | Primary text in dark mode |
| `--color-dark-muted` | `#94A3B8` | Secondary text in dark mode |

## Extended accents used in components

These are Tailwind palette values rather than custom tokens, but they are used
consistently for role identity and must be documented so they are not duplicated
inconsistently.

| Value | Role |
|---|---|
| `#0AA3B3` | Teal hover state for primary actions |
| `#855B09` | Amber-900 — readable amber text on light amber fills |
| Teal (`teal-300`/`teal-400`) | Dark-mode accent text where `#087F8C` fails contrast |
| Indigo (`indigo-300`/`indigo-400`) | Administrator identity in navigation and role badges |
| Amber (`amber-300`/`amber-400`) | Moderator identity in navigation and role badges |
| Emerald | Success confirmations in dark mode |

## Hazard category colour mapping

Category colours are defined per category in `frontend/src/utils/hazardConstants.js`.
Each category has a **marker colour** (used on the map) and a **badge pair** (used in lists).

| Category id | Label | Marker colour | Badge background | Badge text |
|---|---|---|---|---|
| `flooding` | Flooding | `#087F8C` | `bg-blue-100` | `text-blue-800` |
| `pothole` | Pothole | `#F2B544` | `bg-amber-100` | `text-amber-800` |
| `blocked_road` | Blocked road | `#D64545` | `bg-red-100` | `text-red-800` |
| `fallen_tree` | Fallen tree | `#27865B` | `bg-emerald-100` | `text-emerald-800` |
| `other` | Other hazard | `#667784` | `bg-slate-100` | `text-slate-800` |

Fallback for unknown category ids: slate badge and `#667784` marker.

## Report status colour mapping

Status badge styling is produced by `getStatusBadgeStyle()`.

| Status | Background | Text | Border |
|---|---|---|---|
| `community_confirmed` | `#087F8C` @ 15% | `#087F8C` | `#087F8C` @ 30% |
| `under_review` | `#F2B544` @ 20% | `#855B09` | `#F2B544` @ 40% |
| `resolved` | `#27865B` @ 15% | `#27865B` | `#27865B` @ 30% |
| `rejected` | `#D64545` @ 15% | `#D64545` | `#D64545` @ 30% |
| `reported` (default) | `#667784` @ 15% | `#142B3B` | `#667784` @ 30% |

## Contrast notes

- `#142B3B` on `#F7F9FA` is the default body pairing and passes WCAG AA for normal text.
- `#087F8C` on white is used for large and semibold text and for button fills with white
  text. In dark mode the accent is lightened to `teal-300`/`teal-400` because `#087F8C`
  on `#0B161E` does not reach AA for body text.
- Amber text on light amber fills always uses `#855B09` rather than the raw `#F2B544`
  to reach AA.
- Never place `#F2B544` directly on white as text; it is a fill/border colour only.

## Selection colour

Text selection uses `selection:bg-[#087F8C] selection:text-white`.

## Map tile treatment in dark mode

OpenStreetMap tiles are recoloured with a CSS filter rather than loading a separate
dark tile set, so no third-party dark tile API key is required:

```css
.dark .leaflet-tile-pane {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25);
}
```

All Leaflet controls, popups, and attribution bars are explicitly restyled for dark mode
rather than relying on the tile filter.
