# Pattern — Navigation

RouteX uses two navigation systems, selected by screen type and viewport.

---

## Choosing a system

| System | Viewport | Used on |
|---|---|---|
| **App header** + mobile drawer | All | Landing, map, dashboards, auth, 404 |
| **Fixed bottom navigation** | `< sm` | Map screen only |
| **Tab bar** | All | All three dashboards |

The map screen uses **both** the header and the bottom bar, because on a phone they solve
different problems: the header carries identity and role-scoped destinations, while the
bottom bar switches between the map and list panes that cannot coexist in 380px.

---

## App header

| Property | Value |
|---|---|
| Position | `sticky top-0` |
| Height | `h-16` (64px) |
| Background | `#142B3B`/90 · dark `#0B161E`/90 · `backdrop-blur-md` |
| Text | white |
| Border | `border-b border-slate-700/80 dark:border-slate-800` |
| Container | `max-w-7xl mx-auto px-4 sm:px-6` |
| Z-index | `z-40` |

### Three zones

```
┌─────────────────────────────────────────────────────────────────┐
│ [logo + wordmark]    [nav links]        [actions] [☰]            │
└─────────────────────────────────────────────────────────────────┘
```

### Left — brand

Logo `size="md"` + text lockup. "RouteX" in `font-extrabold text-base tracking-tight white`,
hovering to `teal-300`. Tagline `text-[10px] text-slate-300`, hidden below `sm`. Links to `/`.

### Centre — primary navigation (`hidden md:flex`)

| Item | Route | Visibility | Icon | Active |
|---|---|---|---|---|
| Citizen Dashboard | `/dashboard` | signed in | `LayoutDashboard` | `teal-400` |
| Moderator Queue | `/moderator` | moderator+ | `Shield` | `amber-400` |
| Admin Portal | `/admin-dashboard` | admin | `Sliders` | `indigo-400` |
| How it works | `/#how-it-works` | signed out | — | — |
| Features | `/#features` | signed out | — | — |
| Safety & Trust | `/#safety-and-trust` | signed out | — | — |
| Explore Map | `/map` | always | `MapPin` | `teal-400` |

Shared: `flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium`.
Active adds `font-semibold bg-slate-800/60`; inactive adds
`hover:text-white hover:bg-slate-800/40`.

### Active-route detection

Both aliases are matched, so `/my-reports` still highlights "Citizen Dashboard":

```js
const isDashboardRoute   = ["/dashboard", "/my-reports"].includes(location.pathname);
const isModeratorRoute   = ["/moderator", "/moderation"].includes(location.pathname);
const isAdminRoute       = ["/admin-dashboard", "/admin"].includes(location.pathname);
const isMapRoute         = location.pathname === "/map";
```

### Right — actions

Ordered: **Install App** → **API Docs** → **Theme toggle** → **User control** →
**Report a Hazard** → **Menu toggle**.

| Control | Visibility | Notes |
|---|---|---|
| Install App | when `beforeinstallprompt` fires | `animate-pulse`; label collapses below `sm` |
| API Docs | `hidden xl:inline-flex` | External link, `target="_blank" rel="noopener noreferrer"` |
| Theme toggle | always | `Sun` (amber) in dark, `Moon` in light; `aria-label` states the **action** |
| User control | `hidden sm:block`, signed in | Avatar + truncated name + role chip + dropdown |
| Sign In | `hidden sm:flex`, signed out | Text link |
| Report a Hazard | always | Teal primary; label collapses to "Report" below `sm` |
| Menu toggle | `md:hidden` | Hamburger / `X`, `aria-expanded` |

`hidden xl` on API Docs keeps it from crowding the header at laptop widths, while still
surfacing it to developers without taking a mobile slot.

### User dropdown

`w-52`, `rounded-xl shadow-xl`, `fade-in zoom-in-95 duration-100`, `z-50`.

1. **Identity block** — display name, email or `@username`, full `RoleBadge`
2. **Role-conditional links** — Citizen Dashboard (always), Moderation Queue
   (moderator+), Admin Operations (admin)
3. **Sign Out** — red, above a top hairline border

### Mobile drawer

`md:hidden`, opens below the header.

```
border-t border-slate-700/80
bg-[#142B3B]/95 dark:bg-[#0B161E]/95 backdrop-blur-md
px-4 pt-3 pb-5 space-y-3
animate-in slide-in-from-top duration-150
```

Stacked links at `text-sm`, each in its role colour. Install appears as a full-width teal
button when available. Footer block: "Signed in as `<username>`" with the role plus Sign
Out — or a two-up Sign In / Register pair when signed out.

---

## Mobile bottom navigation

| Property | Value |
|---|---|
| Visibility | `sm:hidden` |
| Position | `fixed bottom-0 left-0 right-0` |
| Background | white · dark `#0B161E` |
| Border | `border-t border-[#DCE4E8] dark:border-slate-800` |
| Padding | `px-4 py-2 flex items-center justify-around` |
| Shadow | `shadow-md` |
| Z-index | `z-30` |
| A11y | `aria-label="Mobile navigation"` |

```
┌──────────────────────────────────────────┐
│    🗺          (+)          ☰             │
│   Map        Report       List           │
└──────────────────────────────────────────┘
```

| Item | Icon | Active colour |
|---|---|---|
| Map | `Map` | `#087F8C` · dark `teal-400` |
| Report | `PlusCircle` | `#087F8C`, offset `-mt-5` |
| List | `List` | `#087F8C` · dark `teal-400` |

