# Components — Cards & Panels

## HazardCard

The list item representing one hazard report. Used in the map sidebar and dashboard lists.

| Property | Value |
|---|---|
| Layout | `p-3.5 rounded-lg border cursor-pointer text-left` |
| Background | white / dark `#142533` |
| Border | `#DCE4E8` / dark `slate-700/80`, hover to `slate-300` / `slate-600` |
| Transition | `transition-all`, hover `shadow-xs` |

### Selected state

`bg-white dark:bg-[#182C3A] border-[#087F8C] ring-2 ring-[#087F8C]/20 shadow-sm`

A teal border **plus** a teal ring is used so selection is distinguishable without
relying on colour alone for users who cannot perceive the hue difference.

### Anatomy (top to bottom)

1. **Row** — `CategoryBadge` left, `StatusBadge` right
2. **Title** — `text-sm font-semibold line-clamp-1`; falls back to formatted coordinates
   (`Lat: x.xxxx, Lng: x.xxxx`) when no `location_label` exists
3. **Description** — `text-xs line-clamp-2` in muted slate
4. **Footer** (hairline top border) — `FreshnessBadge` left; `DemoDataBadge` and
   confirmation count right

### Coordinate fallback

```
Lat: 6.453100, Lng: 3.395800
```

Coordinates are always shown to **4 decimal places** when a report has no street label, so
a citizen can always locate the hazard even without descriptive text.

## Landing feature card

| Property | Value |
|---|---|
| Layout | `p-6 rounded-2xl flex flex-col justify-between h-full` |
| Background | `#F7F9FA` / dark `#142533` |
| Border | `#DCE4E8` / dark `slate-800` |
| Hover | `border-[#087F8C]/50`, `shadow-md`, `hover:-translate-y-1` |
| Transition | `transition-all` |

### Anatomy

1. Icon container (`w-10 h-10 rounded-xl`, teal tint)
2. Title — `text-sm font-bold`
3. Body — `text-xs leading-relaxed` muted
4. Footer (hairline top border) — either a text link with an arrow that nudges on hover,
   or a static muted descriptor when there is no destination

Cards are `h-full` with `justify-between` so footers align across a row regardless of
body length.

## "How it works" step card

| Property | Value |
|---|---|
| Layout | `p-6 sm:p-7 rounded-2xl` |
| Background | white / dark `#142533` |
| Border | `#DCE4E8` / dark `slate-800` |
| Shadow | `shadow-sm` → hover `shadow-md` |
| Hover | `hover:-translate-y-1` |

### Anatomy

1. Header row — oversized step numeral left, icon container right
2. Title — `text-base font-bold`
3. Body — `text-xs leading-relaxed`

### Step numeral

`text-4xl font-black font-mono` in `#087F8C` at **20% opacity**, rising to 40% on hover.

Using a very low-opacity brand tint means the numerals act as watermark texture rather
than competing with the headline. `font-mono` gives them a technical, index-like quality
that separates them typographically from the rest of the page.

## Hazard category tile (landing)

An interactive card that filters the map by category.

| Property | Value |
|---|---|
| Layout | `p-5 rounded-2xl h-full text-left flex flex-col justify-between` |
| Background | white / dark `#142533` |
| Border | `#DCE4E8` / dark `slate-800`, hover `border-[#087F8C] dark:hover:border-teal-500` |
| Hover | `shadow-lg`, `hover:-translate-y-1.5`, icon `group-hover:scale-110` |

### Anatomy

1. Icon container `w-11 h-11 rounded-xl` (teal tint)
2. Title — `text-sm font-bold`, turns teal on hover
3. Description — `text-xs leading-snug`
4. Footer link — "View on map" with a chevron that nudges right on hover

Navigates to `/map?category={id}`, so the category selection is shareable as a URL.

## Hazard category tile (report form)

A selectable option inside the report form.

| Property | Value |
|---|---|
| Layout | `p-2.5 rounded-xl border text-left flex flex-col justify-between` |
| Grid | `grid-cols-2 sm:grid-cols-3 gap-2` |
| Background (unselected) | white / dark `#1A2E3D` |
| Border (unselected) | `#DCE4E8` / dark `slate-700/80`, hover to `slate-300` / `slate-600` |
| Background (selected) | `#087F8C` @ 10% / dark @ 20% |
| Border (selected) | `#087F8C` with `ring-2 ring-[#087F8C] shadow-xs` |

### Anatomy

1. Icon + title row — icon turns teal when selected
2. Description — `text-[10px] line-clamp-1`

