# Screen — Landing Page (`/`)

The public entry point and primary marketing surface. Its job is to explain the product,
establish trust, and route visitors into the map.

**Component:** `frontend/src/pages/LandingPage.jsx`
**Sections:** 9

---

## Section 1 — Hero

Two-column split (`lg:grid-cols-12`, `lg:col-span-6` each).

### Ambient background

Two blurred colour orbs sit behind the content at `-z-10`:

| Position | Size | Colour |
|---|---|---|
| `top-0 right-1/4` | `w-96 h-96` | `bg-teal-500/5 dark:bg-teal-500/10` |
| `bottom-0 left-10` | `w-80 h-80` | `bg-amber-500/5` |

Both use `rounded-full blur-3xl pointer-events-none`. They add depth without affecting
text contrast.

### Left column — copy

| Element | Specification | Reveal |
|---|---|---|
| Eyebrow pill | `COMMUNITY-POWERED ROAD AWARENESS` with an animated teal dot — currently commented out in code | `up`, 50ms |
| Headline | `Know The Road Ahead.` — `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]` | `up`, 150ms |
| Body | `text-base sm:text-lg text-[#667784] leading-relaxed max-w-xl` — "Discover community-reported road hazards on the roads and corridors you travel…" | `up`, 250ms |
| Actions | Primary "Explore the map" + secondary "Report a hazard", stacked on mobile | `up`, 350ms |
| Reassurance | `text-xs` with an `Info` icon — "Reports are community-submitted. Always check timestamps and current conditions." | `up`, 450ms |

The reassurance line sits directly beneath the CTAs so the trust caveat is read **before**
the user commits, not after.

### Primary CTA

`inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#087F8C]
hover:bg-[#0aa3b3] rounded-lg shadow-sm hover:shadow-md`

Icon: `MapPin w-4 h-4` with `group-hover:scale-110`. Links to `/map`.

### Secondary CTA

White / dark surface with a `border-slate-300` border. Icon: `PlusCircle w-4 h-4
text-[#087F8C]` with `group-hover:rotate-90 duration-200`.

Behaviour: if signed out, routes to `/login?next=/report`; if signed in, routes to
`/report`.

### Right column — live map preview

| Element | Specification |
|---|---|
| Wrapper | `RevealOnScroll direction="scale" delay={200} duration={800}` |
| Panel | `rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl` |
| Header bar | `bg-[#142B3B] dark:bg-[#0B161E] px-4 py-3 text-xs border-b border-slate-700/80` |
| Map height | `h-[360px] sm:h-[440px]` |

Fetches live hazards on mount and selects the first one. Shows the empty-state overlay
when the API returns nothing. Renders the floating hazard card when a hazard is selected.
A "Demo data" chip appears in the header bar when any result is seeded sample data.

---

## Section 2 — Trust strip

White / dark `#101F2B` surface with hairline top and bottom borders, `py-6`.
Three columns (`md:grid-cols-3`) of icon + heading + description:

| Icon | Heading | Description |
|---|---|---|
| `Users` | Community-powered reports | "Contributed directly by commuters, drivers, and local road users." |
| `Clock` | Clear timestamps and updates | "See exactly when reports were submitted or confirmed recently." |
| `CheckCircle2` | Transparent report status | "Know whether a report is freshly reported, confirmed, or under review." |

Each icon sits in a `w-11 h-11 rounded-xl` teal-tinted tile with a teal border. Reveal
delays: 50ms, 150ms, 250ms.

---

## Section 3 — How it works

Centred heading block (`max-w-2xl mb-14`) then three step cards (`md:grid-cols-3 gap-8`).

Eyebrow: "Three Simple Steps" · Headline: "How RouteX Works" · Body: "A transparent civic
platform built to keep road users and commuters informed."

| # | Icon | Title | Description |
|---|---|---|---|
| 01 | `Compass` | Explore the map | "See reported hazards in the area you care about. Filter by type, status, and recent activity." |
| 02 | `Camera` | Share what you see | "Report a pothole, flooded road, blocked route, fallen tree, or another hazard with a location and optional photograph." |
| 03 | `ThumbsUp` | Help keep reports useful | "Confirm a hazard when it is still present, flag inaccurate information, and check the latest report activity." |

Reveal delays: 100ms, 200ms, 300ms.

---

## Section 4 — Feature showcase

White / dark `#101F2B` surface with hairline borders, `py-16 lg:py-24`.
Four cards (`lg:grid-cols-4 md:grid-cols-2`).

Eyebrow: "Platform Capabilities" · Headline: "Engineered for Road Awareness"

