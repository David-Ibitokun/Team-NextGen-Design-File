# Mobile Icons — Lucide Set

Every icon used by the RouteX native app, as standalone SVG files.

| | |
|---|---|
| **Library** | Lucide (ISC License) |
| **Package** | `lucide-react-native@^1.59.0` |
| **Icons** | **34** |
| **Grid** | 24 × 24 |
| **Stroke** | 2px, round cap, round join |
| **Fill** | `none` |

---

## Contents

| Path | Purpose |
|---|---|
| `*.svg` | 34 standalone SVG files |
| [`index.html`](index.html) | Visual gallery — open in a browser |
| [`sprite.svg`](sprite.svg) | All 34 as `<symbol>` elements |
| [`manifest.json`](manifest.json) | Machine-readable index |
| [`LICENSE-lucide.md`](LICENSE-lucide.md) | ISC license attribution |
| [`.build/extract-mobile-icons.mjs`](.build/extract-mobile-icons.mjs) | The generator script |

---

## How these were produced

`lucide-react-native` is not installed in the repository, so the geometry was read from
the **`lucide-react@0.469.0` package installed in the web app**. Both packages render the
same upstream Lucide artwork — the v0.469 → v1.x changes were export-name renames only
(`AlertCircle` → `CircleAlert`, `CheckCircle2` → `CircleCheck`, and so on). The artwork is
identical.

The script resolves the mobile app's older export names through the package's own alias
table, so `AlertCircle` correctly maps to the `circle-alert` artwork.

```bash
cd Team-NextGen-RouteX
node "/Users/bammy/Desktop/Team-NextGen-Design-File/12-mobile/icons/.build/extract-mobile-icons.mjs" \
  "mobile/src" \
  "frontend/node_modules/lucide-react/dist/esm" \
  "/Users/bammy/Desktop/Team-NextGen-Design-File/12-mobile/icons"
```

---

## Complete inventory

### Navigation and map

| Icon | File | Used for |
|---|---|---|
| `Map` | `map.svg` | Bottom nav — map view |
| `List` | `list.svg` | Bottom nav — hazards list; map Cards toggle |
| `MapPin` | `map-pin.svg` | Location rows, Live Map action (4 files) |
| `Navigation` | `navigation.svg` | Current location |
| `Locate` | `locate.svg` | Map recentre control |
| `Plus` | `plus.svg` | Map zoom in; the report FAB |
| `Minus` | `minus.svg` | Map zoom out |
| `Layers` | `layers.svg` | Monitored hazards count |
| `ChevronRight` | `chevron-right.svg` | Map card row navigation |
| `RotateCw` | `rotate-cw.svg` | Refresh action |

### Hazard categories

| Icon | File | Category |
|---|---|---|
| `Droplets` | `droplets.svg` | Flooding |
| `CircleDot` | `circle-dot.svg` | Pothole |
| `TriangleAlert` | `triangle-alert.svg` | Blocked road |
| `TreePine` | `tree-pine.svg` | Fallen tree |
| `CircleHelp` | `circle-help.svg` | Other hazard |
| `CircleAlert` | `circle-alert.svg` | General alerts, map error state |

### Status, feedback, and actions

| Icon | File | Used for |
|---|---|---|
| `Clock` | `clock.svg` | Report timestamp, Active Alerts metric |
| `ThumbsUp` | `thumbs-up.svg` | Confirmation count |
| `ShieldCheck` | `shield-check.svg` | Verified pill, empty state |
| `CircleCheck` | `circle-check.svg` | Resolved metric |
| `HeartHandshake` | `heart-handshake.svg` | Confirmations metric |
| `TriangleAlert` | `triangle-alert.svg` | Total Reports metric |
| `CirclePlus` | `plus-circle.svg` | New Report action |
| `Sparkles` | `sparkles.svg` | WebP optimisation indicator |
| `RefreshCw` | `refresh-cw.svg` | Retry loading the map |
| `Camera` | `camera.svg` | Photo capture |
| `Image` | `image.svg` | Selected photo preview |
| `X` | `x.svg` | Close the report modal |

### Roles and settings

| Icon | File | Used for |
|---|---|---|
| `User` | `user.svg` | Avatar in the dashboard profile card |
| `LayoutDashboard` | `layout-dashboard.svg` | Header dashboard button |
| `SlidersVertical` | `sliders-vertical.svg` | Moderator queue panel |
| `Settings` | `settings.svg` | Platform administration panel |
| `ExternalLink` | `external-link.svg` | Open full admin portal |

