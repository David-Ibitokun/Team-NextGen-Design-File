# Components — README

RouteX's component library, organised by role. Every specification corresponds to a
component implemented in `frontend/src/components/`.

## Contents

| Document | Covers |
|---|---|
| [`common.md`](common.md) | `RouteXLogo`, `RevealOnScroll`, full component inventory, composition rules |
| [`buttons-and-controls.md`](buttons-and-controls.md) | Primary/secondary/inverted/destructive buttons, icon buttons, filter chips, selects, theme toggle, layer switcher, bottom nav, tab bars, inputs |
| [`badges-and-chips.md`](badges-and-chips.md) | Category, status, freshness, demo-data, and role badges; avatar; pills; confirmation count |
| [`cards-and-panels.md`](cards-and-panels.md) | Hazard card, feature/step/category cards, details panel, trust cards, advisory boxes, auth card, PWA and CTA panels |
| [`forms.md`](forms.md) | Report form, location picker, photo upload, report modal, auth forms, admin role form |
| [`navigation.md`](navigation.md) | App header, user dropdown, mobile drawer, bottom navigation, dashboard tabs, footer |
| [`map-and-markers.md`](map-and-markers.md) | Tile layers, hazard markers, popups, picker map, map helpers, landing map preview |
| [`states-and-feedback.md`](states-and-feedback.md) | Loading skeletons, error, empty, inline form errors, demo banner, success, 404 |

## Component count

19 components across 7 categories:

| Category | Count | Components |
|---|---|---|
| `common` | 2 | `RouteXLogo`, `RevealOnScroll` |
| `layout` | 2 | `AppHeader`, `MobileBottomNavigation` |
| `map` | 3 | `HazardMap`, `HazardMarker`, `LocationPickerMap` |
| `hazards` | 6 | `HazardCard`, `HazardFilters`, `HazardDetailsPanel`, `CategoryBadge`, `FreshnessBadge`, `ReportHazardModal` |
| `forms` | 1 | `ReportHazardForm` |
| `feedback` | 4 | `LoadingState`, `EmptyState`, `ErrorState`, `DemoDataBanner` |
| **Total** | **18** | |

`LoadingState` also exports `HazardCardSkeleton`, and `HazardMap` contains three internal
lifecycle helpers (`MapResizeHandler`, `MapEventsHandler`, `FlyToSelectedHazard`) plus
`LocationPickerMap` contains two (`MapClickHandler`, `PanToLocation`).

## Design principles applied

1. **Single accent colour.** Only `#087F8C` is used for interactive emphasis. Amber,
   green, and red are reserved for data meaning, never decoration.

2. **Dark mode is designed, not inverted.** Every component defines explicit dark values;
   none rely on an automatic inversion.

3. **Colour is never alone.** Selected cards get a ring as well as a border; badges carry
   text labels; markers carry a category initial.

4. **Same design in two contexts.** The report form renders identically as a page and as a
   modal via `isModal`, and the hazard list/map split exists as both `/` and `/map`. One
   specification, two entry points.

5. **Density is a mode.** Public pages use generous `py-16`/`py-24` section rhythm;
   operational surfaces (map sidebar, dashboards) compress to `p-3.5` cards and `text-xs`
   text so more information fits on screen.

6. **Honesty in the interface.** Freshness, demo data, and the limits of community
   confirmation are surfaced in the components themselves, not hidden in documentation.
