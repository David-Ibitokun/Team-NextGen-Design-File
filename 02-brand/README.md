# Brand — Assets

Source assets live in `frontend/public/` and are mirrored here for design reference.

## Assets in this folder

| File | Purpose |
|---|---|
| [`routex-logo.svg`](assets/routex-logo.svg) | Primary mark, 48 × 48 viewBox, teal gradient pin with white road |
| [`favicon.svg`](assets/favicon.svg) | Browser tab / apple-touch-icon, solid teal pin with white winding road |

## Related assets (in the application repo)

| File | Purpose |
|---|---|
| `frontend/public/manifest.json` | PWA manifest — icons, shortcuts, theme colours (mirrored in [`../09-pwa/`](../09-pwa/)) |
| `frontend/public/sw.js` | Service worker — offline shell caching strategy |

## Iconography system

Icons come from **Lucide React** (`lucide-react@0.469`). They are stroke-based, inherit
`currentColor`, and default to `1.5`–`2` stroke width.

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

| Category | Icon in `CategoryBadge` | Icon in `ReportHazardForm` |
|---|---|---|
| Flooding | `Droplets` | `Droplets` |
| Pothole | `CircleAlert` | `CircleDot` |
| Blocked road | `ShieldAlert` | `AlertTriangle` |
| Fallen tree | `Trees` | `TreePine` |
| Other | `AlertCircle` | `HelpCircle` |

Landing page category preview uses `Droplets`, `Cone`, `AlertTriangle`, `TreePine`, `Layers`.
The badge and form icons are preferred for consistency; landing icons are decorative.

### Icons by function

| Function | Icons |
|---|---|
| Navigation | `MapPin`, `Layers`, `Compass`, `Navigation` |
| Actions | `PlusCircle`, `Camera`, `ThumbsUp`, `Flag`, `Download`, `RefreshCw`, `Save`, `ExternalLink` |
| Auth | `LogIn`, `Eye`, `EyeOff`, `LogOut`, `User`, `UserCheck`, `UserX` |
| Roles | `Shield`, `ShieldCheck`, `ShieldAlert`, `Sliders`, `FileText` |
| Status | `CheckCircle2`, `Check`, `X`, `Clock`, `AlertTriangle`, `AlertCircle`, `CircleAlert` |
| Feedback | `Info`, `Loader2`, `Sparkles`, `HelpCircle` |
| Theme | `Sun`, `Moon` |
| Data | `Activity`, `FileCode`, `Trash2`, `Filter`, `Search`, `Radio`, `Flame` |
