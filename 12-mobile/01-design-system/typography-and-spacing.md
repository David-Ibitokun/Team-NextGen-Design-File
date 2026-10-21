# Mobile Design System — Typography, Spacing, Motion

## Typography

React Native uses the platform system font by default — **San Francisco** on iOS,
**Roboto** on Android. No font is bundled, so there is no webfont download and no
flash-of-unstyled-text.

The web app uses the Tailwind `font-sans` stack, which resolves to the same two system
faces. Typography is therefore consistent across platforms by construction.

### Type scale in use

| Size | Weight | Role |
|---|---|---|
| `32` | `800` | "R" monogram on the loading screen |
| `28` | — | Avatar icon in the dashboard profile card |
| `22` | `700` | Loading screen title |
| `18` | `700` / `800` | Screen titles, card titles, error/config titles |
| `16` | `800` | Empty-state title, error screen title |
| `15` | `700` | Error retry button label |
| `14` | `600` / `700` | Body emphasis, buttons, section headings |
| `13` | `500` / `600` / `700` | Body copy, card titles, location text, status labels |
| `12` | `600` / `700` / `800` | Metadata, chips, status badges, category labels |
| `11` | `500` / `600` / `700` | Tab labels, timestamps, coordinates |
| `10` | `700` | FAB label, monospace comments |
| `9` | `700` | Status badge text (letter-spaced) |

### Weights

| Weight | Use |
|---|---|
| `400` | Unselected status filter text |
| `500` | Body copy, secondary labels |
| `600` | Button labels, chips, metadata |
| `700` | Card titles, nav labels, headings, FAB label |
| `800` | Screen titles, brand wordmark, monogram |

### Letter spacing

| Element | Value |
|---|---|
| Brand wordmark | `-0.3` |
| Status badge text | `0.4` |
| Tagline | default |

### Line heights

| Element | Line height |
|---|---|
| Card description | `18` (12px text) |
| Error/config body | `18` (13px text) |
| Code snippet | `18` (12px text) |
| Modal description | `18` |

Line height is set explicitly wherever text wraps to two or more lines, because React
Native's default line height is tighter than the browser's.

### Monospace

`fontFamily: 'monospace'` is used for coordinates, code snippets, and inline code in
diagnostic screens — matching the web's use of `font-mono` for machine-readable values.

### Typography inconsistency

The web uses a 4px-aligned scale (`text-xs` = 12px, `text-sm` = 14px). The mobile app uses
an arbitrary set of 32 / 28 / 22 / 18 / 16 / 15 / 14 / 13 / 12 / 11 / 10 / 9. The 15px and
13px steps in particular are web-only sizes that do not align to a 4px grid.

> **Recommendation:** adopt the web's 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 scale in the
> mobile app so the two platforms share one type ramp.

---

## Spacing

React Native has no CSS, so spacing is explicit `StyleSheet` values.

| Context | Value |
|---|---|
| Screen horizontal padding | `16` |
| Card padding | `14` |
| Card margin-bottom | `12` |
| Card radius | `12` |
| Card gap | `12` (map cards), `10` (list content) |
| Section padding | `10` vertical (filters), `14`–`20` (screen) |
| Icon → label gap | `4`–`10` |
| Chip padding | `14` horizontal, `6` vertical (category) |
| Status chip padding | `10` horizontal, `3` vertical |
| List content padding | `16` all round, `24` bottom |

### The 4px grid

Most values land on the 4px grid (16, 12, 10, 8, 4, 14, 20, 24, 28). The exceptions are
`15` (chip vertical padding) and `13`/`11`/`9` (type sizes), which are type-driven.

---

## Elevation

React Native uses `elevation` (Android) plus the `shadow*` properties (iOS). Every
elevated surface specifies **both**, because each platform reads only its own.

| Level | `elevation` | shadow offset | opacity | radius | Used for |
|---|---|---|---|---|---|
| 0 | — | — | — | — | Flat surfaces, hairline borders only |
| 1 | `1` | `0, 1` | `0.05` | `2` | Skeleton cards |
| 2 | `2` | `0, 1` | `0.1` | `3` | Hazard cards, map top bar |
| 3 | `3` | `0, 4` | `0.08` | `12` | System screens (loading, error, config) |
| 4 | `4` | `0, 2` | `0.15` | `3` | App header, map controls |
| 5 | `4` | `0, 2` | `0.1` | `4` | Bottom navigation |
| 6 | `6` | `0, 3` | `0.25` | `5` | Report FAB |
| 8 | `8` | `0, -2` | `0.1` | `4` | Bottom navigation (combined) |