The centre action is a floating circle (`w-8 h-8 rounded-full bg-[#087F8C] text-white`,
bordered, `shadow-md`) that breaks the bar line, signalling the primary action and
placing it in thumb reach.

### Why a bottom bar exists at all

On a phone the sidebar (`md:w-[380px]`) and the map cannot coexist. The map screen
therefore renders them as mutually exclusive views:

```jsx
// Sidebar
`${mobileTab === "map" ? "hidden md:flex" : "flex"}`
// Map section
`${mobileTab === "list" ? "hidden md:block" : "block"}`
```

Selecting a hazard from the list sets `mobileTab` back to `"map"`, so tapping a report
always reveals it on the map.

### Scroll clearance

The list uses `pb-20 md:pb-4` — 80px of bottom padding on mobile so the fixed bar never
covers the last card, with normal padding restored at `md` where the bar is hidden.

---

## Dashboard tab bar

Full-width row with a hairline bottom border. One panel visible at a time.

| State | Classes |
|---|---|
| Container | `flex border-b border-[#DCE4E8] dark:border-slate-800` |
| Tab | `flex-1 text-xs font-semibold py-2.5 px-3 border-b-2 transition-colors` |
| Active | `text-[#087F8C] dark:text-teal-400 border-[#087F8C]` |
| Inactive | `text-[#667784] dark:text-slate-400 border-transparent hover:text-[#142B3B]` |

| Dashboard | Tabs |
|---|---|
| Citizen | My Reports · Community Impact · Settings |
| Moderator | Review Queue · Decision History |
| Administrator | Users & Roles · Platform Settings · Audit Trail |

### Why one shell for all three

Moderators and administrators work with the same mental model — metric tiles plus tabs. If
each dashboard had a bespoke layout, moving between roles would require re-learning
navigation. Only the **content** and the **authority** differ.

Each tab switch triggers its own data fetch (`if (activeTab === "users") fetchUsers()`),
so switching tabs loads fresh data rather than showing content that may be stale.

---

## Role-based navigation

| Visitor | Citizen | Moderator | Admin |
|---|---|---|---|
| How it works · Features · Safety & Trust | Citizen Dashboard | Citizen Dashboard | Citizen Dashboard |
| Explore Map | Explore Map | Moderator Queue | Moderator Queue |
| Sign In | — | Explore Map | Admin Portal |
| Report a Hazard | Report a Hazard | Report a Hazard | Explore Map |
| | | | Report a Hazard |

A signed-out visitor is shown the persuasion sections; a signed-in user is shown their
work surfaces. The header adapts to **intent** rather than presenting a fixed menu — a
visitor is guided toward understanding, a user toward work.

### Role colour identity

| Role | Icon | Active colour | Badge |
|---|---|---|---|
| Citizen | `LayoutDashboard` | `teal-400` | `bg-teal-900/60 text-teal-300` |
| Moderator | `Shield` | `amber-400` | `bg-amber-900/60 text-amber-300` |
| Administrator | `Sliders` | `indigo-400` | `bg-purple-900/60 text-purple-300` |

### Permission derivation

```js
isAuthenticated = Boolean(user)
isAdmin         = user && (user.is_superuser || user.role === "admin")
isModerator     = user && (user.is_superuser || user.is_staff
                           || role === "moderator" || role === "admin")
isCitizen       = Boolean(user)
```

An administrator is treated as a moderator — the moderator surface is a subset of the
admin surface, so admins can moderate without a second role.

### Route guards

`ModerationPage` and `AdminDashboardPage` redirect unauthorised users to `/`, tracking
`authLoading` separately so a redirect does not fire during the initial `/auth/me()`
request.

Frontend guards are **UX convenience only**. Every privileged API endpoint enforces its own
permission class, so bypassing the guard grants no access.

---

## Footer

| Property | Value |
|---|---|
| Background | `#0B161E` |
| Text | `slate-400` · `text-xs` |
| Border | `border-t border-slate-800` |
| Padding | `py-12` |
| Grid | `grid-cols-1 md:grid-cols-4 gap-8` |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |

| Column | Span | Contents |
|---|---|---|
| Brand | `md:col-span-2` | Logo + wordmark, tagline, description |
| Navigation | 1 | Hazard map · Report a hazard · Sign in · Create account |
| Resources | 1 | Swagger API Docs · OpenStreetMap credit · Privacy/terms status |

Headings: `text-xs font-bold uppercase tracking-wider text-white`.

Bottom bar: `pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center
justify-between gap-3 text-[11px] text-slate-500` — copyright on the left; the
OpenStreetMap tile policy and no-tracking compliance note on the right.

---

## Common mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Hiding scroll clearance under the bottom bar | Last card unreachable | `pb-20` on the list, `md:pb-4` on desktop |
| Removing attribution to tidy the footer | Violates OSM and Esri tile policies | Restyle; keep it visible |
| Treating the frontend guard as security | False sense of protection | Server permission classes are the boundary |
| Showing work surfaces to signed-out visitors | Confusing navigation | Show persuasion sections instead |
| `aria-label` describing state, not action | "Dark mode" instead of "Switch to dark mode" | Label the action |
| Building a bespoke dashboard layout per role | Users relearn navigation on every role change | Shared metric + tab shell |
| Showing API Docs at all widths | Crowds the header on mobile | `hidden xl:inline-flex` |
