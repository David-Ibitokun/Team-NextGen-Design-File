# Components — Navigation

## AppHeader

Present on every page except the full-viewport map screen variant that supplies its own
report handler. Sticky, blurred, and role-aware.

### Container

| Property | Value |
|---|---|
| Position | `sticky top-0` |
| Background | `#142B3B`/90 / dark `#0B161E`/90 with `backdrop-blur-md` |
| Text | white |
| Border | `border-b border-slate-700/80 dark:border-slate-800` |
| Height | `h-16` (64px) |
| Width | `max-w-7xl mx-auto px-4 sm:px-6` |
| Z-index | `z-40` |
| Transition | `transition-colors` |

The 90% opacity plus backdrop blur keeps content legible when scrolling beneath, while
letting the map show through slightly — the header feels like an overlay rather than a
wall.

### Left: brand

Logo mark `size="md"` plus a text lockup: "RouteX" in
`font-extrabold text-base tracking-tight` with the tagline `Know the Road Ahead.` at
`text-[10px]` in `slate-300` (hidden below `sm`). The wordmark turns `teal-300` on hover.
The whole lockup links to `/`.

### Centre: primary navigation (`hidden md:flex`)

Items render conditionally based on authentication and role, and highlight when the
current route matches.

| Item | Route | Visibility | Icon | Active colour |
|---|---|---|---|---|
| Citizen Dashboard | `/dashboard` | any signed-in user | `LayoutDashboard` | `teal-400` |
| Moderator Queue | `/moderator` | moderator or admin | `Shield` | `amber-400` |
| Admin Portal | `/admin-dashboard` | admin only | `Sliders` | `indigo-400` |
| How it works | `/#how-it-works` | signed out only | — | — |
| Features | `/#features` | signed out only | — | — |
| Safety & Trust | `/#safety-and-trust` | signed out only | — | — |
| Explore Map | `/map` | always | `MapPin` | `teal-400` |

**Design rationale:** the signed-out visitor gets the persuasion sections in the header;
the signed-in user gets their work surfaces instead. The header adapts to intent rather
than showing a fixed menu.

Shared item classes: `flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium`
— active adds `font-semibold bg-slate-800/60`, inactive adds
`hover:text-white hover:bg-slate-800/40`.

Active-route detection covers both route aliases for each dashboard
(e.g. `/dashboard` and `/my-reports`).

### Right: actions

Ordered left to right:

1. **Install App** — conditional on `beforeinstallprompt` firing.
   `px-2.5 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/60 border-teal-800 rounded-md`
   with a `Download` icon and `animate-pulse` to draw attention to PWA installation.
   The label collapses to icon-only below `sm`.
2. **API Docs** — external link to `http://127.0.0.1:8000/api/docs/` with `FileCode`
   icon. `hidden xl:inline-flex` so it never crowds the header on smaller screens.
   Always carries `target="_blank" rel="noopener noreferrer"`.
3. **Theme toggle** — `Sun` (amber `#F2B544`) in dark mode, `Moon` (`slate-200`) in light.
   `aria-label` states the action ("Switch to dark mode"), not the state.
4. **User control** — signed-in only, `hidden sm:block`.
   Avatar + display name (truncated at `max-w-[100px]`) + `RoleBadge`, with a dropdown.
   Signed-out shows a text "Sign In" link.
5. **Report a Hazard** — always visible primary teal button. Label collapses from
   "Report a Hazard" to "Report" below `sm`.
6. **Menu toggle** — `md:hidden`, hamburger / `X` icon swap, with `aria-expanded`.

### User dropdown

| Property | Value |
|---|---|
| Width | `w-52` |
| Surface | white / dark `#142533`, `rounded-xl shadow-xl border` |
| Animation | `fade-in zoom-in-95 duration-100` |
| Z-index | `z-50` |

### Anatomy

1. **Identity block** (hairline bottom border) — display name, email or `@username`, and a
   full `RoleBadge` reading "Platform Administrator" / "Community Moderator" /
   "Citizen Contributor"
2. **Role-conditional links** — Citizen Dashboard (always), Moderation Queue
   (moderator+), Admin Operations (admin)
3. **Sign Out** — red, separated by a top hairline border

### Mobile drawer

Opened by the menu toggle; `md:hidden` only.

| Property | Value |
|---|---|
| Position | Below header, `border-t border-slate-700/80` |
| Background | `#142B3B`/95 / dark `#0B161E`/95 with `backdrop-blur-md` |
| Padding | `px-4 pt-3 pb-5 space-y-3` |
| Animation | `slide-in-from-top duration-150` |

Stacked vertical links at `text-sm`, each carrying its role colour. Install appears as a
full-width teal-tinted button when available. The footer block shows "Signed in as
<username>" with the role, plus Sign Out — or, when signed out, a two-up Sign In /
Register pair.

## MobileBottomNavigation

Fixed bar shown only below `sm`.

| Property | Value |
|---|---|
| Visibility | `sm:hidden` |
| Position | `fixed bottom-0 left-0 right-0` |
| Background | white / dark `#0B161E` |
| Border | `border-t border-[#DCE4E8] dark:border-slate-800` |
| Padding | `px-4 py-2 flex items-center justify-around` |
| Shadow | `shadow-md` |
| Z-index | `z-30` |
| A11y | `aria-label="Mobile navigation"` |

Three items: **Map** (`Map`), **Report** (`PlusCircle`, raised), **List** (`List`).
Active items are teal `#087F8C` / dark `teal-400`; inactive are `#667784` / `slate-400`.

**Design rationale:** on a phone the map and the list cannot coexist in a 380px sidebar,
so they are mutually exclusive views. The bottom bar makes the two modes a single tap
apart and keeps the primary "report" action permanently in thumb reach.

## Dashboard tab bar

Shared across the three dashboards.

| Item class | State |
|---|---|
| Container | `flex border-b border-[#DCE4E8] dark:border-slate-800` |
| Tab | `flex-1 text-xs font-semibold py-2.5 px-3 border-b-2 transition-colors` |
| Active | `text-[#087F8C] dark:text-teal-400 border-[#087F8C]` |
| Inactive | `text-[#667784] dark:text-slate-400 border-transparent hover:text-[#142B3B]` |

| Dashboard | Tabs |
|---|---|
| Citizen (`/dashboard`) | My Reports · Community Impact · Settings |
| Moderator (`/moderator`) | Review Queue · Decision History |
| Admin (`/admin-dashboard`) | Users & Roles · Platform Settings · Audit Trail |

## Footer

Present on the landing page.

| Property | Value |
|---|---|
| Background | `#0B161E` |
| Text | `slate-400`, `text-xs` |
| Border | `border-t border-slate-800` |
| Padding | `py-12` |
| Grid | `grid-cols-1 md:grid-cols-4 gap-8` |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |

### Columns

| Column | Span | Contents |
|---|---|---|
| Brand | `md:col-span-2` | Logo + wordmark, tagline, one-line description |
| Navigation | 1 | Hazard map, Report a hazard, Sign in, Create account |
| Resources | 1 | Swagger API Docs (external), OpenStreetMap attribution (external), privacy/terms status note |

Column headings are `text-xs font-bold uppercase tracking-wider text-white`.

### Bottom bar

`pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500`

Left: `© {year} RouteX. Team NextGen.` Right: OpenStreetMap tile policy compliance note
and an explicit statement that no turn-by-turn navigation or tracking is implied.

## Breadcrumb / back link

A `ArrowLeft` icon link in `text-xs` returns users to the map from auth screens, so
signing in never traps a user on an isolated page.
