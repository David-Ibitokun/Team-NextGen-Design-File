# Mobile Components — Reference

RouteX's native component library, in `mobile/src/components/`.

## Inventory

| Component | Category | Purpose |
|---|---|---|
| `AppHeaderNative` | Layout | Brand lockup, dashboard, theme toggle, refresh |
| `MobileBottomNavNative` | Layout | List │ Report FAB │ Map navigation |
| `RouteXLogoMark` | Brand | The teal map-pin mark, rendered with `react-native-svg` |
| `HazardCardNative` | Hazards | A single report card |
| `HazardFiltersNative` | Hazards | Category and status filter pills |
| `HazardSkeletonNative` | Hazards | Animated loading placeholder (`HazardCardSkeletonNative`, `HazardListSkeletonNative`) |
| `NativeMapScreen` | Map | Leaflet map in a WebView, plus a Cards fallback |
| `ReportModalNative` | Forms | The full contribution flow |
| `DashboardScreenNative` | Dashboard | Four role tabs with metrics |
| `LoadingScreen` | System | Branded connection state |
| `ErrorScreen` | System | Recoverable failure with diagnostics |
| `ConfigMissingScreen` | System | `EXPO_PUBLIC_WEB_URL` setup guidance |
| `RouteXHeader` | Legacy | WebView-era app bar — **not imported by `App.tsx`** |
| `RouteXWebView` | Legacy | WebView-era container — **not imported by `App.tsx`** |

### Active vs legacy

`App.tsx` imports 10 components. `RouteXHeader` and `RouteXWebView` remain in the
repository but are **unreferenced** — they belong to the earlier WebView-wrapper
architecture described in `mobile/README.md`.

They still use the raw `COLORS` palette rather than `ThemeContext`, so they would not
respond to the theme toggle if they were reconnected.

---

## Component patterns

### Every component reads the theme

```tsx
const { isDark, theme } = useTheme();
```

Theme values are applied as **inline style objects** merged with the static
`StyleSheet`:

```tsx
style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
```

This is the React Native idiom — `StyleSheet.create` handles static layout, inline
objects handle the dynamic theme. The web app does the equivalent with Tailwind's
`dark:` variants.

### Touch feedback

Every interactive element is a `TouchableOpacity` with an explicit `activeOpacity`:

| Value | Typical use |
|---|---|
| `0.7` | Small controls, chips, tab items |
| `0.8` | Cards, primary buttons, map controls |
| `0.85` | The report FAB |

### Accessibility

| Control type | Pattern |
|---|---|
| Icon-only button | `accessibilityRole="button"` + `accessibilityLabel` |
| Tab item | `accessibilityRole="tab"` + `accessibilityLabel` |
| Progress indicator | `accessibilityRole="progressbar"` + `accessibilityLabel` |
| Dialog action | `accessibilityRole="button"` + `accessibilityLabel` |

The `accessibilityLabel` states the **action**: "Switch to dark mode", "Refresh reports",
"Center map on hazards", "Zoom in" — matching the web's convention.

### Icons

All icons come from `lucide-react-native` and take `size` and `color` props rather than
a `className`:

```tsx
<MapPin size={14} color={theme.teal} />
```

Sizes in use: `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `22`, `28`, `40`, `44`.

The colour is always an explicit token — `theme.teal`, `theme.textMuted`,
`theme.textPrimary`, `categoryConfig.color` — never `currentColor`, because React Native
has no CSS inheritance for SVG fills.

---

## Style conventions

| Convention | Rule |
|---|---|
| Static layout | `StyleSheet.create` at the bottom of the file |
| Dynamic colour | Inline object merged after the static style |
| No magic numbers in components | Repeated values become named styles |
| Shadows | Both `elevation` and `shadow*` are always specified |
| Border radius | Named in the style object, never inline |
| Gaps | `gap` is used rather than `marginRight` on the last child |

---

## Where each component is specified

| Component | Specification |
|---|---|
| `AppHeaderNative` | [`../02-screens/app-header.md`](../02-screens/app-header.md) |
| `MobileBottomNavNative` | [`../02-screens/hazard-list.md`](../02-screens/hazard-list.md) (navigation) |
| `RouteXLogoMark` | [`../04-native-platform/README.md`](../04-native-platform/README.md) |
| `HazardCardNative` | [`../02-screens/hazard-list.md`](../02-screens/hazard-list.md) |
| `HazardFiltersNative` | [`../02-screens/hazard-list.md`](../02-screens/hazard-list.md) |
| `HazardSkeletonNative` | [`../02-screens/hazard-list.md`](../02-screens/hazard-list.md) |
| `NativeMapScreen` | [`../02-screens/native-map.md`](../02-screens/native-map.md) |
| `ReportModalNative` | [`../02-screens/report-modal.md`](../02-screens/report-modal.md) |
| `DashboardScreenNative` | [`../02-screens/dashboard.md`](../02-screens/dashboard.md) |
| `LoadingScreen`, `ErrorScreen`, `ConfigMissingScreen` | [`../02-screens/system-screens.md`](../02-screens/system-screens.md) |

---

## Design patterns

### The elevated pill button

The header's icon buttons and the dashboard button share a treatment: a raised navy tile
with a hairline border, rather than a flat outline. On a dark header, an outline reads as
a label; a filled tile reads as a button.

```tsx
backgroundColor: isDark ? '#1C3144' : '#1D3B50',
borderColor: isDark ? '#2E4C66' : '#2A4E68',
```

### The raised centre FAB

The bottom navigation's report action is a `66 × 66` circle with a `4px` border, lifted
`-26px` above the bar so it breaks the line. The border colour flips with the theme
(`#FFFFFF` on light, `#142533` on dark) so the FAB always separates cleanly from the
bar behind it.

### The segmented toggle

Used by the map's Map/Cards switch. A `surfaceSubtle` container with `padding: 2` holding
two buttons; the active one fills with `theme.teal`.

### The status triple

Every status surface uses a `{ bg, text, border }` triple rather than a single colour,
so a badge has an internal structure. The border is what makes it legible on a busy card.

### The skeleton that mirrors the card

`HazardCardSkeletonNative` reproduces the real card's exact geometry — pill, badge,
circle, bars, in the same positions and sizes. The card does not move when content
arrives.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Two legacy components are unreferenced | Dead code that still ships in the bundle | Remove, or re-connect deliberately |
| Legacy components ignore `ThemeContext` | They would break in dark mode | Migrate to `useTheme()` |
| Several colours are hardcoded inline | `isDark ? '#1C3144' : '#1D3B50'` bypasses the token system | Add theme tokens for header controls |
| No shared component for the teal pill | The header button pattern is duplicated | Extract a `PillButton` |
| No shared `SectionHeader` | Section titles are styled ad hoc | Extract one |
| Category icon mapping is duplicated | `HazardCardNative` and `ReportModalNative` each define a switch | Move to `hazardTypes.ts` as a component map |
| `iconName` in `hazardTypes.ts` is unused | Stale string metadata | Use it or remove it |
| No component-level tests | Only the policy script is tested | Add render tests for the shared components |
