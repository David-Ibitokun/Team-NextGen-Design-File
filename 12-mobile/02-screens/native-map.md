# Mobile Screen — Native Map

**Component:** `mobile/src/components/NativeMapScreen.tsx`

An interactive Leaflet map hosted in a **self-contained WebView**, with a Cards fallback
for when the tile network is unavailable.

This is the most distinctive screen in the mobile app: it renders a complete web
application (Leaflet + injected HTML) inside a WebView, and bridges to it with
`injectJavaScript`.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ AppHeaderNative                                               │
├──────────────────────────────────────────────────────────────┤
│ [🗺 12 Monitored Hazards]        [ Map | Cards ]             │  ← top bar
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                     Leaflet map (WebView)                    │
│                                                              │
│                                              ┌─────┐        │
│                                              │ ⌖   │        │  ← controls overlay
│                                              ├─────┤        │
│                                              │  +  │        │
│                                              │ ─── │        │
│                                              │  −  │        │
│                                              └─────┘        │
├──────────────────────────────────────────────────────────────┤
│  Map          (+) Report          Hazards                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Top bar

| Property | Value |
|---|---|
| Layout | `flexDirection: 'row'`, `space-between` |
| Padding | `16` horizontal, `10` vertical |
| Background | `theme.surface` |
| Border | `borderBottomWidth: 1`, `theme.border` |
| Elevation | `2` |
| Z-index | `10` |

### Hazard count pill

| Element | Value |
|---|---|
| Icon | `Layers` at `14`, `theme.teal` |
| Text | `fontSize: 12`, `fontWeight: '700'`, `theme.textPrimary` |
| Copy | `"{count} Monitored Hazards"` |

### View mode toggle

A segmented control switching between `map` and `cards`.

| Element | Value |
|---|---|
| Container | `theme.surfaceSubtle` background, `theme.border` border, `radius 8`, `padding 2` |
| Button | `paddingHorizontal: 10`, `paddingVertical: 4`, `radius 6` |
| Icon | `MapIcon` / `List` at `14` |
| Label | `fontSize: 11`, `fontWeight: '700'` |

| State | Background | Icon & text |
|---|---|---|
| Active | `theme.teal` | white |
| Inactive | transparent | `theme.textMuted` |

### Why the toggle exists

The map needs a **network connection** for tiles. The Cards view needs only the data
already fetched. On a bad connection, the Cards view still works — the toggle is the
escape hatch, not just a convenience.

---

## The map

### Architecture

A `WebView` loads a **complete HTML document** generated at runtime by `useMemo`, with
Leaflet 1.9.4 loaded from unpkg and all styles inlined.

```jsx
<MapContainer>  // → <WebView source={{ html: leafletHtml }} />
```

| Property | Value |
|---|---|
| Leaflet version | 1.9.4 via `unpkg.com` CDN |
| Container | `#map` at `100vw × 100vh` |
| Map options | `zoomControl: false`, `attributionControl: false`, `tap: true`, `fadeAnimation: true` |
| Default centre | `6.5244, 3.3792` (Lagos) |
| Default zoom | `12` |
| Max zoom | `19` |
| Subdomains | `abcd` |

Both the zoom control and the attribution control are **disabled in Leaflet** and replaced
by native React Native controls, so they render crisply at device resolution and follow
the app's theme.

### Tile providers

| Theme | Provider | URL |
|---|---|---|
| Light | **CartoDB Voyager** | `basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png` |
| Dark | **CartoDB Dark Matter** | `a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png` |

| Property | Value |
|---|---|
| API key | `EXPO_PUBLIC_CARTO_API_KEY` or `CARTO_API_KEY`, with a hardcoded fallback |
| Attribution | `&copy; OpenStreetMap contributors &copy; CARTO` |

**Switching providers by theme** is how the mobile app gets a true dark map. The web app
instead filters light tiles with a CSS filter — a different, and arguably less refined,
approach.

> **Note:** the fallback Carto key is committed in source. Carto's public basemaps are
> usable without a key, so this is acceptable, but the key should be treated as a
> placeholder rather than a secret. The `EXPO_PUBLIC_` prefix means it would be embedded
> in the bundle regardless.

### Markers

Unlike the web (which uses a **category initial letter**), the mobile map uses a
**category SVG icon** inside the marker.

| Property | Value |
|---|---|
| Size | `36 × 36` |
| Shape | Circle, `borderRadius: 18` |
| Background | Category colour |
| Border | `3px solid #FFFFFF` |
| Icon | `18 × 18` white SVG, `stroke-width: 2.5` |
| Shadow | `0 4px 12px rgba(0,0,0,0.35)` |
| `iconAnchor` | `[18, 18]` |
| `popupAnchor` | `[0, -18]` |

| Category | Marker colour | Icon |
|---|---|---|
| `flooding` | `#087F8C` | Droplet |
| `pothole` | `#F2B544` | Concentric circles |
| `blocked_road` | `#D64545` | Warning triangle |
| `fallen_tree` | `#27865B` | Tree |
| `other` | `#667784` | Question in circle |

The marker icons are **inlined SVG paths** in the generated HTML, not Lucide components —
they must be plain SVG because they live inside a WebView string.

> **Inconsistency with the web:** the web uses a letter initial on the marker. The mobile
> app uses an icon. Icons are more scannable on a large screen but the letter approach
> scales better on a dense map. Worth deciding which is canonical.

### Popups

