# Mobile Screens — README

Every native screen in the RouteX mobile app.

## Screen inventory

| Screen | Component | Route | States |
|---|---|---|---|
| App shell | `App.tsx` | — | Root orchestrator |
| App header | `AppHeaderNative` | — | Always visible |
| Bottom navigation | `MobileBottomNavNative` | — | Always visible |
| Hazard list | `HazardFiltersNative` + `HazardCardNative` | `list` tab | Loading · Populated · Empty · Refreshing |
| Native map | `NativeMapScreen` | `map` tab | Loading · Map · Cards · Error |
| Report modal | `ReportModalNative` | modal | Form · Submitting · Success · Error |
| Dashboard | `DashboardScreenNative` | `dashboard` tab | 4 role tabs |
| Loading | `LoadingScreen` | — | Branded connection |
| Error | `ErrorScreen` | — | Recoverable failure |
| Config missing | `ConfigMissingScreen` | — | Setup guidance |

---

## App shell structure

```
SafeAreaView (edges: top, left, right)
├── StatusBar                        (barStyle: light-content, bg: theme.headerBg)
├── AppHeaderNative                  (brand · dashboard · theme · refresh)
├── View (flex: 1)                   ← active screen
│   ├── 'map'       → NativeMapScreen
│   ├── 'dashboard' → DashboardScreenNative
│   └── 'list'      → HazardFiltersNative + FlatList<HazardCardNative>
├── MobileBottomNavNative            (List │ Report FAB │ Map)
└── ReportModalNative                (Modal, transparent)
```

### Tabs

```ts
export type ActiveTab = 'list' | 'map' | 'report' | 'dashboard';
```

`report` is a **pseudo-tab**: selecting it opens the modal rather than switching the
content view. The default tab is `list`, not `map` — the app opens on data the user can
act on, not on a map that may be empty.

### Data loading

```ts
const loadData = useCallback(async () => {
  try {
    const items = await fetchHazards({ category: selectedCategory, status: selectedStatus });
    setHazards(items);
  } catch {
    // Handled in service fallback
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [selectedCategory, selectedStatus]);
```

Loading and refreshing are **separate flags**, so a pull-to-refresh does not flash the
skeletons over existing content.

### Hardware back button

A graduated dismissal hierarchy, registered via `BackHandler`:

```
Back pressed
├── Report modal open?  → close the modal, return true
├── Tab ≠ 'list'?       → switch to list, return true
└── At the root         → Alert.alert('Exit RouteX', …) → BackHandler.exitApp()
```

Returning `true` from the handler **consumes** the event, so the OS never closes the app
by accident. The final confirmation dialog is the only path to exit.

### Safe areas

```tsx
<SafeAreaView edges={['top', 'left', 'right']} style={[styles.root, { backgroundColor: theme.background }]}>
```

The **bottom edge is excluded** because the bottom navigation bar occupies that space —
including it would add an unwanted inset above the nav bar.

---

## Screen specifications

| Document | Covers |
|---|---|
| [`app-header.md`](app-header.md) | Brand lockup, dashboard button, theme toggle, refresh |
| [`hazard-list.md`](hazard-list.md) | Filter bar, hazard card, skeleton, empty state, pull-to-refresh |
| [`native-map.md`](native-map.md) | Leaflet-in-WebView map, markers, popups, map controls, Cards fallback |
| [`report-modal.md`](report-modal.md) | Category, preset corridors, description, photo capture, submit |
| [`dashboard.md`](dashboard.md) | Profile card, role tabs, metric tiles, per-role panels |
| [`system-screens.md`](system-screens.md) | Loading, error, and configuration-missing screens |

---

## Cross-screen patterns

### The 44 × 44 rule

Every map control is exactly 44 × 44. The report FAB is 66 × 66. Bottom navigation items
flex to fill their third of the bar.

### Pull to refresh

Only the hazard list has `RefreshControl`. The refresh spinner is tinted with
`theme.teal` in both `colors` (Android) and `tintColor` (iOS).

### Empty states

Two different empty treatments exist, and the distinction is deliberate:

| Context | Icon | Copy |
|---|---|---|
| Hazard list | `ShieldCheck` at 44px in teal | "No Hazards Found" + context-aware subtitle |
| Map (cards mode) | — | The list renders inside the map screen |

The list's subtitle changes based on whether a filter is active:
- Filtered: "No reports match the selected filters."
- Unfiltered: "Great news! All monitored routes are currently clear."

The unfiltered message is **deliberately positive** — an empty hazard feed is good news,
not an error.

### Role identity

| Role | Icon | Accent |
|---|---|---|
| Citizen | `User` | Teal |
| Moderator | `ShieldCheck` | Amber |
| Administrator | `Sliders` | Indigo |

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| No navigation library | No deep linking, no screen transitions, no back-stack | Adopt Expo Router, or document the tab-state model as intentional |
| No `KeyboardAvoidingView` | The keyboard can cover the description field in the report modal | Wrap the modal body in `KeyboardAvoidingView` |
| Theme choice not persisted | Theme resets on every launch | Persist with `AsyncStorage` |
| Dashboard metrics are computed locally | "My Reports" shows all hazards, not the user's own | Wire to the authenticated user |
| No bottom safe-area inset | The FAB can sit close to the home indicator | Use `useSafeAreaInsets()` for the bottom padding |
| Map requires network | Offline shows the error state, not the last-known view | Cache the last map HTML |
| `route` tab in `ActiveTab` is never set as active | The bottom nav never shows a selected Report state | This is correct — the report is a modal, not a destination |
