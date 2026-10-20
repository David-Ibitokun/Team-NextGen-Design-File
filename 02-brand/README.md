# Brand — Assets

Source assets live in `frontend/public/` and are mirrored here for design reference.

## Assets in this folder

| File | Purpose |
|---|---|
| [`assets/routex-logo.svg`](assets/routex-logo.svg) | Primary mark, 48 × 48 viewBox, teal gradient pin with white road |
| [`assets/favicon.svg`](assets/favicon.svg) | Browser tab / apple-touch-icon, solid teal pin with white winding road |

## Related assets (in the application repo)

| File | Purpose |
|---|---|
| `frontend/public/manifest.json` | PWA manifest — icons, shortcuts, theme colours (mirrored in [`../09-pwa/`](../09-pwa/)) |
| `frontend/public/sw.js` | Service worker — offline shell caching strategy |

---

## Iconography system

Icons come from **Lucide React** (`lucide-react@0.469`) — stroke-based, 24×24 grid,
2px stroke, inheriting `currentColor`.

### Complete set — [`icons/`](icons/)

| | |
|---|---|
| **Folder** | [`icons/`](icons/) |
| **Unique icons** | 71 |
| **Import names in use** | 72 |
| **Visual gallery** | [`icons/index.html`](icons/index.html) — open in a browser |
| **Sprite sheet** | [`icons/sprite.svg`](icons/sprite.svg) — one `<symbol>` per icon |
| **Machine index** | [`icons/manifest.json`](icons/manifest.json) |
| **Full reference** | [`icons/README.md`](icons/README.md) |

The SVGs were **extracted from the installed package**, so the geometry is authentic
v0.469.0 artwork rather than a hand reproduction. They are named by canonical Lucide name;
the manifest records which import name each answers to.

### Sizes in use

| Size class | Pixels | Usage |
|---|---|---|
| `w-3 h-3` | 12 | Inline with `text-[11px]` metadata |
| `w-3.5 h-3.5` | 14 | Header actions, nav items, dense chips |
| `w-4 h-4` | 16 | Buttons, form labels, badges |
| `w-5 h-5` | 20 | Icon containers `w-10 h-10`, card icons |
| `w-8 h-8` | 32 | Success confirmation icon |

### Icon containers

A recurring pattern is a rounded tile holding an icon, used for feature icons, step
icons, trust-strip icons, and category tiles.

| Container | Classes |
|---|---|
| Small (`w-10 h-10`, `rounded-xl`) | `bg-[#087F8C]/10 text-[#087F8C] dark:text-teal-400` |
| Trust strip (`w-11 h-11`, `rounded-xl`) | `bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900/60` |
| Circle (`w-12 h-12`, `rounded-full`) | Used in `EmptyState` |
| Mobile report FAB (`w-8 h-8`, `rounded-full`) | `bg-[#087F8C] text-white` |

### Hazard category icons

| Category | Icon in `CategoryBadge` | Icon in `ReportHazardForm` | Icon in landing tiles |
|---|---|---|---|
| Flooding | `Droplets` | `Droplets` | `Droplets` |
| Pothole | `CircleAlert` | `CircleDot` | `Cone` |
| Blocked road | `ShieldAlert` | `TriangleAlert` | `TriangleAlert` |
| Fallen tree | `Trees` | `TreePine` | `TreePine` |
| Other | `CircleAlert` | `CircleHelp` | `Layers` |

The badge and form icons are the canonical pair — the same mapping appears in both, so a
user who learns it in the form recognises it in every badge. Landing tile icons are
decorative (a road cone for potholes is more evocative at large size) and are not a
teaching surface.

### Icons by function

| Function | Icons |
|---|---|
| Navigation | `MapPin`, `Map`, `List`, `Layers`, `Compass`, `Navigation`, `Menu` |
| Actions | `CirclePlus`, `Camera`, `ThumbsUp`, `Flag`, `Download`, `RefreshCw`, `Save`, `ExternalLink` |
| Auth | `LogIn`, `LogOut`, `Eye`, `EyeOff`, `Mail`, `KeyRound` |
| Roles | `Shield`, `ShieldCheck`, `ShieldAlert`, `SlidersVertical`, `UserCheck`, `UserX` |
| Status | `CircleCheck`, `CircleCheckBig`, `Check`, `X`, `CircleX`, `Clock`, `TriangleAlert`, `CircleAlert` |
| Feedback | `Info`, `LoaderCircle`, `Sparkles`, `CircleHelp` |
| Theme | `Sun`, `Moon` |
| Data | `Activity`, `FileCode`, `FileText`, `Trash2`, `Filter`, `Search`, `Radio`, `Flame`, `History` |
