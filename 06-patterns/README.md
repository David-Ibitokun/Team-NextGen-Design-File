# Patterns — README

Recurring implementation patterns that appear across multiple components and screens.

## Contents

| Pattern | Covers |
|---|---|
| [`map-pattern.md`](map-pattern.md) | Map rendering, tiles, markers, overlays, lifecycle helpers, embed vs. standalone |
| [`badge-pattern.md`](badge-pattern.md) | The four badge families, colour semantics, data-driven styling |
| [`state-pattern.md`](state-pattern.md) | Loading / error / empty / populated states and their consistency rules |
| [`nav-pattern.md`](nav-pattern.md) | Header, drawer, bottom nav, tab bars, and responsive navigation switching |

---

## Pattern principles

| Principle | Meaning |
|---|---|
| **One definition, many contexts** | A component behaves consistently everywhere it appears; context is a prop, not a fork |
| **Data-driven styling** | Colours and labels come from `hazardConstants.js`, never hardcoded at a call site |
| **Colour never alone** | Every status, category, and selection state is also communicated by text, an icon, a ring, or a border change |
| **Explicit both themes** | Light and dark values are both designed; nothing relies on automatic inversion |
| **Context preserved** | Overlays and deep links keep the user where they were |
| **Honest surfaces** | Uncertainty, demo data, and scope limits appear where the data appears |

---

## The single most important pattern

**Category and status colour is data, not styling.**

```js
// frontend/src/utils/hazardConstants.js
{
  id: "pothole",
  label: "Pothole",
  description: "Deep crater, road surface damage, or sinkhole",
  badgeBg: "bg-amber-100",
  badgeText: "text-amber-800",
  markerColor: "#F2B544",
}
```

This single record drives the landing category tiles, the report form tiles, the
`CategoryBadge` in every list and panel, the map marker fill, and the filter chips.
Adding or recolouring a category is a one-file change that propagates everywhere — and no
call site can drift out of sync.

The same applies to status, where `getStatusBadgeStyle(status)` returns the complete class
string, keeping the five status treatments consistent across `HazardCard`, the detail
panel, and dashboard lists.

---

## Cross-cutting consistency

### The same component in two hosts

`ReportHazardForm` renders as both a full page and a modal, switched by `isModal`. One
implementation, two presentations — guaranteeing a mobile page and a desktop dialog cannot
drift apart.

The map application shell likewise exists twice: `HomePage` (local filter state) and
`MapPage` (URL-synced filter state). Same layout, same components, one behavioural
difference.

### Selection expressed three ways

A selected hazard card changes **border colour**, **ring**, **background**, and **shadow**.
A selected form tile changes **border**, **ring**, **background tint**, and **icon
colour**. Selection is never communicated by hue alone.

### Dense vs. spacious density

| Density | Surfaces | Type | Card padding | Section rhythm |
|---|---|---|---|---|
| Spacious | Landing, auth, 404 | `text-base`–`text-6xl` | `p-6`/`p-8` | `py-16`/`py-24` |
| Dense | Map, form, dashboards | `text-xs`–`text-sm` | `p-3.5`/`p-5` | `py-4`/`py-5` |

Both share identical colour, icon, badge, and component definitions, so the app reads as
one system whether a user is being persuaded or working.

---

## Anti-patterns to avoid

| Anti-pattern | Why | Do instead |
|---|---|---|
| Hardcoding a category colour in a component | Drift across surfaces; a category recolour becomes a multi-file hunt | Read from `hazardConstants.js` |
| Hardcoding `192.168.x.x` addresses | Breaks for any teammate or user | Use `localhost` / `127.0.0.1` |
| Removing the demo banner when data is seeded | Seeded data read as live road closures is a safety failure | Keep the banner and marker badges |
| Removing mandatory rationale to reduce clicks | Destroys the audit trail and allows arbitrary suppression | Keep it; it is the accountability mechanism |
| Building a second form implementation for mobile | Guarantees divergence | Use the `isModal` prop |
| Relying on automatic dark-mode inversion | Muddy, low-contrast results | Define explicit dark values |
| Removing Leaflet's attribution | Violates OpenStreetMap and Esri tile policies | Keep it visible and restyled, not removed |
| Auto-removing a report on flag threshold | Removes human judgement from content removal | Escalate to the moderation queue |
