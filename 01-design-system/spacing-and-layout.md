# Design Tokens — Spacing, Layout, Elevation, Radius

## Spacing

A **4px base grid** is used throughout. Tailwind's default scale is used unmodified
(`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, and so on).

| Context | Padding |
|---|---|
| Page gutter (mobile) | `px-4` (16px) |
| Page gutter (≥640px) | `sm:px-6` (24px) |
| Page gutter (≥1024px) | `lg:px-8` (32px) |
| Section vertical rhythm | `py-16` (64px), `lg:py-24` (96px) on major sections |
| Card interior | `p-6` / `sm:p-7` (24–28px) |
| Compact card interior | `p-4` / `p-5` (16–20px) |
| Dense list item | `p-3.5` (14px) |
| Header height | `h-16` (64px) |
| Badge / chip | `px-2` `py-0.5`, or `px-3` `py-1.5` for filter chips |

## Container width

Primary content uses `max-w-7xl` (1280px) with `mx-auto`, matching the Tailwind
`max-w-7xl` container. Authentication and focused forms use `max-w-md` (448px).
The report form modal uses `sm:max-w-xl` (576px).

## Elevation

| Level | Class | Usage |
|---|---|---|
| Flat | `shadow-xs` | Resting cards, subtle borders |
| Raised | `shadow-sm` | Interactive cards, buttons, active cards |
| Lifted | `shadow-md` | Hover states, layer switcher pill, mobile nav |
| Overlay | `shadow-xl` | Floating hazard cards, dropdown menus, detail slide-over |
| Modal | `shadow-2xl` | Report modal, landing product preview |

Elevation is paired with a border rather than used alone, so elevation reads in both
light and dark mode.

## Border radius

| Token | Value | Usage |
|---|---|---|
| `rounded-md` | 6px | Badges, small chips, inline buttons |
| `rounded-lg` | 8px | Buttons, inputs, list cards, layer pill |
| `rounded-xl` | 12px | Feature cards, dropdown menus, modals |
| `rounded-2xl` | 16px | Primary cards, panels, floating cards, modals |
| `rounded-3xl` | 24px | Hero showcase panel, PWA install panel |
| `rounded-full` | 9999px | Pills, avatar, circular markers, icon containers |
| `rounded-t-2xl` | 16px top only | Bottom-sheet presentation on mobile |

## Layout primitives

### Landing page grid

Hero uses a 12-column grid (`lg:grid-cols-12`) with a 6/6 split between copy and
the live map preview. Supporting sections use 3–5 column grids:

- Trust strip: 3 columns
- How it works: 3 columns
- Feature showcase: 4 columns (`lg`), 2 (`md`), 1 (mobile)
- Hazard categories: 5 columns (`lg`), 3 (`sm`), 2 (mobile)
- Safety and trust: 2 columns

### Map application layout

The map screen is a **fixed full-viewport** split (`h-screen w-screen flex flex-col overflow-hidden`):

```
┌──────────────────────────────────────────┐
│ AppHeader (64px, sticky)                 │
├──────────────────────────────────────────┤
│ DemoDataBanner (conditional)             │
├────────────────┬─────────────────────────┤
│ Sidebar        │ Map                     │
│ 380px (md)     │ remaining width         │
│ 420px (lg)     │                         │
│                │ ┌──────────────────┐    │
│ - Filters      │ │ Details slide-   │    │
│ - List         │ │ over 380/400px   │    │
│                │ └──────────────────┘    │
├────────────────┴─────────────────────────┤
│ MobileBottomNavigation (mobile only)     │
└──────────────────────────────────────────┘
```

On mobile the sidebar and map are mutually exclusive views toggled by the bottom
navigation, rather than both being rendered side by side.

### Dashboard layout

Customer, moderator, and admin dashboards all use the same shell: a stat/metric strip
followed by a **tab bar**, with one tab panel visible at a time.

| Dashboard | Tabs |
|---|---|
| Citizen | `reports`, `impact`, `settings` |
| Moderator | `queue`, `history` |
| Administrator | `users`, `settings`, `audit` |

## Z-index scale

| Layer | Value |
|---|---|
| Map container | `z-1` |
| Mobile bottom nav | `z-30` |
| Sticky app header | `z-40` |
| User dropdown | `z-50` |
| Sticky form header / footer | `z-20` |
| Floating map UI, detail slide-over | `z-1000` |
| Report modal | `z-[2000]` |

Map overlays (`z-1000`) sit above map panes but below the modal (`z-[2000]`), so a
hazard detail card never covers a modal dialog.

## Safe areas

Mobile bottom navigation is `fixed bottom-0` with `py-2`; scrollable list areas reserve
bottom padding (`pb-20` on mobile, `md:pb-4` on desktop) so content is never hidden
behind it.
