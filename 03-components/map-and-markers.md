# Components — Map & Markers

The map is RouteX's primary surface. Every hazard lives on it, so map design carries more
weight than any other pattern in the system.

## HazardMap

| Property | Value |
|---|---|
| Library | Leaflet 1.9 + React Leaflet 4.2 |
| Default centre | Lagos `6.5244, 3.3792` |
| Default zoom | 12 |
| Max zoom | 19 |
| Scroll wheel zoom | enabled |
| Container | `w-full h-full`, `.leaflet-container { z-index: 1 }` |

## Tile layers

Two providers, switchable at runtime.

| id | Label | Provider | Attribution |
|---|---|---|---|
| `osm` | "OSM" (OpenStreetMap) | `tile.openstreetmap.de` | © OpenStreetMap contributors |
| `esri` | "Esri Streets" | Esri World Street Map | Tiles © Esri, DeLorme, NAVTEQ |

**Design rationale:** shipping two providers demonstrates the tile abstraction and gives
users a fallback when one is slow. OSM is the default because it aligns with the
community/civic positioning and its tile policy permits the attribution shown in the
footer.

The `TileLayer` is keyed on `` `${activeLayer}-${isDark ? "dark" : "light"}` `` so that
changing either the provider or the theme remounts the tile pane and the dark-mode filter
is applied cleanly.

### Dark mode tiles

Rather than depending on a commercial dark tile provider (and an API key), light tiles are
recoloured with a CSS filter:

```css
.dark .leaflet-tile-pane {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25);
}
```

### Dark mode control styling

Every Leaflet chrome element is explicitly restyled, because the filter above would
otherwise leave bright controls on a dark map:

| Element | Background | Text | Border |
|---|---|---|---|
| Popup wrapper + tip | `#142533` | `#F1F5F9` | `1px solid #284459` |
| Popup shadow | `0 4px 14px rgba(0,0,0,0.5)` | — | — |
| Zoom control (`leaflet-bar a`) | `#142533` | `#F1F5F9` | bottom `1px #284459` |
| Zoom control hover | `#1B3142` | `#0AA3B3` | — |
| Attribution bar | `rgba(14,27,36,0.85)` | `#94A3B8` | — |
| Attribution link | — | `#0AA3B3` | — |

## Layer switcher

Floating pill, `absolute top-3 right-3 z-1000`.

`bg-white/90 dark:bg-[#142533]/90 backdrop-blur-md rounded-lg p-1 border
border-slate-200/80 dark:border-slate-700/80 shadow-md text-xs`

| Option | Active | Inactive |
|---|---|---|
| Styling | `bg-[#087F8C] text-white shadow-xs` | `text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white` |
| Tooltip | "OpenStreetMap Standard (Free, community-powered)" | "Esri World Streets (High performance global CDN)" |

## HazardMarker

Circular markers, one per hazard, built with `L.divIcon` so the category colour and the
initial letter can be rendered as HTML.

| Property | Default | Selected |
|---|---|---|
| Size | 32 × 32 | 38 × 38 |
| Background | Category marker colour | Category marker colour |
| Border | `3px solid #FFFFFF` | `3px solid #142B3B` |
| Border radius | `50%` | `50%` |
| Text | `font-weight: 700`, `12px`, white | `14px`, white |
| Content | First letter of the category label | same |
| Shadow | `0 4px 10px rgba(0,0,0,0.3)` | same |
| Hover | `transform: scale(1.1)` over `150ms` | — |

`iconAnchor` is `[size/2, size/2]` and `popupAnchor` is `[0, -(size/2)]`, so the marker
centres on its coordinate and the popup opens above it.

**Design rationale:** using the **first letter of the category** rather than an icon keeps
markers legible at small sizes on a busy map, works at any zoom, and avoids the visual
noise of 30 distinct icons. Colour carries the category; the letter gives it a readable
label for colour-blind users.

### Marker colours

| Category | Marker colour | Letter |
|---|---|---|
| Flooding | `#087F8C` | F |
| Pothole | `#F2B544` | P |
| Blocked road | `#D64545` | B |
| Fallen tree | `#27865B` | F |
| Other | `#667784` | O |

### Demo marker indicator

Demo reports get an additional dot at `bottom:-3px right:-3px`, `10px × 10px`,
`background: #F2B544`, `1.5px solid #fff`, `border-radius: 50%`, with
`title="Demo report"`.

### Icon caching

