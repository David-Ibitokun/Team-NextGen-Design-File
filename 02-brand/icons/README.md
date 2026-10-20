# Icons — Lucide Set

Every icon used by the RouteX frontend, as standalone SVG files.

| | |
|---|---|
| **Library** | Lucide (ISC License) |
| **Package** | `lucide-react@0.469.0` |
| **Grid** | 24 × 24 |
| **Stroke** | 2px, round cap, round join |
| **Fill** | `none` |
| **Colour** | `currentColor` — inherits from the parent text colour |
| **Unique icons** | **71** |
| **Import names in use** | **72** (one artwork answers to two names) |

---

## Contents of this folder

| Path | Purpose |
|---|---|
| `*.svg` | 71 standalone SVG files, named by canonical Lucide name |
| [`index.html`](index.html) | Visual gallery — open in a browser to review the whole set |
| [`manifest.json`](manifest.json) | Machine-readable index: canonical name, file, import names, element types, source files |
| [`LICENSE-lucide.md`](LICENSE-lucide.md) | ISC license attribution |
| [`.build/extract-icons.mjs`](.build/extract-icons.mjs) | The generator script — re-runnable |

---

## How these were produced

The geometry was **extracted from the installed `lucide-react` package**, not
hand-reproduced. Each SVG is the authentic v0.469.0 artwork:

```bash
cd Team-NextGen-RouteX/frontend
node "/Users/bammy/Desktop/Team-NextGen-Design-File/02-brand/icons/.build/extract-icons.mjs" \
  "src" "/Users/bammy/Desktop/Team-NextGen-Design-File/02-brand/icons"
```

The script:

1. Scans every `.jsx` file for `import { … } from "lucide-react"`
2. Parses the package's own export table to resolve deprecated aliases
3. Evaluates each icon's node array and renders it to SVG

Re-running it after a dependency upgrade regenerates the set automatically.

---

## SVG format

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="…" />
  <circle cx="12" cy="10" r="3" />
