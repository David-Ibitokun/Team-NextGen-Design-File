# Responsive Design

Breakpoints, layout adaptations, and per-device behaviour.

---

## Breakpoints

Tailwind v4 defaults. RouteX introduces no custom breakpoints.

| Prefix | Min width | Target |
|---|---|---|
| *(base)* | 0 | Small phone, portrait |
| `sm:` | 640px | Large phone, small tablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Laptop, tablet landscape |
| `xl:` | 1280px | Desktop |

Containers are `max-w-7xl` (1280px) with responsive gutters:
`px-4` → `sm:px-6` → `lg:px-8`.

---

## Per-screen behaviour

### Landing page

| Element | Mobile | `sm` | `md` | `lg` |
|---|---|---|---|---|
| Hero | Stacked | Stacked | Stacked | 2 columns (6/6) |
| Headline | `text-4xl` | `text-5xl` | `text-5xl` | `text-6xl` |
| Hero CTAs | Stacked, full width | Row | Row | Row |
| Map preview | `h-[360px]` | `h-[440px]` | `h-[440px]` | `h-[440px]` |
| Trust strip | 1 column | 1 | 3 | 3 |
| How it works | 1 column | 1 | 3 | 3 |
| Features | 1 column | 1 | 2 | 4 |
| Live pulse | 1 column | 1 | 3 | 3 |
| Categories | 2 columns | 3 | 3 | 5 |
| Advisory + pledge | Stacked | Stacked | 2 | 2 |
| Safety cards | 1 column | 1 | 2 | 2 |
| FAQ | `max-w-4xl` | — | — | — |
| PWA panel | Column | Column | Row | Row |
| Hero card width | Full | Full | Full | `sm:max-w-xs` |
| Footer | 1 column | 1 | 4 | 4 |

### Map screen

| Element | Mobile (`< md`) | `md` | `lg` |
|---|---|---|---|
| Sidebar | Full width, exclusive view | 380px, always visible | 420px |
| Map | Full width, exclusive view | Flex-1 | Flex-1 |
| Bottom navigation | Visible | Hidden | Hidden |
| Detail panel | Full width | 380px | 400px |
| List scroll padding | `pb-20` | `pb-4` | `pb-4` |
| Header nav links | Hidden | Visible | Visible |
| Header tagline | Hidden (`sm:block`) | Visible | Visible |
| Header CTA label | "Report" | "Report a Hazard" | "Report a Hazard" |
| User control | Hidden (`sm:block`) | Visible | Visible |
| API Docs | Hidden | Hidden | Visible (`xl`) |
| Install label | Icon only | Full | Full |

### Report form

| Element | Mobile | `sm`+ |
|---|---|---|
| Card padding | `px-4 py-4` | `sm:px-6 sm:py-5` |
| Category grid | 2 columns | 3 columns |
| Map picker height | `h-44` | `h-52` |
| Header padding | `px-4 py-3` | `sm:px-6 sm:py-4` |
| Photo preview | Stacked column | Row |
| Modal presentation | Bottom sheet, `rounded-t-2xl`, `92vh` | Centred, `rounded-2xl`, `88vh` |

The sticky header and footer keep the submit action reachable on a phone without scrolling
past the map picker — essential for a form completed outdoors.

### Auth screens

| Element | Mobile | `sm`+ |
|---|---|---|
| Card width | Full | `max-w-md` (448px) |
| Card padding | `p-6` | `sm:p-8` |
| Title | `text-xl` | `text-xl` |
| Sign In / Register drawer | 2-up grid | Separate links |

### Dashboards

| Element | Mobile | `sm` | `md` | `lg` |
|---|---|---|---|---|
| Metric tiles | 2 columns | 2 | 2 | 4 |
| Tab bar | Full width | Full | Full | Full |
| Report cards | 1 column | 1 | 2 | 2–3 |
| Data tables | Card-per-row | Card-per-row | Table | Table |

