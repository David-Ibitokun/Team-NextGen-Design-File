# Components — Badges & Chips

Badges are the primary means of communicating report meaning at a glance. Colour is
never the sole carrier — every badge includes a text label and, where useful, an icon.

## CategoryBadge

Displays the hazard type with its category icon.

| Property | Value |
|---|---|
| Layout | `inline-flex items-center gap-1.5 rounded-md` |
| Size `sm` | `text-xs px-2 py-0.5`, icon `w-3 h-3` |
| Size `lg` | `text-sm px-2.5 py-1`, icon `w-4 h-4` |
| Icon | Optional via `showIcon` (default `true`) |

### Per-category styling

| Category | Badge background | Badge text | Icon |
|---|---|---|---|
| Flooding | `bg-blue-100` | `text-blue-800` | `Droplets` |
| Pothole | `bg-amber-100` | `text-amber-800` | `CircleAlert` |
| Blocked road | `bg-red-100` | `text-red-800` | `ShieldAlert` |
| Fallen tree | `bg-emerald-100` | `text-emerald-800` | `Trees` |
| Other / unknown | `bg-slate-100` | `text-slate-800` | `AlertCircle` |

Badge colours come from the `badgeBg` / `badgeText` fields in `hazardConstants.js`, so
category colour is data-driven rather than hardcoded per call site.

## StatusBadge

A single-token pill showing the report lifecycle state. Rendered inline (not a separate
component) because the style object comes from `getStatusBadgeStyle()`.

| Property | Value |
|---|---|
| Layout | `text-[11px] font-medium px-2 py-0.5 rounded-full border` |
| Text | `hazard.status_display` (falls back to `hazard.status`) |

| Status | Style |
|---|---|
| Reported | `bg-[#667784]/15 text-[#142B3B] border-[#667784]/30` |
| Under review | `bg-[#F2B544]/20 text-[#855B09] border-[#F2B544]/40` |
| Community-confirmed | `bg-[#087F8C]/15 text-[#087F8C] border-[#087F8C]/30` |
| Resolved | `bg-[#27865B]/15 text-[#27865B] border-[#27865B]/30` |
| Rejected | `bg-[#D64545]/15 text-[#D64545] border-[#D64545]/30` |

The same status classes are reused at a larger size inside the hazard details panel
header (`text-xs px-2 py-0.5 rounded-full border`).

## FreshnessBadge

Communicates report age. This is the app's core trust mechanism.

| Property | Value |
|---|---|
| Layout | `inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full` |
| Icon | `Clock` at `w-3 h-3 shrink-0` |

### States

| State | Background | Text | Border |
|---|---|---|---|
| Fresh / recent | `bg-slate-100` | `#667784` | none |
| **Stale** | `bg-amber-100` | `#855B09` | `border-amber-200` |

### Label logic

Labels come from the API `freshness.label` when available. Otherwise they are derived
client-side from `created_at`:

| Age | Label | Stale? |
|---|---|---|
| ≤ 1 min | "Reported just now" | No |
| < 60 min | "Reported N minutes ago" | No |
| < 24 h | "Reported N hour(s) ago" | No |
| ≥ 24 h | "Reported N day(s) ago" | Yes at ≥ 2 days |

The `title` attribute reinforces this: on stale reports it reads *"This report may be out
of date. Check the latest updates."*

## DemoDataBadge

Flags seeded sample data so it is never mistaken for live information.

| Context | Classes |
|---|---|
| Card (`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded`) | `bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800` |
| Details panel (`text-[10px] uppercase font-mono px-2 py-0.5 rounded`) | Same palette |
| Landing map preview (`text-[10px] font-mono px-2 py-0.5 rounded`) | `bg-amber-500/20 text-amber-300 border-amber-500/40` |

## RoleBadge

Marks the authenticated user's permission tier. Appears in the header user control and
the dropdown menu.

| Role | Chip classes | Label (chip) | Label (dropdown) |
|---|---|---|---|
| Administrator | `bg-purple-900/60 text-purple-300 border-purple-700` | "Admin" | "Platform Administrator" |
| Moderator | `bg-amber-900/60 text-amber-300 border-amber-700` | "Mod" | "Community Moderator" |
| Citizen | `bg-teal-900/60 text-teal-300 border-teal-700` | "Citizen" | "Citizen Contributor" |

Shared classes: `text-[9px] uppercase px-1.5 py-0.2 rounded font-bold` in the header chip.

The three role colours (purple / amber / teal) are also reused for the corresponding
navigation items and icons, so a user's access level is identifiable at a glance.

## Avatar

Circular user initial.

| Property | Value |
|---|---|
| Size | `w-5 h-5 rounded-full` |
| Background | `#087F8C` |
| Text | white, `text-[10px] font-bold uppercase` |
| Content | First character of `display_name`, falling back to `username` |

## Eyebrow / Pill labels

Used for landing page section kickers and inline status chips.

| Variant | Classes |
|---|---|
| Section eyebrow | `text-xs font-bold uppercase tracking-widest text-[#087F8C] dark:text-teal-400` |
| Icon pill | `inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border` |
| Teal pill | `bg-[#087F8C]/10 dark:bg-[#087F8C]/25 text-[#087F8C] dark:text-teal-300 border-[#087F8C]/20` |
| Rose pill (emergency) | `bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40` |
| Teal-900 pill (on navy) | `bg-teal-900/60 text-teal-300 border-teal-700` |
| Amber pill (advisory) | `bg-amber-50 dark:bg-amber-950/60 text-rose-700 dark:text-rose-400 border-amber-200 dark:border-amber-900/40` |
| Live stream pill | `bg-teal-50 dark:bg-teal-950/60 text-[#087F8C] dark:text-teal-400 border-teal-200 dark:border-teal-800` |

## Confirmation count

Inline indicator of peer confirmations.

| Property | Value |
|---|---|
| Icon | `ThumbsUp` at `w-3 h-3`, colour `#087F8C` / dark `teal-400` |
| Text | `text-[11px] font-medium` |
| Copy variants | "N confirmed" (landing), bare number (card), "N confirmation(s)" (live stream) |