| Icon | Title | Body | Footer |
|---|---|---|---|
| `MapPin` | Interactive hazard map | Browse markers, open details, inspect coordinates and landmarks | Link → `/map` |
| `Camera` | Simple hazard reporting | Select category, choose location, describe, attach photo | Button → `/report` |
| `ThumbsUp` | Community updates | Eligible users confirm ongoing hazards and flag reports | Static: "Active peer confirmation" |
| `Clock` | Report transparency | Show creation and last-confirmation times; mark stale reports | Static: "Honest freshness tracking" |

Reveal delays: 100ms, 200ms, 300ms, 400ms.

---

## Section 4.5 — Live community road pulse

Slate-50 / dark `#0E1A24` surface, `py-16`.

Left: a pill with a pulsing `Activity` icon reading "Live Incident Stream", then
`text-2xl sm:text-3xl font-extrabold` "Recent Community Observations" and supporting copy.
Right: a "View all on live map" link with an arrow that nudges on hover.

Body shows the **three most recent hazards** as cards, revealing at
`idx * 150ms`. Each card carries category + freshness badges, a `line-clamp-1` title, a
`line-clamp-2` description, and a footer with the confirmation count and an "Inspect"
link that deep-links to `/map?lat={lat}&lng={lng}`.

### Section states

| State | Presentation |
|---|---|
| Loading | "Fetching recent community reports..." centred, `text-xs text-slate-400` |
| Empty | Bordered white card — "No active road hazards currently reported. You can be the first to contribute!" |
| Populated | Three-card grid |

This is the first place a visitor sees real data from their own area.

---

## Section 5 — Hazard categories

Five interactive tiles (`lg:grid-cols-5 sm:grid-cols-3 grid-cols-2 gap-4 sm:gap-5`).

Eyebrow: "Hazard Categories" · Headline: "Five Supported Categories" · Body: "Click any
category to view current reports filtered on the map."

| Category | Icon | Description |
|---|---|---|
| Flooding | `Droplets` | Deep standing water, impassable road, or drainage overflow |
| Pothole | `Cone` | Deep crater, road surface damage, or sinkhole |
| Blocked road | `AlertTriangle` | Broken vehicle, accident, or road obstruction |
| Fallen tree | `TreePine` | Fallen tree, hanging branch, or fallen pole/cables |
| Other hazard | `Layers` | Dangerous road situation not covered above |

Each tile navigates to `/map?category={id}`. Hover lifts the tile, scales the icon, turns
the title teal, and nudges the chevron. Reveal delays: `idx * 100ms`.

---

## Section 5.5 — Emergency advisory & citizen pledge

Two-column grid (`lg:grid-cols-2 gap-8 items-stretch`).

### Left — RouteX vs emergency services

White card with a rose "Emergency Advisory" pill, the headline "When to Use RouteX vs
Emergency Services", and a two-up comparison:

| Report on RouteX (`Check` icon, teal tint) | Dial 112 / 911 (`ShieldAlert` icon, rose tint) |
|---|---|
| Severe road potholes & surface cracks | Accidents with injuries or trapped victims |
| Standing rainwater & street flooding | Active vehicle or structural fires |
| Broken branches or debris in transit lanes | Fallen electrical high-voltage lines |
| Stalled vehicles causing traffic slowdown | Armed robbery or immediate danger |

Reveals from the left (`direction="left" delay={100}`).

### Right — Citizen observer pledge

Reversed-out navy card (`bg-[#142B3B] text-white`) with a teal "Citizen Observer Pledge"
pill, the headline "Four Principles of Civic Responsibility", and a numbered list:

1. **Never report while driving** — only photograph or place pins when parked safely, or as a passenger or pedestrian.
2. **Precise pin placement** — zoom into the intersection to drop the marker on the affected roadway.
3. **Objective descriptions** — state what is present (depth, lane affected) rather than speculative commentary.
4. **Confirm or flag truthfully** — verify active hazards to elevate status; flag resolved or inaccurate submissions.

Reveals from the right (`direction="right" delay={200}`).

This section is the platform's clearest expression of its civic-safety position: it
teaches users when *not* to reach for the app.

---

## Section 6 — Safety and trust

Slate-100/70 / dark `#0E1A24` surface, `max-w-5xl` container.

Left-aligned heading (`max-w-2xl mb-12`): eyebrow "Integrity & Governance", headline
*"Useful information. Clear about what we know."*, and supporting copy about transparency
of data origins and freshness.

Four principle cards (`md:grid-cols-2 gap-6`):

