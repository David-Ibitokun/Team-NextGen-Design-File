# Screen — Map & Discovery (`/` and `/map`)

The primary application surface. Users spend the majority of their time here.

**Components:** `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/MapPage.jsx`
**Related:** `frontend/src/components/map/HazardMap.jsx`, `HazardMarker.jsx`

> **Note:** `/` renders `LandingPage` in the current router. The map application shell
> exists in two near-identical forms — `HomePage` (`/`) and `MapPage` (`/map`) — sharing
> the same layout, components, and behaviour. `MapPage` adds URL-synced filters and an
> auth check.

---

## Layout

Fixed full viewport, no page scroll:

```
h-screen w-screen flex flex-col overflow-hidden
├── AppHeader (h-16, sticky)
├── DemoDataBanner (conditional)
├── main (flex-1 flex overflow-hidden relative)
│   ├── aside — Sidebar (w-full md:w-[380px] lg:w-[420px])
│   │   ├── HazardFilters
│   │   └── Scrollable list
│   └── section — Map (flex-1 h-full relative)
│       ├── HazardMap
│       └── HazardDetailsPanel (conditional overlay)
└── MobileBottomNavigation (sm:hidden)
```

| Surface | Background |
|---|---|
| Page | `#F7F9FA` / dark `#0B161E` |
| Sidebar | white / dark `#142533` |
| Sidebar border | `border-r border-[#DCE4E8] dark:border-slate-800` |
| Text | `#142B3B` / `slate-100` |

## Sidebar

| Property | Value |
|---|---|
| Width | `w-full md:w-[380px] lg:w-[420px]` |
| Layout | `h-full flex flex-col` |
| Z-index | `z-10` |
| Border | `border-r border-[#DCE4E8] dark:border-slate-800` |

### HazardFilters header

`bg-white dark:bg-[#142533] border-b border-[#DCE4E8] dark:border-slate-800 p-3 space-y-2.5`

**Row 1 — category chips** (`flex gap-1.5 overflow-x-auto pb-1 scrollbar-none`)

Horizontal scroll, not wrap, so the filter row height stays constant regardless of
category count. Chips: "All categories (N)" followed by the five category labels. Tapping
an active chip clears that filter.

**Row 2 — status bar** (`flex items-center justify-between text-xs`)

Left: a teal `Filter` icon, the label "Status:", and the status `<select>`.
Right: a `Layers` icon with "Community reports".

### List area

`flex-1 overflow-y-auto p-3 space-y-2.5 pb-20 md:pb-4`

`pb-20` on mobile reserves space for the fixed bottom navigation; `md:pb-4` restores
normal padding on desktop where the bar is hidden.

### List states

| State | Component | Notes |
|---|---|---|
| Loading | `LoadingState message="Fetching road hazards..."` | Three skeleton cards |
| Error | `ErrorState message={error} onRetry={fetchHazards}` | Retry re-runs the fetch |
| Empty | `EmptyState` with a "Report a hazard" action | Opens the report modal |
| Populated | `HazardCard` per hazard | Selecting one opens the detail panel and flies the map |

## Map area

`flex-1 h-full relative`

Renders `HazardMap` full-bleed, plus a layer switcher (top-right) and, when a hazard is
selected, the details slide-over.

### HazardDetailsPanel overlay

| Property | Value |
|---|---|
| Position | `absolute top-0 right-0 bottom-0` |
| Width | `w-full sm:w-[380px] md:w-[400px]` |
| Z-index | `z-1000` |
| Shadow | `shadow-xl` |
| Animation | `animate-in slide-in-from-right duration-200` |

Desktop slide-over from the right; full-width panel on mobile.

**Panel contents:** sticky header (category + status + demo badges, title, close button),
scrollable body (photo, description, confirmation count and action, flag form with a
reason selector, coordinates, formatted timestamp).

**Confirmation action** posts to the confirm endpoint. On success the count updates in
place, `confirmed` locks the button, and the status flips to "Community Confirmed" once
the platform threshold is reached.

**Flag form** requires a reason (`cleared` default) before submission; the flag reason
options cover cleared, inaccurate, duplicate, and abuse.

**Errors** distinguish auth failures ("Please sign in to confirm this road hazard.") from
server errors from the generic "Could not submit confirmation. Please try again."

## Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| `< md` | Map **or** list, never both. Toggled by `MobileBottomNavigation` (`mobileTab` state: `"map"` \| `"list"`). |
| `≥ md` | Sidebar `380px` + map side by side. Bottom nav hidden. |
| `≥ lg` | Sidebar widens to `420px`. |

Implementation: the sidebar receives `mobileTab === "map" ? "hidden md:flex" : "flex"` and
the map section receives `mobileTab === "list" ? "hidden md:block" : "block"`.

Selecting a hazard from the list sets `mobileTab` back to `"map"` on mobile, so tapping a
report always reveals it on the map.

## URL state (`MapPage` only)

`MapPage` synchronises filters with query parameters via `useSearchParams`, so a filtered
view is shareable and survives a refresh.

| Parameter | Values | Initial read |
|---|---|---|
| `category` | `flooding`, `pothole`, `blocked_road`, `fallen_tree`, `other` | `searchParams.get("category") \|\| ""` |
| `status` | `reported`, `under_review`, `community_confirmed`, `resolved` | `searchParams.get("status") \|\| ""` |

Changing a filter rebuilds the `URLSearchParams` — setting the key for a value, deleting
it when cleared — and triggers a refetch via the `useCallback` dependency on
`selectedCategory` and `selectedStatus`.

Entry points that use this:

- Landing category tiles → `/map?category={id}`
- Landing live-stream "Inspect" → `/map?lat={lat}&lng={lng}`
- Header "Explore Map" → `/map`
- Auth-gated report → `/login?next=/report`

## Data fetching

| Aspect | Behaviour |
|---|---|
| Service | `hazardService.getHazards(params)` |
| Params | `category` and `status` when set |
| Response handling | Accepts `{results: [...]}` or a bare array |
| Preserve selection | If the selected hazard is still in the new result set, it is replaced with fresh data rather than cleared |
| Refresh triggers | Mount, and any change to `selectedCategory` / `selectedStatus` |
| Error message | "We could not load road hazards. Check your connection or try again." |

The bounds callback (`onBoundsChange`) is wired through `MapEventsHandler`, emitting
`min_lat` / `max_lat` / `min_lng` / `max_lng` on `moveend` for viewport-based filtering.

## Report modal integration

The map screen hosts the report flow as a modal rather than a navigation, so the user
keeps their map position and filter context.

```jsx
<ReportHazardModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  onSuccess={handleReportCreated}
/>
```

On success the new hazard is **prepended** to the list and immediately selected — the
user sees their own contribution appear on the map without a page change.

## Auth behaviour

- Signed out: the sidebar and map are fully browsable; the report CTA routes to
  `/login?next=/report`; confirm and flag actions show a sign-in prompt.
- Signed in: the header gains a report handler, and confirm/flag actions execute against
  the API.