| Element | Specification |
|---|---|
| Wrapper | `radius 14`, `1px` border, `0 10px 25px rgba(0,0,0,0.3)` shadow, `padding 6` |
| Fill | `#FFFFFF` (light) · `#142533` (dark) |
| Text | `#142B3B` (light) · `#F1F5F9` (dark) |
| Badge | Category colour at 13% alpha, `radius 6`, `10px`, `800`, uppercase, `letterSpacing 0.5` |
| Title | `13px`, `800`, line-height `17` |
| Description | `11px`, line-height `15`, `slate-300` / `slate-600` |
| Coordinates | `10px`, monospace, `GPS: lat, lng` to 4 decimals |

### Bounds fitting

```js
if (bounds.length > 0) {
  mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
}
```

The map auto-frames all hazards on load. 50px of padding keeps markers clear of the
screen edges, and `maxZoom: 14` prevents over-zooming when all hazards are close together.

### Size invalidation

```js
setTimeout(() => mapInstance.invalidateSize(), 200);
setTimeout(() => mapInstance.invalidateSize(), 800);
```

**Two** delayed calls, at 200ms and 800ms. The WebView measures its container at a
different time than a browser does, and the second call catches late layout. This is the
same class of fix as the web app's `invalidateSize` handling, tuned for a WebView.

---

## Native ↔ WebView bridge

Three functions are exposed on `window` and called with `injectJavaScript`:

| Function | Purpose |
|---|---|
| `window.mapZoomIn()` | Zoom in one level |
| `window.mapZoomOut()` | Zoom out one level |
| `window.mapCenterBounds()` | Re-fit to all hazards, or reset to Lagos at zoom 12 |

The WebView posts messages back to React Native:

| Message | Meaning |
|---|---|
| `{ type: 'ready', count }` | Map initialised; the loading overlay is dismissed |
| `{ type: 'error', details }` | A JS error occurred; the error state is shown |

A global `window.onerror` handler forwards any uncaught error.

### Loading overlay

Shown until the `ready` message arrives:

| Element | Value |
|---|---|
| Container | `StyleSheet.absoluteFill`, `theme.background`, `zIndex: 2` |
| Indicator | `ActivityIndicator size="large"`, `theme.teal` |
| Text | `fontSize: 12`, `fontWeight: '600'`, `theme.textMuted` — "Rendering Interactive Map..." |

---

## Map controls overlay

Positioned `absolute`, `right: 16`, `bottom: 24`, `zIndex: 5`.

### Recenter button

| Property | Value |
|---|---|
| Size | `44 × 44` |
| Radius | `22` |
| Background | `theme.surface` |
| Border | `1px`, `theme.border` |
| Icon | `Locate` at `18`, `theme.teal` |
| Elevation | `4`, shadow `0, 2` at `0.15` |
| Accessibility | "Center map on hazards" |

### Zoom cluster

A single rounded container holding zoom in and zoom out, separated by a hairline.

| Property | Value |
|---|---|
| Container | `radius 12`, `1px` border, `overflow: 'hidden'`, `theme.surface` |
| Button | `44 × 40` |
| Icons | `Plus` / `Minus` at `18`, `theme.textPrimary` |
| Divider | `height 1`, `theme.borderSubtle` |
| Accessibility | "Zoom in" / "Zoom out" |

The cluster is a **single elevated surface** with two buttons, rather than two separate
floating buttons. It reads as one control and takes less screen space on a phone.

---

## Cards view

The toggle reveals a `FlatList` of hazard rows in place of the map.

| Element | Value |
|---|---|
| Container | `padding: 16`, `gap: 10` |
| Row | `flexDirection: 'row'`, `padding: 14`, `radius 12`, `1px` border, `theme.surface` |
| Dot | `10 × 10` circle, `theme.teal` |
| Title | `fontSize: 13`, `700`, `theme.textPrimary`, `numberOfLines 1` |
| Category | `fontSize: 10`, `800`, uppercase, `theme.teal` |
| Description | `fontSize: 11`, `lineHeight: 15`, `theme.textMuted`, `numberOfLines 2` |
| GPS | `fontSize: 10`, monospace, `theme.textMuted` |
| Chevron | `ChevronRight` at `16`, `theme.textMuted` |

Tapping a row **switches back to the map** and calls `onSelectHazard`.

---

## Error state

Shown when the map fails to load or the WebView errors.

| Element | Value |
|---|---|
| Icon | `AlertCircle` at `40`, `#F87171` |
| Title | `fontSize: 16`, `800` — "Map Unavailable Offline" |
| Body | `fontSize: 13`, `lineHeight: 18`, `theme.textMuted` |
| Retry | Teal button, `radius 10`, `RefreshCw` at `14` — "Retry Loading Map" |
| Fallback | Outlined button, `List` at `14` — "View Hazard Cards" |

The copy is precise about the cause: *"Map tile network connection was interrupted. You
can retry loading or browse live hazard coordinates in the Cards view."*

**Retry** increments a `key` prop on the WebView, which forces a full remount and reload
of the generated HTML.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Leaflet loaded from a CDN at runtime | No map without a network connection | Bundle Leaflet locally |
| `originWhitelist={['*']}` | Permissive; the WebView could load any origin | Restrict to the RouteX origin |
| `allowUniversalAccessFromFileURLs` | Broad file-URL access | Not needed for an in-memory HTML document |
| `mixedContentMode="always"` | Allows HTTP content in an HTTPS context | Use `"never"` in production |
| `attributionControl: false` | Leaflet's attribution is disabled | Render "© OpenStreetMap © CARTO" in the native UI — required by both providers |
| No marker selection state | The selected hazard is not highlighted | Track the selected id and restyle the marker |
| No pop-up action button | Tapping a popup shows no way onward | Add a "View details" action |
| No location / recentre-to-me | The map cannot centre on the user | Use `expo-location` and a native recentre |
| Marker icons differ from the web | The web uses letter initials | Pick one system |
| `key` remount reloads everything | Retry is heavy | Re-inject instead of remounting |