| Icon | Icon colour | Title |
|---|---|---|
| `ShieldCheck` | teal `#087F8C` | Community-submitted reports |
| `Clock` | amber `#F2B544` | Report age and freshness |
| `ThumbsUp` | green `#27865B` | Community confirmations |
| `Flag` | red `#D64545` | Moderator review queue |

Reveal delays: 100ms, 200ms, 300ms, 400ms.

### Honest safety notice

A full-width amber advisory box (`mt-8`, reveal at 500ms):

> **Honest Safety Notice**
> RouteX never claims to guarantee safe journeys or provide officially certified road
> closures. Road conditions change constantly. Always follow official signage, emergency
> instructions, and exercise sound personal driving judgement.

---

## Section 7 — FAQ

Centred heading (`max-w-4xl mx-auto`), then seven accordion items (`space-y-3`).

Item: `rounded-xl border bg-white dark:bg-[#142533] overflow-hidden shadow-xs`.
Button is a full-width `w-full py-4 px-5 flex items-center justify-between gap-4` with
`aria-expanded`, and the answer panel gets `px-5 pb-5 pt-1 text-xs leading-relaxed
border-t`.

The chevron is `text-slate-400`, rotating 180° and turning teal when open
(`duration-200`). Reveal delays: `idx * 60ms`.

### Questions

1. **What is RouteX?** — what the platform is and who it serves.
2. **Can anyone browse the map?** — yes, no account needed for browsing, filtering, and inspection.
3. **How do I report a road hazard?** — account, category, map pin, description, optional photo.
4. **Does a community-confirmed report mean the road was officially inspected?** — no; confirmations are timely peer activity, not official inspection.
5. **What happens when a report gets old?** — age and timestamps are displayed; stale reports are marked, not deleted.
6. **Do I need to allow access to my location?** — no; geolocation is optional and never tracks in the background.
7. **Can I report a hazard without a photo?** — yes; never photograph while driving.

Question 4 is deliberately included — pre-empting the most dangerous misunderstanding is a
design responsibility, not a documentation one.

---

## Section 7.5 — PWA install showcase

Full-bleed `bg-gradient-to-b from-[#142B3B] to-[#0B161E] text-white`, `py-16`.

Left side: a teal-tinted "Native-Like Web App" pill with a `Smartphone` icon, a
`text-2xl sm:text-4xl font-extrabold tracking-tight` headline "Install RouteX on Any
Device.", body copy naming iOS, Android, macOS, and Windows, and a three-item checklist
with teal `Check` icons: "Zero App Store Bloat", "Offline Shell Cache", "Low Data
Bandwidth".

Right side: two stacked buttons — the primary teal install action (label switches between
"Install RouteX App" and "Add to Home Screen" depending on `beforeinstallprompt`
availability) and an outlined "Launch in Browser" link to `/map`.

If `beforeinstallprompt` never fires (iOS Safari, Firefox), clicking install shows a
`confirm()`-style alert explaining how to add to the home screen manually.

---

## Section 8 — Lower CTA

`bg-[#142B3B] text-white py-20 text-center relative overflow-hidden`, with a subtle
horizontal teal-to-amber gradient wash behind the content.

`RevealOnScroll direction="scale" delay={100} duration={700}` wrapping:

- Headline — *"Help make road information more useful for everyone."* (`text-3xl sm:text-5xl font-extrabold tracking-tight`)
- Body — "Explore existing reports or contribute an update from your community."
- Two buttons, `w-full sm:w-auto`: inverted white "Explore the map" (teal `MapPin` icon) and filled teal "Report a hazard".

---

## Section 9 — Footer

See [`../03-components/navigation.md`](../03-components/navigation.md#footer).

Four columns (`md:grid-cols-4`): brand block spanning two columns, Navigation, Resources.
Bottom bar with the copyright and the OpenStreetMap / no-tracking compliance note.

---

## Page-level behaviour

| Behaviour | Detail |
|---|---|
| Data fetch | On mount, via `hazardService.getHazards()`; handles both paginated `{results}` and array responses |
| Failure | Silently sets an empty array — the landing page never shows an error state, since a failed fetch should not alarm a prospective user |
| Reveal animation | Every section uses `RevealOnScroll` |
| FAQ state | `activeFaq` holds a single index (accordion, not multi-open) |
| Install state | `installPrompt` captured from `beforeinstallprompt`, cleared on `userChoice` |
| Theme | Full dark mode support throughout |

## Anchor links

| Anchor | Target |
|---|---|
| `/#how-it-works` | Section 3 |
| `/#features` | Section 4 |
| `/#safety-and-trust` | Section 6 |
| `/#faq` | Section 7 |
