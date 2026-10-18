# Progressive Web App

RouteX is an installable PWA designed for users on mobile data, in areas of poor
connectivity, and sometimes while travelling.

**Application files:** `frontend/public/manifest.json`, `frontend/public/sw.js`,
`frontend/src/main.jsx`

---

## Why a PWA

| Reason | Consequence in the design |
|---|---|
| Road users are often on mobile data | Photos compressed to WebP client-side before upload |
| Users may be in low-connectivity areas | Offline shell caching; the app opens without a network |
| Checking road conditions is a repeated daily action | Installable to the home screen; launches like a native app |
| Installation should not require an app store | Zero download, zero store approval, instant updates |
| Night driving is a real use case | Full dark mode as a first-class theme |

---

## Manifest

```json
{
  "short_name": "RouteX",
  "name": "RouteX — Community Road Awareness",
  "description": "Know the road ahead with real-time community-reported road hazards, potholes, flooding, and commute updates.",
  "id": "/",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#142B3B",
  "theme_color": "#087F8C",
  "lang": "en",
  "scope": "/",
  "categories": ["navigation", "travel", "utilities"],
  "icons": [...],
  "shortcuts": [...]
}
```

### Manifest fields

| Field | Value | Reason |
|---|---|---|
| `display` | `standalone` | Launches without browser chrome — feels native |
| `orientation` | `portrait-primary` | Map browsing is a portrait activity; avoids odd landscape map layouts |
| `background_color` | `#142B3B` | Brand navy splash screen, matching the header |
| `theme_color` | `#087F8C` | Brand teal status bar |
| `id` / `start_url` / `scope` | `/` | Single-origin app, stable identity |
| `categories` | navigation, travel, utilities | Correct app-store categorisation |
| `lang` | `en` | Screen readers announce the correct language |

### Icons

| Icon | Sizes | Purpose |
|---|---|---|
| `favicon.svg` | 48, 72, 96, 128 | `any` — standard launcher sizes |
| `routex-logo.svg` | 192, 512 | `any maskable` — adaptive icons with safe-zone padding |

`maskable` requires the mark to sit inside a circular safe zone so Android can crop it to
any shape without clipping the road graphic.

### App shortcuts

Three long-press shortcuts from the home-screen icon:

| Shortcut | URL | Icon |
|---|---|---|
| Explore Map | `/map` | `favicon.svg` at 96px |
| Report Hazard | `/report` | `favicon.svg` at 96px |
| Citizen Dashboard | `/dashboard` | `favicon.svg` at 96px |

The shortcuts skip the landing page and the map's discovery step, taking users straight
to the task they perform most often. All three use the same icon — a one-colour asset, since
shortcut icons cannot be recoloured per platform.

---

## Service worker

Registered in `main.jsx`, guarded so it never breaks the app:

```js
if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(/* ... */).catch(/* ... */);
  });
}
```

Registration waits for the `load` event so it never competes with first paint. The
`NODE_ENV !== "test"` guard keeps test environments clean. Failures are logged and ignored
— an unsupported or blocked service worker must never prevent the app from running.

### Cache strategy per resource type

| Resource | Strategy | Reason |
|---|---|---|
| **App shell** | **Precache** on install | Instant offline launch |
| **Navigations** | **Network-first**, cache fallback to `/index.html` | Always serves fresh content when online; still opens offline |
| **CSS / JS / images / fonts** | **Stale-while-revalidate** | Instant paint from cache, updated in the background |
| **`/api/*`** | **Never cached** | Road hazard data must be live, never stale |
| **Default** | Cache, then network | Reasonable default |

### Precache list

```js
const PRECACHE_ASSETS = [
  "/", "/index.html", "/manifest.json", "/favicon.svg", "/routex-logo.svg"
];
const CACHE_NAME = "routex-app-v1";
```

### The critical API exclusion

```js
if (url.pathname.startsWith("/api/")) {
  return;  // no respondWith — goes straight to the network
}
```

**This is the most important line in the service worker.** Serving a cached hazard list
would mean showing a user a pothole that was filled a week ago, or worse, omitting a
flood that has just been reported. API responses are never cached, so the app either shows
live data or shows an honest error state.

Caching the *shell* is safe — the UI is identical. Caching *data* is not, because the data
is time-sensitive and safety-relevant.

