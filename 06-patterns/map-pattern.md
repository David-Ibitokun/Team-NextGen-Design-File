# Pattern — Map

How the map behaves across its four appearances: the standalone map screen, the location
picker, the landing hero preview, and the map embedded in dashboards.

---

## Four map contexts

| Context | Purpose | Container | Component |
|---|---|---|---|
| **Map screen** | Browse and inspect hazards | `flex-1 h-full` | `HazardMap` |
| **Report form picker** | Choose one coordinate | `h-44 sm:h-52` | `LocationPickerMap` |
| **Landing hero preview** | Show a live product | `h-[360px] sm:h-[440px]` | `HazardMap` in a device frame |
| **Dashboard** | Locate a user's reports | Card-sized | `HazardMap` or a map link |

Only `LocationPickerMap` differs meaningfully; the other three share `HazardMap`.

---

## Tiles

### Providers

| id | Label | URL template | Attribution |
|---|---|---|---|
| `osm` | OpenStreetMap | `https://tile.openstreetmap.de/{z}/{x}/{y}.png` | © OpenStreetMap contributors |
| `esri` | Esri Streets | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}` | Tiles © Esri — DeLorme, NAVTEQ |

Both `maxZoom: 19`. Attribution is rendered through Leaflet's built-in control and must
remain visible — it is a licence requirement of both providers.

### Why two providers

Shipping two demonstrates the tile abstraction and gives a fallback when one is slow.
OSM is the default because it matches the community/civic positioning, and its tile policy
permits the attribution shown in the site footer.

### Remount keying

```jsx
<TileLayer key={`${activeLayer}-${isDark ? "dark" : "light"}`} ... />
```

Keying on **both** layer and theme forces a remount when either changes, which is what
makes the dark-mode filter apply cleanly. Without the `isDark` component, switching theme
would leave light tiles behind the filter until a manual refresh.

### Dark mode without an API key

Rather than depending on a commercial dark tile provider, light tiles are recoloured:

```css
.dark .leaflet-tile-pane {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25);
}
```

The tile filter is **not sufficient on its own** — Leaflet's own controls, popups, and
attribution bar are separate DOM and would stay bright. All are explicitly restyled:

| Element | Dark treatment |
|---|---|
| Popup wrapper + tip | `bg: #142533`, `color: #F1F5F9`, `border: 1px #284459`, `box-shadow: 0 4px 14px rgba(0,0,0,0.5)` |
| Zoom control buttons | `bg: #142533`, `color: #F1F5F9`, `border-bottom: 1px #284459` |
| Zoom control hover | `bg: #1B3142`, `color: #0AA3B3` |
| Attribution bar | `bg: rgba(14,27,36,0.85)`, `color: #94A3B8` |
| Attribution link | `color: #0AA3B3` |

---

## Markers

### Construction

Circular `L.divIcon` markers with the **first letter of the category label**, coloured by
category.

| Property | Default | Selected |
|---|---|---|
| Size | 32 × 32 | 38 × 38 |
| Background | Category `markerColor` | Category `markerColor` |
| Border | `3px solid #FFFFFF` | `3px solid #142B3B` |
| Radius | `50%` | `50%` |
| Letter | `12px`, `font-weight: 700`, white | `14px`, white |
| Shadow | `0 4px 10px rgba(0,0,0,0.3)` | same |
| Hover | `transform: scale(1.1)` over `150ms` | — |
| `iconAnchor` | `[size/2, size/2]` | same |
| `popupAnchor` | `[0, -(size/2)]` | same |

### Why a letter, not an icon

A dense urban map can carry 30+ hazards. Thirty distinct icons would be visual noise and
unreadable at small sizes. A single letter plus a category colour gives:

- Instant recognition at any zoom
- One legible shape rather than 30
- A text label, so the category is readable without perceiving hue
- Better performance than inlining 30 SVGs per marker

### Icon caching

```js
const iconCache = {};
const cacheKey = `${category}-${isSelected}-${isDemo}`;
```