### Map embed

| Context | Mobile | `sm`+ |
|---|---|---|
| Report picker | `h-44` | `h-52` |
| Hero preview | `h-[360px]` | `h-[440px]` |
| Layer switcher | `top-3 right-3` | Same |
| Floating hero card | Full width | `sm:max-w-xs` |

---

## Orientation

### Portrait phone

- Map and list are mutually exclusive views, toggled by the bottom bar.
- Report modal presents as a bottom sheet with `rounded-t-2xl`.
- Bottom navigation is permanently visible.
- Header collapses to logo + actions + hamburger.

### Landscape phone

- Height is constrained; the map screen uses `h-screen overflow-hidden`, so the map fills
  the viewport with no page scroll.
- The bottom bar and header together consume meaningful vertical space, which is why the
  list uses `pb-20` clearance.

### Tablet

- `md` (768px) activates the split map layout with a 380px sidebar.
- Landing page moves to multi-column grids.
- Bottom navigation and mobile drawer disappear.

### Desktop

- `lg` widens the sidebar to 420px.
- `xl` reveals the API Docs link.
- Landing hero is a 6/6 split with a live map preview.
- Dashboards show four metric tiles and multi-column cards.

---

## Input modality

| Modality | Consideration | Implementation |
|---|---|---|
| Touch | Minimum 44 × 44px targets | All buttons and chips comfortably exceed this |
| Touch | No hover reliance | Hover effects are supplementary only |
| Touch | Prevent accidental zoom | `maximum-scale=1.0, user-scalable=no` |
| Touch | Stop scroll chaining in forms | `overscroll-contain` on the form body |
| Touch | Map must not hijack page scroll | `scrollWheelZoom={false}` in the picker |
| Mouse | Precise hover feedback | Border, shadow, and transform transitions |
| Mouse | Map zoom by wheel | Enabled on the browse map |
| Keyboard | Visible focus | `focus:ring-2` on buttons, teal border on inputs |
| Keyboard | Modal dismissal | Escape closes the report modal |

---

## Landscape and small-height

`h-screen w-screen flex flex-col overflow-hidden` on the map screen means the layout
adapts to viewport height rather than content height. The map fills whatever space the
header and bottom bar leave.

The report form's `max-h-[92vh]` (mobile) and `88vh` (desktop) keep the sticky footer
visible even on a short landscape viewport.

---

## Images and media

| Asset | Responsive behaviour |
|---|---|
| Hero map | `h-[360px] sm:h-[440px]` |
| Hazard photo (detail) | `rounded-lg overflow-hidden border`, full container width |
| Hazard photo preview | `w-24 h-20 object-cover` fixed thumbnail |
| Hero preview panel | `rounded-2xl overflow-hidden` at all sizes |
| Logo | `sm` / `md` / `lg` / `xl`, `shrink-0` |
| Photo compression | Client-side to max 1600 × 1600 WebP at q0.82 |

Photos are compressed before upload regardless of viewport — mobile data is the binding
constraint, not screen size.

---

## Print

RouteX does not define print stylesheets. The app is an interactive map application, and
the landing page's `print:` variants are unused.

---

## Testing checklist

| Check | Expectation |
|---|---|
| 320px width | No horizontal scroll; bottom nav labels readable |
| 375px (iPhone SE) | Hero CTAs stack; map fills viewport |
| 414px (iPhone Plus) | Same as 375px with more map area |
| 640px | Bottom nav hidden; header nav still hidden |
| 768px | Map splits into sidebar + map |
| 1024px | Sidebar widens; landing hero becomes 2 columns |
| 1280px | API Docs link appears; hero becomes 4-column features |
| Landscape phone | Header + bottom bar + map all fit without page scroll |
| Report modal | Bottom sheet on mobile, centred dialog on desktop |
| Rotating to portrait | Map re-validates size without grey tile gaps (`invalidateSize`) |