Selection is indicated by border, ring, background tint, **and** icon colour, so it is
identifiable without relying on colour perception.

## Hazard details panel

The slide-over presenting a single report in full.

| Property | Value |
|---|---|
| Width | `w-full sm:w-[380px] md:w-[400px]` |
| Height | `h-full` |
| Background | white / dark `#142533` |
| Border | `border-l border-[#DCE4E8] dark:border-slate-800` |
| Overflow | `overflow-y-auto` |
| Entrance | `slide-in-from-right duration-200` |

### Structure

- **Sticky header** (`p-4 border-b`, `bg-white dark:bg-[#142533] z-10`) — badge row
  (category + status + demo), title `text-base font-bold`, close button. Stays pinned
  while content scrolls.
- **Scrollable body** (`p-4 space-y-4`) — photo (if present), title/description,
  confirmation action, flag form, coordinate and timestamp metadata.
- Anchored over the right edge of the map, above the map (`z-1000`).

### Date formatting

Timestamps use `toLocaleString("en-GB")` with `day`, `month`, `year`, `hour`, `minute` —
24-hour, day-first format for unambiguous international reading.

## Trust & trust-safety card

Used in the landing safety section.

| Property | Value |
|---|---|
| Layout | `p-6 rounded-2xl` |
| Background | white / dark `#142533` |
| Border | `#DCE4E8` / dark `slate-800` |
| Shadow | `shadow-xs` → hover `shadow-sm` |

### Anatomy

Title row pairs a `w-4 h-4` icon with a `text-sm font-bold` heading. Icon colours
distinguish the principle: teal `ShieldCheck` (community reports), amber `Clock` (report
age), green `ThumbsUp` (confirmations), red `Flag` (moderation queue).

## Advisory / disclaimer box

Reserved for honesty and safety messaging. Two variants exist.

### Amber advisory

`p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200`

Layout is a `flex items-start gap-3.5` with a `w-5 h-5` `Info` icon. Body contains a bold
title line then the explanation. Used for the landing safety notice.

### Navy pledge panel

`p-7 rounded-2xl bg-[#142B3B] text-white border border-slate-700`

Reversed-out card used where the content is a positive commitment rather than a warning.
Contains a numbered list where each item has a `w-6 h-6 rounded-full` teal numeral.

### Two-column comparison (RouteX vs Emergency)

Two `p-4 rounded-xl` sub-cards side by side, tint-coded by intent:

| Card | Tint |
|---|---|
| Report on RouteX | `bg-teal-50/60 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40` |
| Dial 112 / 911 | `bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40` |

This split is a deliberate safety design decision — the interface teaches users *when not*
to use it.

## Empty / error / loading states

See [`states-and-feedback.md`](states-and-feedback.md).

## Auth card

Used by Login, Register, Forgot Password, and Reset Password pages.

| Property | Value |
|---|---|
| Width | `w-full max-w-md` |
| Layout | `rounded-2xl p-6 sm:p-8` |
| Background | white / dark `#142533` |
| Border | `border-slate-200 dark:border-slate-800` |
| Shadow | `shadow-sm` |
| Centring | `flex-1 flex items-center justify-center p-4 py-12` |

### Anatomy

1. Centred logo — `RouteXLogo size="lg"`
2. Title — `text-xl font-bold`
3. Subtitle — `text-xs text-[#667784]`
4. Optional error alert
5. Form fields (`space-y-4`)
6. Footer links

## PWA showcase panel

The navy gradient install section on the landing page.

| Property | Value |
|---|---|
| Section background | `bg-gradient-to-b from-[#142B3B] to-[#0B161E] text-white` |
| Panel | `p-8 md:p-12 rounded-3xl bg-[#142533]/80 border border-slate-700/80 shadow-2xl backdrop-blur-md` |
| Layout | `flex flex-col lg:flex-row lg:items-center justify-between gap-8` |

Left side holds the eyebrow pill, `text-2xl sm:text-4xl font-extrabold tracking-tight`
headline, body copy, and a `grid-cols-2 sm:grid-cols-3 gap-3` checklist with teal
`Check` icons. Right side holds the stacked install / launch buttons.

## Lower CTA panel

`bg-[#142B3B] text-white py-20` with a teal-to-amber horizontal gradient wash at low
opacity behind the content.

Headline `text-3xl sm:text-5xl font-extrabold tracking-tight`, body `text-sm sm:text-base
text-slate-300`, and two buttons (`w-full sm:w-auto`) — an inverted white "Explore the
map" and a filled teal "Report a hazard".
