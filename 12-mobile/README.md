# RouteX Mobile — Design Documentation

The RouteX native mobile app: an **Expo / React Native** application in TypeScript.

| | |
|---|---|
| **Product** | RouteX — Community Road Hazard Reporting |
| **Team** | NextGen |
| **Tagline** | *Know the Road Ahead.* |
| **Framework** | Expo SDK 57 · React Native 0.86.3 · React 19.2.3 · TypeScript 6 |
| **Icons** | `lucide-react-native@^1.59.0` |
| **Platforms** | Android (primary) · iOS · Web |
| **Orientation** | Portrait |
| **Bundle ID** | `org.routex.app` |

---

## Contents

| Folder | Purpose |
|---|---|
| [`01-design-system/`](01-design-system/) | Mobile design tokens — colour, typography, spacing, elevation, motion |
| [`02-screens/`](02-screens/) | Screen-by-screen specifications for every native screen |
| [`03-components/`](03-components/) | Component library reference |
| [`04-native-platform/`](04-native-platform/) | `app.json`, permissions, app icons, navigation security policy |
| [`icons/`](icons/) | 34 Lucide SVG icons + visual gallery + sprite |
| [`assets/`](assets/) | The 6 shipped PNG assets, with a brand-alignment review |

---

## Architecture

There are **two generations** of the mobile app in the repository. The documentation
reflects the code as built.

### Current — native React Native (what the code does)

```
┌─────────────────────────────────────────────────────────┐
│  Expo / React Native Shell                               │
│  ├─ SafeAreaProvider + SafeAreaView                       │
│  ├─ ThemeProvider (light / dark / system)                 │
│  ├─ AppHeaderNative — brand, theme toggle, refresh        │
│  ├─ MobileBottomNavNative — List │ Report FAB │ Map      │
│  └─ Screen router via local state (no navigation library) │
├─────────────────────────────────────────────────────────┤
│  Screens                                                 │
│  ├─ HazardFiltersNative + HazardCardNative (FlatList)    │
│  ├─ NativeMapScreen — Leaflet in a self-contained        │
│  │    WebView, with a Map ⇄ Cards toggle                 │
│  ├─ DashboardScreenNative — 4 role tabs                   │
│  └─ ReportModalNative — the contribution flow            │
└─────────────────────────────────────────────────────────┘
```

### Legacy — full WebView container (what the README describes)

`mobile/README.md` and `AGENTS.md` describe an earlier architecture where the app was a
WebView wrapper around the React web app (`RouteXHeader`, `RouteXWebView`, `RouteXWebView`
navigation policy). Those components still exist in `src/components/`, but `App.tsx` no
longer imports them — the current app renders native screens.

`NativeMapScreen` still uses a WebView, but only to host a **self-contained Leaflet map**,
not the web application.