</svg>
```

`stroke="currentColor"` means the file is **colour-agnostic** — the same SVG works in
light mode, dark mode, a teal accent context, or a red danger context, with no recolouring
needed. This matches how the icons behave in the application.

---

## Complete icon inventory

### Navigation and orientation

| Icon | File | Used for |
|---|---|---|
| `MapPin` | `map-pin.svg` | Location, Explore Map, coordinates |
| `Map` | `map.svg` | Mobile bottom nav — map view |
| `List` | `list.svg` | Mobile bottom nav — list view |
| `Navigation` | `navigation.svg` | "Use current location", launch in browser |
| `Compass` | `compass.svg` | "Explore the map" step |
| `Menu` | `menu.svg` | Mobile menu toggle |
| `ArrowLeft` | `arrow-left.svg` | Back links on auth screens |
| `ArrowRight` | `arrow-right.svg` | Feature card links |
| `ChevronRight` | `chevron-right.svg` | Card and category links |
| `ChevronDown` | `chevron-down.svg` | FAQ accordion |
| `ExternalLink` | `external-link.svg` | API docs, map links, resources |
| `Layers` | `layers.svg` | Layer switcher, "other" category |
| `LayoutDashboard` | `layout-dashboard.svg` | Citizen Dashboard nav |
| `FolderKanban` | `folder-kanban.svg` | My Reports nav |

### Hazard categories

| Icon | File | Category |
|---|---|---|
| `Droplets` | `droplets.svg` | Flooding |
| `CircleDot` | `circle-dot.svg` | Pothole (report form) |
| `TriangleAlert` | `triangle-alert.svg` | Blocked road (report form) |
| `TreePine` | `tree-pine.svg` | Fallen tree (report form) |
| `CircleHelp` | `circle-help.svg` | Other hazard (report form) |
| `Cone` | `cone.svg` | Pothole (landing tiles) |
| `Trees` | `trees.svg` | Fallen tree (badges) |
| `CircleAlert` | `circle-alert.svg` | Blocked road (badges) + general alert |

### Status and feedback

| Icon | File | Used for |
|---|---|---|
| `CircleCheck` | `circle-check.svg` | Community-confirmed status (7 files) |
| `CircleCheckBig` | `circle-check-big.svg` | Report submitted success |
| `Check` | `check.svg` | Checklist items |
| `Clock` | `clock.svg` | Freshness badge (7 files) |
| `TriangleAlert` | `triangle-alert.svg` | Error state, under review |
| `Info` | `info.svg` | Demo banner, disclaimers |
| `X` | `x.svg` | Close, remove, cancel |
| `CircleX` | `circle-x.svg` | Rejected status |
| `LoaderCircle` | `loader-circle.svg` | Submit / optimise spinners (6 files) |
| `Activity` | `activity.svg` | Live incident stream, admin metrics |
| `Radio` | `radio.svg` | Live data indicator |
| `Sparkles` | `sparkles.svg` | "WebP Optimized" indicator |
| `Flame` | `flame.svg` | Community impact metric |

### Actions

| Icon | File | Used for |
|---|---|---|
| `CirclePlus` | `plus-circle.svg` | Report a hazard (6 files) |
| `Check` | `check.svg` | Confirm a hazard |
| `ThumbsUp` | `thumbs-up.svg` | Confirmation count (4 files) |
| `Flag` | `flag.svg` | Flag a report |
| `Camera` | `camera.svg` | Photo evidence |
| `Search` | `search.svg` | Admin user search |
| `Filter` | `filter.svg` | Status filter (3 files) |
| `RefreshCw` | `refresh-cw.svg` | Retry, refresh (4 files) |
| `Save` | `save.svg` | Save settings / profile |
| `Trash2` | `trash-2.svg` | Delete user |
| `PenLine` | `pen-line.svg` | Edit profile |
| `Download` | `download.svg` | Install PWA |
| `PhoneCall` | `phone-call.svg` | Emergency advisory |
| `HeartHandshake` | `heart-handshake.svg` | Community impact |
| `TrendingUp` | `trending-up.svg` | Impact statistics |

### Roles and permissions

| Icon | File | Role |
|---|---|---|
| `Shield` | `shield.svg` | Moderator |
| `ShieldAlert` | `shield-alert.svg` | Moderation queue, pending flags |
| `ShieldCheck` | `shield-check.svg` | Citizen observer pledge |
| `SlidersVertical` | `sliders-vertical.svg` | Admin portal |
| `UserCheck` | `user-check.svg` | Promote user |
| `UserX` | `user-x.svg` | Demote user |
| `UserPlus` | `user-plus.svg` | Register |
| `User` | `user.svg` | User profile |
| `Users` | `users.svg` | Community, user totals |
| `Settings` | `settings.svg` | Settings tab |

### Authentication

| Icon | File | Used for |
|---|---|---|
| `LogIn` | `log-in.svg` | Sign in |
| `LogOut` | `log-out.svg` | Sign out |
| `Mail` | `mail.svg` | Forgot password |
| `KeyRound` | `key-round.svg` | Reset password |
| `Eye` | `eye.svg` | Show password |
| `EyeOff` | `eye-off.svg` | Hide password |
| `FileText` | `file-text.svg` | Reports, audit |
| `FileCode` | `file-code.svg` | API docs link |
| `History` | `history.svg` | Decision history |

### Theme, platform, and misc

| Icon | File | Used for |
|---|---|---|
| `Sun` | `sun.svg` | Switch to light mode |
| `Moon` | `moon.svg` | Switch to dark mode |
| `Smartphone` | `smartphone.svg` | PWA install section |
| `Calendar` | `calendar.svg` | Report timestamp |

---

## Deprecated Lucide aliases in use

Lucide 0.469 renamed several icons and kept the old names as aliases. RouteX still imports
the **old** names, which continue to work but are deprecated upstream.

| Imported as | Canonical | File | Files |
|---|---|---|---:|
| `AlertCircle` | `CircleAlert` | `circle-alert.svg` | 7 |
| `TriangleAlert` | `AlertTriangle` | `triangle-alert.svg` | 7 |
| `CheckCircle2` | `CircleCheck` | `circle-check.svg` | 7 |
| `CheckCircle` | `CircleCheckBig` | `circle-check-big.svg` | 2 |
| `HelpCircle` | `CircleHelp` | `circle-help.svg` | 2 |
| `PlusCircle` | `CirclePlus` | `circle-plus.svg` | 6 |
| `XCircle` | `CircleX` | `circle-x.svg` | 1 |
| `Loader2` | `LoaderCircle` | `loader-circle.svg` | 6 |
| `Edit3` | `PenLine` | `pen-line.svg` | 1 |
| `Sliders` | `SlidersVertical` | `sliders-vertical.svg` | 3 |

> **Recommendation:** migrate the imports to the canonical names. Deprecated aliases are
> removed in a future major Lucide release, so an upgrade could break the build. The
> replacements are mechanical — search and replace each name across `frontend/src`.

### A note on `AlertCircle` vs `CircleAlert`

Both names are imported in the codebase, and **both resolve to the same artwork**
(`circle-alert.svg`). They are the same icon under two names — one is the deprecated alias.
The frontend uses `CircleAlert` in `CategoryBadge` and `AlertCircle` elsewhere for
identical visuals, which is a consistency issue worth resolving at the same time.

---

## Size scale in the application

| Class | Pixels | Usage |
|---|---|---|
| `w-3 h-3` | 12 | Inline with `text-[11px]` metadata |
| `w-3.5 h-3.5` | 14 | Header actions, nav items, dense chips |
| `w-4 h-4` | 16 | Buttons, form labels, badges |
| `w-5 h-5` | 20 | Icon containers `w-10 h-10`, card icons |
| `w-8 h-8` | 32 | Success confirmation icon |

Because the SVGs are 24×24 with a 2px stroke, they scale cleanly to any of these sizes
without a separate asset.

---

## Colour in context

Icons inherit `currentColor`, so the surrounding text class decides the colour.

| Context | Colour |
|---|---|
| Primary accent | `#087F8C` — light mode |
| Primary accent (dark) | `teal-400` |
| Danger | `#D64545` — light mode |
| Danger (dark) | `red-400` |
| Warning | `#F2B544` — light mode |
| Warning (dark) | `amber-400` |
| Success | `#27865B` — light mode |
| Success (dark) | `emerald-300` |
| Muted | `#667784` — light mode |
| Muted (dark) | `slate-400` |
| On navy | white |

### Role identity

| Role | Icon | Colour |
|---|---|---|
| Citizen | `LayoutDashboard` | `teal-400` |
| Moderator | `Shield` | `amber-400` |
| Administrator | `SlidersVertical` | `indigo-400` |

---

## Usage in the application

```jsx
import { MapPin, PlusCircle } from "lucide-react";

// Size via Tailwind, colour via currentColor
<MapPin className="w-4 h-4 text-[#087F8C]" />
```

Because the icon is a React component rather than an `<img>`, it is tree-shaken — only the
icons actually imported ship in the bundle.

### When to use a static SVG instead

The files in this folder are for **design reference, handoff, and documentation** — for
example, placing an icon in a Figma board, a slide, or a printed spec.

In the application, keep using the `lucide-react` component. That preserves tree-shaking,
the `currentColor` behaviour, and the ability to pass `className` for sizing.

---

## Reusing these files

The Lucide icons are licensed under the **ISC License**, which permits commercial and
non-commercial use, modification, and distribution. Attribution is not required, but the
license file is included in this folder as good practice.

See [`LICENSE-lucide.md`](LICENSE-lucide.md).