The shadow colour is always `#000` except on system screens, which use `COLORS.navy` — a
navy-tinted shadow reads more natural than pure black on an off-white surface.

---

## Radius

| Value | Used for |
|---|---|
| `6` | Reload button, mode toggle button, code snippet block |
| `7` | Legacy "R" logo badge |
| `8` | Status badge, mode toggle, error URL box |
| `10` | Retry buttons, advisory box, code box |
| `12` | Cards, hazard row cards, zoom cluster |
| `14` | Confirm chip, legacy logo badge |
| `16` | System screen cards |
| `18` | Dashboard header button |
| `20` | Category filter pills |
| `24`–`26` | Icon circles (52px / 56px) |
| `33` | Report FAB (66px) |

---

## Motion

React Native animations use the `Animated` API with `useNativeDriver: true` where
possible, which runs on the UI thread and survives JS thread contention.

### Skeleton pulse

The only custom animation in the app:

```ts
const pulse = Animated.loop(
  Animated.sequence([
    Animated.timing(pulseAnim, { toValue: 0.85, duration: 850, useNativeDriver: true }),
    Animated.timing(pulseAnim, { toValue: 0.30, duration: 850, useNativeDriver: true }),
  ])
);
```

| Property | Value |
|---|---|
| Opacity range | `0.30` → `0.85` |
| Duration each way | `850ms` |
| Total cycle | `1700ms` |
| Driver | Native |

The loop is started in `useEffect` and **stopped in the cleanup function** — without that,
an unmounted screen keeps animating and leaks.

The web uses a CSS `animate-pulse` at roughly the same rhythm.

### Press feedback

There is no scale-on-press animation. Instead, every `TouchableOpacity` uses
`activeOpacity`:

| Value | Usage |
|---|---|
| `0.7` | Tabs, chips, filter pills, small icon buttons |
| `0.8` | Cards, primary buttons, map controls |
| `0.85` | Report FAB |

This is idiomatic React Native and performs better than a scale animation on low-end
Android devices.

### System-driven motion

| Motion | Source |
|---|---|
| Screen transitions | Platform default (no navigation library configured) |
| Pull-to-refresh | `RefreshControl` spinner, tinted with `theme.teal` |
| Activity indicator | `ActivityIndicator` in `theme.teal` |
| WebView map load | Leaflet's own fade animation (`fadeAnimation: true`) |

### Map fly-to

`fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })` animates the Leaflet camera to fit
all hazards. The 50px padding keeps markers clear of the screen edges, and the `maxZoom: 14`
prevents an over-zoom when all hazards are in a small area.

The web uses `map.flyTo(coords, Math.max(getZoom(), 14), { duration: 1 })` — the same
level-14 rule, expressed differently.

---

## Touch targets

| Control | Size |
|---|---|
| Map recenter button | `44 × 44` |
| Map zoom buttons | `44 × 40` |
| Report FAB | `66 × 66` |
| Bottom nav items | `flex: 1` with `paddingVertical: 6` |
| Header icon buttons | `36 × 36` |
| Header dashboard button | `paddingVertical: 7` |
| Category pill | `paddingVertical: 6` |
| Status pill | `paddingVertical: 3` |
| Card (whole row) | Full width, `padding: 14` |
| Confirm chip | `paddingVertical: 4` |

> **Note:** the header icon buttons at `36 × 36` fall below the 44 × 44 recommendation. The
> map controls and the FAB meet it. Enlarging the header buttons would be a small change.

---

## Keyboard and input

| Concern | Handling |
|---|---|
| Input height | `padding: 12`–`14` on `TextInput` |
| Focus | `TextInput` uses the platform default focus ring |
| Keyboard avoiding | `KeyboardAvoidingView` is not used — the report modal uses a `ScrollView` |
| Hardware keyboard | Android receives input normally through `TextInput` |

> **Gap:** the report modal does not use `KeyboardAvoidingView`, so on a small phone the
> keyboard can cover the description field. `react-native-safe-area-context` is installed
> and would also help with the bottom inset.