> **This is a documentation/code mismatch worth flagging.** See
> [`04-native-platform/README.md`](04-native-platform/README.md#documentation-vs-code-drift).

---

## Design principles

The mobile app inherits all six web principles, with two adaptations for touch.

| # | Principle | Mobile adaptation |
|---|---|---|
| 1 | Safety before speed | Freshness and status always on the card; never hidden behind a tap |
| 2 | Map-first | Map and Hazards list are one tap apart via the bottom bar |
| 3 | Civic transparency | Role tabs surface every tier, including moderator and admin |
| 4 | Honest uncertainty | Stale and demo states remain visible on the native card |
| 5 | Lightweight | WebP uploads, skeleton loaders, 34-icon bundle |
| 6 | Safety pledge | No reporting-while-driving prompt is possible in a native flow, so the pledge lives on the web landing page |

### Touch-specific rules

| Rule | Implementation |
|---|---|
| Minimum 44 × 44px target | Map controls are 44 × 44; FAB is 66 × 66 |
| One-handed reach | Primary actions in the bottom third; report FAB raised and centred |
| System feedback | `activeOpacity` 0.7–0.85 on every touchable |
| Hardware back | Intercepted with a graduated dismissal hierarchy |

---

## Theme system

The mobile app has a **richer token system than the web**, with a dedicated
`ThemeColors` interface covering 25 semantic roles per theme.

| | File |
|---|---|
| Tokens | `mobile/src/theme/colors.ts` |
| Provider | `mobile/src/theme/ThemeContext.tsx` |

Unlike the web (which uses CSS variables and a `.dark` class), mobile uses a **TypeScript
object** consumed via `useTheme()`. This is the correct approach for React Native — there
is no CSS cascade to hook into.

Full specification: [`01-design-system/colour.md`](01-design-system/colour.md).

### Theme resolution

```ts
const systemScheme = useColorScheme();
const [userChoice, setUserChoice] = useState<'light' | 'dark' | null>(null);
const effectiveScheme = userChoice ?? (systemScheme === 'dark' ? 'dark' : 'light');
```

Three modes: **system** (default), **light**, **dark**. The web app only has light/dark with
a system-derived first visit — the mobile app makes "follow the system" a persistent,
resettable choice via `setScheme('auto')`.

> **Gap:** the mobile theme choice is **not persisted**. It lives in component state, so it
> resets to the system scheme on every app launch. The web app persists to `localStorage`
> under `routex-theme`.

---

## Screens

| Screen | Component | Purpose |
|---|---|---|
| App shell | `App.tsx` | Root: providers, tab state, data loading, back handling |
| Header | `AppHeaderNative` | Brand, dashboard button, theme toggle, refresh |
| Bottom nav | `MobileBottomNavNative` | List │ Report FAB │ Map |
| Hazard list | `HazardFiltersNative` + `HazardCardNative` | Filterable feed |
| Native map | `NativeMapScreen` | Leaflet map in a WebView, plus a Cards fallback |
| Report modal | `ReportModalNative` | Category, corridor, description, photo |
| Dashboard | `DashboardScreenNative` | Overview │ My Reports │ Moderator │ Admin |
| Loading | `LoadingScreen` | Branded connection state |
| Error | `ErrorScreen` | Recoverable failure with diagnostics |
| Config missing | `ConfigMissingScreen` | `EXPO_PUBLIC_WEB_URL` setup guidance |

Full specifications: [`02-screens/`](02-screens/).

---

## Icons

34 Lucide icons, extracted to SVG in [`icons/`](icons/).

| | |
|---|---|
| **Gallery** | [`icons/index.html`](icons/index.html) — open in a browser |
| **Sprite** | [`icons/sprite.svg`](icons/sprite.svg) |
| **Manifest** | [`icons/manifest.json`](icons/manifest.json) |
| **Reference** | [`icons/README.md`](icons/README.md) |

> **Version note:** the mobile app uses `lucide-react-native@^1.59.0` while the web app
> uses `lucide-react@0.469.0`. These are the same upstream Lucide artwork under different
> export names — the mobile app imports the older names (`AlertCircle`, `CheckCircle2`,
> `PlusCircle`, `Sliders`), which remain valid in v1.59.

---

## Relationship to the web app

| Aspect | Web | Mobile |
|---|---|---|
| Design tokens | CSS variables in `index.css` | TypeScript objects in `colors.ts` |
| Accent colour | `#087F8C` | `#087F8C` (light) / `#2DD4BF` (dark) |
| Hazard categories | 5 | 5 — same ids, colours, and labels |
| Statuses | 5 | 5 — same ids |
| Icon library | `lucide-react` 0.469 | `lucide-react-native` 1.59 |
| Map | Leaflet via React Leaflet | Leaflet in a raw WebView |
| Theme persistence | `localStorage` | **Not persisted** |
| Report flow | Full form with map picker | Modal with **preset corridors** |

The mobile app is a **native sibling**, not a wrapper — it has its own components, its own
map implementation, and its own category colour system (with explicit `lightBg` / `darkBg`
pairs the web derives from Tailwind at build time).