### Cache lifecycle

| Event | Behaviour |
|---|---|
| `install` | Open cache, `addAll(PRECACHE_ASSETS)`, then `skipWaiting()` |
| `activate` | Delete every cache whose name ≠ `CACHE_NAME`, then `clients.claim()` |
| `fetch` | Per-strategy handling above |

Versioning the cache name (`routex-app-v1`) and deleting stale caches on activate means a
deploy invalidates the old shell automatically without any user action.

### `skipWaiting` + `clients.claim`

Together these let a new service worker take control immediately rather than waiting for
every tab to close — so a deploy reaches the user on the next load instead of the next
browser restart.

---

## Install prompt

### Capture

```js
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  setInstallPrompt(e);
});
```

`preventDefault()` suppresses Chrome's automatic mini-infobar so the app can offer the
install at a moment of its choosing.

### Trigger

```js
installPrompt.prompt();
const { outcome } = await installPrompt.userChoice;
if (outcome === "accepted") setInstallPrompt(null);
```

### Three placement points

| Location | Treatment |
|---|---|
| **Header** | `Download` icon + "Install App", `bg-teal-950/60 border-teal-800 text-teal-300`, `animate-pulse` |
| **Mobile drawer** | Full-width teal-tinted button — "Install RouteX App" |
| **Landing PWA section** | Primary teal CTA — "Install RouteX App" or "Add to Home Screen" |

The header button pulses to draw attention without a modal, which respects users who do
not want to be interrupted.

### Fallback for iOS

`beforeinstallprompt` **does not fire on iOS Safari**, so `installPrompt` stays null. The
landing CTA therefore falls back to an explanatory alert:

> "To install RouteX, tap the Share or Browser menu and select 'Add to Home Screen'."

Without this, the CTA would be dead on iOS — a significant gap, since a large share of
mobile users are on iPhones.

### `appinstalled`

```js
window.addEventListener("appinstalled", () => {
  setIsInstalled(true);
  setInstallPrompt(null);
});
```

The button is hidden once the app is installed.

---

## HTML integration

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#142B3B" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="RouteX" />
<link rel="apple-touch-icon" href="/favicon.svg" />
```

| Tag | iOS purpose |
|---|---|
| `apple-mobile-web-app-capable` | Enables standalone mode |
| `apple-mobile-web-app-status-bar-style` | Black translucent status bar over the navy theme |
| `apple-mobile-web-app-title` | Home-screen label (defaults to "RouteX" from the manifest) |
| `apple-touch-icon` | Home-screen icon (avoids a screenshot) |

---

## Data-saver behaviour

| Technique | Effect |
|---|---|
| WebP compression (1600px, q0.82) | Typically 60–80% smaller than a phone JPEG |
| Savings shown to the user | "(was 1.2 MB, -80%)" — compression is understood, not hidden |
| Offline shell | The app opens and is navigable without a connection |
| Skeleton loading | No layout jump on a slow connection |
| No webfont | One fewer blocking request |
| Lucide icons | Tree-shaken; only used icons ship |

---

## Relationship to the map

| Concern | Decision |
|---|---|
| Tile caching | Handled by Leaflet/the provider, not the service worker (tiles are not `request.destination` of `image`) |
| Tile source | OpenStreetMap (default) and Esri — two providers for resilience on weak connections |
| Offline map | Not available. Tiles require a network; the shell and previously loaded UI remain usable. |

This is a deliberate limitation. Offline maps would require bundling large tile sets or
caching an unbounded number of tiles, which conflicts with the low-data goal. The honest
behaviour is that the app shell opens offline and map tiles need connectivity.

---

## Known gaps

| Gap | Impact | Recommendation |
|---|---|---|
| Static `<meta name="theme-color">` | Status bar does not follow the in-app theme | Update the meta tag when the theme toggles |
| No update prompt | Users may run an outdated shell | Add a `skipWaiting` notification so a new version can be announced |
| No offline fallback page | Offline navigation shows the cached shell only | Consider an offline route |
| No `beforeinstallprompt` on iOS | Handled with an explanatory alert | Add an iOS-specific install guide section |
| No offline map tiles | Map unusable offline | Acceptable given the data-saver goal; do not bundle tiles |
| Orientation locked to portrait | Landscape map use is constrained | Reconsider if landscape proves common |
