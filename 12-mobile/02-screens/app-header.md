# Mobile Screen — App Header

**Component:** `mobile/src/components/AppHeaderNative.tsx`

A native app bar carrying the brand lockup, a dashboard entry point, the theme toggle,
and pull-to-refresh.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [logo 34px]  RouteX            [Dashboard]  [☀/☾]  [↻]    │
│               Know the Road Ahead.                          │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Layout | `flexDirection: 'row'`, `justifyContent: 'space-between'` |
| Padding | `16` horizontal, `12` vertical |
| Background | `theme.headerBg` |
| Border | `borderBottomWidth: 1`, `theme.border` |
| Elevation | `4` with `0, 2` shadow at `0.15` opacity, radius `3` |
| Gap (brand → actions) | `10` within the brand row, `8` between actions |

The header is **not** a `SafeAreaView` — the root `SafeAreaView` with `edges: ['top','left','right']`
provides the status-bar inset, so the header sits directly beneath it.

---

## Brand lockup

### Logo mark

```tsx
<RouteXLogoMark size={34} />
```

The mark is rendered with **`react-native-svg`**, not as an image. The component
reproduces the web logo exactly:

| Element | Specification |
|---|---|
| ViewBox | `0 0 48 48` |
| Gradient id | `mobile-routex-logo-grad` (namespaced to avoid collision) |
| Gradient | `#0AA3B3` → `#087F8C`, `userSpaceOnUse`, `x1=5.5 y1=2.5 x2=42.5 y2=46.8` |
| Pin | The identical teardrop path from `RouteXLogo.jsx` |
| Road | White, `strokeWidth 5.6`, round cap |
| Lane dashes | `#087F8C`, `strokeWidth 1.2`, `strokeDasharray "2.4, 2.2"` |
| Waypoint | White `r=3.6` circle + teal `r=1.6` circle at `24.4, 11` |

**The geometry is byte-identical to the web app.** The only difference is the gradient id,
which is prefixed with `mobile-` because React Native SVG ids share a global registry
across the app.

### Wordmark

| Element | Specification |
|---|---|
| "RouteX" | `fontSize: 18`, `fontWeight: '800'`, `letterSpacing: -0.3`, `theme.headerText` |
| Tagline | `fontSize: 11`, `fontWeight: '500'`, `marginTop: -1` |
| Tagline colour | `#94A3B8` (dark) · `#B2C5D4` (light) |

The tagline colour is a **light-on-navy muted tint**, distinct from `theme.textMuted`
(which is tuned for light backgrounds and would be too dark on the navy header).

> The web app uses `#8BA2B2` for the same role in the password-reset email and
> `slate-300` in the header. Three values for one role across three surfaces — worth
> consolidating.

---

## Action buttons

### Dashboard button

| Property | Value |
|---|---|
| Visibility | Only when `onOpenDashboard` is provided |
| Layout | Icon + "Dashboard" label, `gap: 5` |
| Padding | `10` horizontal, `7` vertical |
| Radius | `18` (fully rounded pill) |
| Border | `1px` |
| Label | `fontSize: 12`, `fontWeight: '700'` |
| Icon | `LayoutDashboard` at `16` |

| State | Background | Border | Icon | Text |
|---|---|---|---|---|
| Active | `theme.teal` | `theme.tealDark` | white | white |
| Inactive (light) | `#1D3B50` | `#2A4E68` | `theme.teal` | `#E2E8F0` |
| Inactive (dark) | `#1C3144` | `#2E4C66` | `theme.teal` | `#E2E8F0` |

The inactive treatment is a **raised navy tile** rather than a flat outline — it reads as
a physical button on the dark header, which a hairline border would not.

### Theme toggle

| Property | Value |
|---|---|
| Size | `36 × 36`, `borderRadius: 18` |
| Icon | `Sun` at `18` in dark mode · `Moon` at `18` in light mode |
| Sun colour | `#FBBF24` (amber-400) |
| Moon colour | `#E2E8F0` |
| Background | `#1C3144` (dark) · `#1D3B50` (light) |
| Border | `#2E4C66` (dark) · `#2A4E68` (light) |
| Accessibility | `accessibilityLabel="Switch to light/dark mode"` |

The toggle states the **action**, matching the web app's convention. The sun icon is
amber so it reads as "brightness" rather than as a generic glyph.

### Refresh button

| Property | Value |
|---|---|
| Size | `36 × 36` |
| Icon | `RotateCw` at `17` |
| Icon colour | `#64748B` while refreshing · `#E2E8F0` otherwise |
| Disabled | `disabled={refreshing}` |
| Accessibility | `accessibilityLabel="Refresh reports"` |

Dimming the icon during the refresh is the native equivalent of the web's `animate-spin`
on the icon — the motion itself is not reproduced.

> The web rotates the refresh icon with `animate-spin`. The native version does not, so
> during a refresh the only feedback is the dimmed icon. A rotation driven by `Animated`
> would match the web.

---

## Accessibility

| Control | `accessibilityRole` | `accessibilityLabel` |
|---|---|---|
| Dashboard | `button` | "Open Dashboards" |
| Theme toggle | `button` | "Switch to light mode" / "Switch to dark mode" |
| Refresh | `button` | "Refresh reports" |

All three are `TouchableOpacity` with `activeOpacity={0.7}`.

---

## Differences from the web header

| Aspect | Web | Mobile |
|---|---|---|
| Height | `64px` | Content-driven (~58px + inset) |
| Wordmark size | `16px` | `18px` |
| Tagline | `10px` slate-300 | `11px` `#B2C5D4` / `#94A3B8` |
| Layout | Three zones, centred nav | Two zones, no nav links |
| Navigation | Full role-aware nav | Dashboard button only |
| Install PWA | Present | Not applicable |
| API docs link | Present (`xl`+) | Not applicable |
| User avatar + role chip | Present | Not present |
| Report CTA | Present in header | **In the bottom nav FAB** |
| Blur | `backdrop-blur-md` | Not available on Android |

The mobile header is deliberately **simpler** than the web. On a phone, vertical space is
the scarce resource, and the role-scoped navigation has moved into the dashboard tabs.