Module-level memoisation means `divIcon` objects are built once rather than on every
render of every marker. On a map with hundreds of hazards this is the difference between
smooth and janky panning.

### Demo marker indicator

A 10px amber dot (`#F2B544`, `1.5px solid #fff`) at `bottom:-3px right:-3px` with
`title="Demo report"`, so seeded data is distinguishable at the map level — not only in
the sidebar list.

---

## Popups

Deliberately thin. The popup offers a summary and one route deeper.

| Element | Specification |
|---|---|
| Container | `p-1 max-w-xs text-xs font-sans` |
| Title | `font-bold text-[#142B3B] mb-1` — `location_label` or "Hazard Location" |
| Description | `text-[#667784] mb-2 line-clamp-2` |
| Action | Full-width teal button — "View details" |

Full detail lives in the slide-over panel, which has room for photo, confirmation and flag
actions, coordinates, and timestamps. Keeping the popup thin prevents it from covering
neighbouring hazards on a dense map.

---

## Lifecycle helpers

### MapResizeHandler

```js
map.invalidateSize();          // on mount
setTimeout(() => map.invalidateSize(), 250);  // after layout settles
window.addEventListener("resize", onResize);  // on resize
```

The **delayed second call** is the important part. Leaflet measures its container during
mount, which inside a flex layout or a modal often yields a wrong size — producing grey
tile gaps until a manual resize. 250ms is enough for the layout to settle without being
perceptible as a delay.

`LocationPickerMap` uses 200ms for the same reason.

### MapEventsHandler

Listens to `moveend` and emits viewport bounds:

```js
{ min_lat, max_lat, min_lng, max_lng }
```

This enables server-side `bbox` filtering so only hazards in view are requested. `moveend`
(not `move`) is used deliberately — querying during a pan would flood the API.

### FlyToSelectedHazard

```js
map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1 });
```

- Zoom **14** is street level — the level at which a road hazard is identifiable.
- `Math.max` never zooms *out*, so selecting a distant hazard doesn't shrink the map, but
  doesn't redundantly zoom in when already close.
- `duration: 1` is a 1-second flight, long enough to follow, short enough not to wait.

Selecting a card and watching the map fly to the marker makes list and map feel like one
surface rather than two panes.

---

## The location picker

A deliberately different map from `HazardMap`, because its job is different.

| Property | `HazardMap` | `LocationPickerMap` |
|---|---|---|
| Purpose | Browse and inspect | Choose one coordinate |
| Markers | One per report | Single teardrop pin |
| Interaction | Click marker → detail panel | Click anywhere → place pin |
| Scroll wheel | **Enabled** | **Disabled** |
| Zoom | 12, up to 19 | 13 fixed |
| Layer switcher | Yes | No |
| Coordinate readout | No | Yes, pinned to bottom frame |
| Geolocation | No | Yes |

### Why scroll wheel is disabled

Non-negotiable. The picker sits inside a scrollable form. With wheel zoom enabled, any
attempt to scroll past the map zooms it instead — a user cannot complete the form.

### The picker pin

```
background: #087F8C
border: 3px solid #FFFFFF
border-radius: 50% 50% 50% 0     ← teardrop
transform: rotate(-45deg)
inner dot: 10px white circle, rotate(45deg)
size: 32 × 32, iconAnchor [16, 32]   ← anchored at the tip
```

A **teardrop** rather than a circle, deliberately distinct from the circular hazard markers,
so a user cannot mistake their own draft pin for a reported hazard. The rotated inner dot
counteracts the pin's own rotation, keeping it visually upright.

### Coordinate readout

An overlay pinned inside the map frame:

```
absolute bottom-2 left-2 right-2
bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs
p-1.5 rounded text-[11px] shadow-xs
```

Shows a teal `MapPin` icon and coordinates in `font-mono` to **6 decimal places** —
roughly 10cm precision, which is what a user needs to trust that the pin is on the right
road segment. Before a pin is placed, the bar reads "No location selected yet. Tap the
map."

### Geolocation

```js
navigator.geolocation.getCurrentPosition(success, error, {
  timeout: 10000,
  enableHighAccuracy: true
});
```