### Theme

| Icon | File | Used for |
|---|---|---|
| `Sun` | `sun.svg` | Switch to light mode |
| `Moon` | `moon.svg` | Switch to dark mode |

---

## Naming notes

| Mobile import | Canonical name | File |
|---|---|---|
| `AlertCircle` | `CircleAlert` | `circle-alert.svg` |
| `AlertTriangle` | `TriangleAlert` | `triangle-alert.svg` |
| `CheckCircle2` | `CircleCheck` | `circle-check.svg` |
| `HelpCircle` | `CircleHelp` | `circle-help.svg` |
| `PlusCircle` | `CirclePlus` | `circle-plus.svg` |
| `ImageIcon` | `Image` | `image.svg` |
| `Sliders` | `SlidersVertical` | `sliders-vertical.svg` |

The mobile app imports the **older Lucide names**, which are still correct for
`lucide-react-native@1.59`. The canonical names are used for the file names here.

`ImageIcon` is the standard Lucide alias for `Image`, used in React Native to avoid
clashing with the platform's own `Image` component.

---

## Differences from the web icon set

The web app uses 71 icons; the mobile app uses 34. The mobile set is a deliberate subset,
plus five icons the web does not use.

| Icon | Mobile only | Why |
|---|---|---|
| `Locate` | ✅ | A native recentre control |
| `Plus` | ✅ | The map zoom control and the FAB |
| `Minus` | ✅ | The map zoom control |
| `Image` | ✅ | Photo preview in the report modal |
| `RotateCw` | ✅ | A native refresh action |

And the web uses 42 the mobile app does not: the landing page and marketing sections
(`Sparkles` is shared), the full auth screen set (`Mail`, `KeyRound`, `Eye`, `EyeOff`,
`LogIn`, `LogOut`, `UserPlus`, `UserCheck`, `UserX`), the moderation and admin surfaces
(`Flag`, `Save`, `Trash2`, `Search`, `FileText`, `FileCode`, `History`, `Radio`, `Flame`,
`TrendingUp`, `PenLine`, `Check`, `CircleCheckBig`, `CircleX`, `SquareCheck`), and
landing-only icons (`Compass`, `PhoneCall`, `Smartphone`, `Calendar`, `Activity`).

### Icons in both platforms

29 icons are shared between the two apps — the same names, the same artwork, the same
semantics. This is what makes the two platforms feel like one product.

---

## Colours in context

React Native icons take an explicit `color` prop; there is no `currentColor`
inheritance.

| Context | Colour |
|---|---|
| Primary accent | `theme.teal` — `#087F8C` (light) / `#2DD4BF` (dark) |
| Muted | `theme.textMuted` — `#667784` / `#64748B` |
| Primary text | `theme.textPrimary` |
| Category | `categoryConfig.color` — one of the five brand category colours |
| Success | `theme.green` |
| Warning | `#F2B544` (raw — not a theme token) |
| Danger | `#F87171` (raw — not a theme token) |
| On navy | `#E2E8F0` |
| White | `#FFFFFF` |

Two raw hex values (`#F2B544` and `#F87171`) bypass the token system. They should become
`theme.amber` and `theme.red`.

---

## Sizes in use

| Size | Usage |
|---|---|
| `11` | Coordinates in map cards |
| `12` | Timestamp clock, confirmation icon, verified shield |
| `13` | Category badge icons on cards |
| `14` | Location pin, chevron, retry icons |
| `15` | Metric card icons, quick-action icons |
| `16` | Category icons in the report modal, dashboard button |
| `17` | Refresh icon |
| `18` | Theme toggle, map controls, panel headers |
| `22` | Bottom nav icons |
| `28` | Dashboard avatar icon |
| `40` | Map error icon |
| `44` | Empty-state shield |

---

## Usage in the application

```tsx
import { MapPin } from 'lucide-react-native';

<MapPin size={14} color={theme.teal} />
```

In the app, keep using the `lucide-react-native` component — it is tree-shaken and
renders natively through `react-native-svg`.

The SVG files in this folder are for **design reference and hand-off** — placing an icon
in a Figma board, a slide, or a print spec.

---

## Licence

Lucide is licensed under the **ISC License**. See [`LICENSE-lucide.md`](LICENSE-lucide.md).
