# Components — Buttons & Controls

## Primary button (filled teal)

The single highest-emphasis action on a surface.

| Property | Value |
|---|---|
| Background | `#087F8C` → hover `#0AA3B3` |
| Text | white, `font-semibold`, `text-xs`–`text-sm` |
| Radius | `rounded-lg` (`rounded-md` in dense header contexts) |
| Padding | `px-6 py-3.5` on landing, `px-5 py-2` in forms, `px-3 sm:px-3.5 py-1.5 sm:py-2` in header |
| Shadow | `shadow-sm` → hover `shadow-md` |
| Press | `active:scale-[0.99]` |
| Focus | `focus:outline-none focus:ring-2 focus:ring-teal-400` |
| Disabled | `disabled:opacity-50` |

Used by: "Explore the map", "Report a hazard", "Submit report", "Report a Hazard"
(header), "Try again" actions, install CTA.

## Secondary button (outline)

Equal visual weight, lower emphasis — used for "Cancel", "Launch in Browser".

| Property | Value |
|---|---|
| Background | white → hover `bg-slate-50`; dark `#142533` → hover `#142533`/`slate-800` |
| Border | `border-slate-300` / `dark:border-slate-700` |
| Text | `#142B3B` / `slate-100` |
| Focus ring | `focus:ring-slate-400` |

## Inverted button (on navy)

For calls to action placed on the navy hero/CTA sections.

| Property | Value |
|---|---|
| Background | white → hover `bg-slate-100` |
| Text | `#142B3B`, `font-semibold` |
| Accent | Leading icon in teal `#087F8C` |
| Shadow | `shadow-md` → hover `shadow-lg` |
| Press | `active:scale-[0.99]` |

## Destructive / sign-out

| Context | Text colour | Usage |
|---|---|---|
| Inline (user dropdown) | `text-red-600 dark:text-red-400`, top hairline border | "Sign Out" |
| Mobile drawer | `text-red-400` | "Sign Out" |

## Icon buttons

| Property | Value |
|---|---|
| Size | `p-1.5` with `w-4 h-4` or `w-5 h-5` icon |
| Radius | `rounded-md` |
| Text | `#667784` → hover `#142B3B` / white |
| Hover bg | `hover:bg-slate-100 dark:hover:bg-slate-800` |

Used by: theme toggle, close panels, remove photo, mobile menu toggle. Each requires an
`aria-label` (e.g. "Switch to dark mode", "Close details", "Remove photo").

## Filter chips (category)

Horizontally scrollable pills above the hazard list.

| State | Background | Text |
|---|---|---|
| Active | `#087F8C` | white |
| Inactive | `#F7F9FA` / dark `#1B3142` | `#667784` / `slate-300` |
| Inactive hover | `hover:bg-slate-200 dark:hover:bg-slate-700` | — |

Size `text-xs font-medium px-3 py-1.5 rounded-full`. Tapping an active chip clears the
filter (toggle behaviour). The first chip is "All categories (N)" and shows the live
result count.

## Status select

A compact `<select>` in the secondary filter bar.

| Property | Value |
|---|---|
| Size | `text-xs px-2 py-1 rounded` |
| Background | `#F7F9FA` / dark `#1B3142` |
| Border | `#DCE4E8` / dark `slate-700` |
| Focus | `focus:outline-none focus:border-[#087F8C]` |

## Theme toggle

Icon-only, top-right of header. Sun icon (`#F2B544`) when dark mode is active (tap to go
light); Moon icon (`slate-200`) in light mode. Toggling persists to `localStorage` key
`routex-theme` and adds/removes the `.dark` class on `<html>`.

## Map layer switcher

Floating pill, top-right of map (`absolute top-3 right-3`).

| Property | Value |
|---|---|
| Container | `bg-white/90 dark:bg-[#142533]/90 backdrop-blur-md rounded-lg p-1 border shadow-md` |
| Options | "OSM" and "Esri Streets", `px-2.5 py-1 rounded-md text-xs font-medium` |
| Active option | `bg-[#087F8C] text-white shadow-xs` |
| Inactive option | `text-slate-600 dark:text-slate-300`, hover to full contrast |

## Bottom navigation (mobile)

Three-item fixed bar (`sm:hidden`, `fixed bottom-0`).

| Item | Icon | Label | Active colour |
|---|---|---|---|
| 1 | `Map` | Map | `#087F8C` / dark `teal-400` |
| 2 (centre, raised) | `PlusCircle` in `w-8 h-8` circle | Report | `#087F8C`, offset `-mt-5` |
| 3 | `List` | List | `#087F8C` / dark `teal-400` |

Inactive items are `#667784` / dark `slate-400`. The centre action is a floating circle
(`bg-[#087F8C] text-white`, `rounded-full`, `border`, `shadow-md`) that breaks the bar
line to signal the primary action.

## Tab bar (dashboards)

Shared by Citizen, Moderator, and Admin dashboards.

| Property | Value |
|---|---|
| Container | Full-width row, hairline bottom border |
| Tab label | `text-xs font-semibold` |
| Active | Teal `#087F8C` + `border-b-2 border-[#087F8C]` |
| Inactive | `#667784`, hover to navy |
| Icon | `w-3.5 h-3.5` to the left of the label |

Tab sets: Citizen `reports / impact / settings`; Moderator `queue / history`;
Admin `users / settings / audit`.

## Form inputs

| Property | Value |
|---|---|
| Size | `text-xs p-2.5` (report form), `text-xs p-3` (auth forms) |
| Background | `#F7F9FA` / dark `#1B3142` |
| Border | `#DCE4E8` / dark `slate-700` |
| Radius | `rounded-lg` |
| Focus | `focus:border-[#087F8C] focus:bg-white` / dark `focus:bg-[#152735]` |
| Label | `text-xs font-semibold` above the control |

Required fields are marked with a red `*` (`text-[#D64545]`). Optional fields carry a
muted "(optional)" suffix in `font-normal text-[#667784]`.

## Search input (admin)

Used with a `Search` icon for user lookup. Same surface as form inputs, with a search
icon prefix and a clear (`X`) action.