| State | Behaviour |
|---|---|
| Supported and granted | Centres and places the pin |
| Locating | Link reads "Locating...", disabled, `Navigation` icon |
| Unsupported | Amber notice — "Geolocation is not supported by your browser. Please tap the map to place the pin." |
| Denied / timeout | Amber notice — "We couldn't get your location. Move the map pin or enter the location manually." |

Failure **never blocks** the flow. Manual placement is always available, which is the
correct behaviour when a permission prompt is declined.

---

## Map overlays and z-index

| Layer | z-index |
|---|---|
| `.leaflet-container` | 1 |
| Layer switcher pill | 1000 |
| Coordinate readout | 1000 |
| Floating hazard card (hero) | 1000 |
| Hazard details slide-over | 1000 |
| Report modal | 2000 |

Map UI sits above tiles; the modal sits above all map UI.

---

## The landing hero preview

The map is embedded in a device-like frame to show a live, populated product rather than
an abstract description.

| Element | Specification |
|---|---|
| Panel | `rounded-2xl overflow-hidden border shadow-2xl` |
| Header bar | `bg-[#142B3B] dark:bg-[#0B161E] px-4 py-3 text-xs border-b border-slate-700/80` |
| Live dot | `w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping` |
| Header label | `font-semibold text-slate-200` — "Live Community Map Preview" |
| Demo chip | `bg-amber-500/20 text-amber-300 border-amber-500/40` — "Demo data" |
| Map | `h-[360px] sm:h-[440px] w-full relative` |
| Entrance | `RevealOnScroll direction="scale" delay={200} duration={800}` |

### Empty state overlay

When the API returns nothing, a `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs` layer
covers the map with a `MapPin` icon, a heading, supporting copy, and a "Submit a report"
button. An empty map in the hero would undercut the entire pitch — the overlay turns the
absence into an invitation.

### Floating hazard card

The first hazard is rendered as a floating card over the map:

| Property | Value |
|---|---|
| Position | `absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs` |
| Surface | `bg-white dark:bg-[#142533] rounded-xl p-3.5 shadow-xl border` |
| Animation | `fade-in slide-in-from-bottom-2 duration-200` |

Contents: badge row (category + freshness), `text-xs font-bold line-clamp-1` title,
`text-[11px] line-clamp-2` description, and a hairline footer with confirmation count and
an "Open on map" link.

This card communicates the data model and the visual language before a user signs in.

### Failure behaviour

The hero catches fetch errors and falls back to an empty array **without showing an error
state**. A prospective visitor should not be met with an error banner before they have
even decided whether to use the product — the empty-state overlay invites a report
instead.

---

## Global defaults

| Setting | Value |
|---|---|
| Default centre | Lagos `6.5244, 3.3792` |
| Default zoom | 12 |
| Max zoom | 19 |
| Picker default centre | `6.5244, 3.3792` at zoom 13 |
| Form initial coordinates | `6.4531, 3.3958` |

Defaulting to Lagos reflects the pilot deployment region. Since the architecture is
coordinate-based rather than city-bounded, changing the default is a one-line change and
the app works in any city.

---

## Common mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Scroll wheel zoom enabled in the picker | Users cannot scroll the form | `scrollWheelZoom={false}` |
| Missing `invalidateSize` after mount | Grey tile gaps in modals and flex layouts | Call on mount + delayed + on resize |
| Keying `TileLayer` only on layer | Dark mode leaves light tiles behind the filter | Key on layer **and** `isDark` |
| Recreating markers every render | Janky panning on dense maps | Memoise `divIcon` by cache key |
| Styling only the tile pane in dark mode | Bright Leaflet controls on a dark map | Restyle popups, controls, attribution |
| Removing attribution | Violates OSM and Esri tile policies | Keep it visible; restyle, don't remove |
| Using icon shapes instead of letters | Visual noise and poor legibility on dense maps | Category initial in a circle |
| Auto-zooming out on select | Loses the user's place | `Math.max(getZoom(), 14)` |