`divIcon` objects are memoised in a module-level `iconCache` keyed by
`` `${category}-${isSelected}-${isDemo}` `` so icons are built once rather than on every
render of every marker.

## Marker popup

Triggered by a marker click; offers a quick summary and a route into the detail panel.

| Element | Specification |
|---|---|
| Container | `p-1 max-w-xs text-xs font-sans` |
| Title | `font-bold text-[#142B3B] mb-1` — `location_label` or "Hazard Location" |
| Description | `text-[#667784] mb-2 line-clamp-2` |
| Action | Full-width `bg-[#087F8C] text-white rounded font-medium text-[11px] py-1 px-2` — "View details" |

The popup is intentionally thin. Full detail lives in the slide-over panel, which has
room for photo, confirmations, flagging, and timestamps.

## LocationPickerMap

A separate, simpler map used inside the report form. See
[`forms.md`](forms.md) for the full specification.

### Key differences from HazardMap

| Property | HazardMap | LocationPickerMap |
|---|---|---|
| Purpose | Browse and inspect | Choose one coordinate |
| Interaction | Click marker to select | Click anywhere to place the pin |
| Scroll wheel | Enabled | **Disabled** (prevents hijacking form scroll) |
| Zoom | 12 (up to 19) | 13 fixed |
| Marker | Hazard markers per report | Single teardrop picker pin |
| Layer switcher | Yes | No |
| Coordinate readout | No | Yes, pinned to the bottom |

Disabling scroll-wheel zoom is essential: without it, a user scrolling a long form would
accidentally zoom the embedded map instead of moving through the page.

## Map behaviour helpers

Three internal helper components manage map lifecycle concerns.

### MapResizeHandler

Calls `map.invalidateSize()` on mount, again after a **250ms** delay, and on window
resize. The delayed second call prevents grey tile clipping that occurs when Leaflet
measures its container before layout has settled — a common issue inside flex layouts
and modals.

### MapEventsHandler

Listens for `moveend` and emits viewport bounds:

```
{ min_lat, max_lat, min_lng, max_lng }
```

This enables server-side `bbox` filtering so only hazards in view are requested.

### FlyToSelectedHazard

When a hazard is selected, the map flies to its coordinates and zooms to at least
**level 14** (street level):

```js
map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1 });
```

`Math.max` means the map never zooms *out* to show a selected hazard, but does not
needlessly zoom in when already close.

Selecting a hazard from a card therefore produces a clear, continuous movement from list
to map — the two views feel like one surface.

## Map overlays (z-index)

| Overlay | z-index |
|---|---|
| `.leaflet-container` | 1 |
| Layer switcher, coordinate readout | 1000 |
| Floating hazard card (landing preview) | 1000 |
| Hazard details slide-over | 1000 |
| Report modal | 2000 |

Map overlays sit above the tile pane; the modal sits above all map UI.

## Map in the landing hero

The hero embeds a live map as a product preview inside a framed device-style panel.

| Element | Specification |
|---|---|
| Panel | `rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl` |
| Panel header | `bg-[#142B3B] dark:bg-[#0B161E] text-white px-4 py-3 flex items-center justify-between text-xs border-b border-slate-700/80` |
| Live dot | `w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping` |
| Header label | `font-semibold text-slate-200` — "Live Community Map Preview" |
| Header chip | `text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40` — "Demo data" |
| Map height | `h-[360px] sm:h-[440px] w-full relative` |
| Entrance | `RevealOnScroll direction="scale" delay={200} duration={800}` |

### Empty state overlay

When no hazards exist, a `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs` layer covers
the map with a centred message and a "Submit a report" teal button. It fills the space
with an invitation rather than an empty frame.

### Floating hazard card

The preview shows the first hazard as a floating card over the map:

| Property | Value |
|---|---|
| Position | `absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs` |
| Surface | `bg-white dark:bg-[#142533] rounded-xl p-3.5 shadow-xl border` |
| Z-index | 1000 |
| Animation | `fade-in slide-in-from-bottom-2 duration-200` |

Contents: badge row (category + freshness), title (`text-xs font-bold line-clamp-1`),
description (`text-[11px] line-clamp-2`), and a hairline footer with the confirmation
count and an "Open on map" link whose chevron nudges on hover.

This card is what makes the hero show a *populated* product rather than an empty map —
it communicates both the data model and the visual language immediately.

## Attribution requirement

OpenStreetMap and Esri both require visible attribution. RouteX satisfies this through
Leaflet's built-in attribution control (restyled for dark mode) plus an explicit
OpenStreetMap credit link in the site footer.
