# Pattern — Badges

Badges are RouteX's densest information channel. In a hazard list, three badges in the top
row communicate type, lifecycle state, and reliability at a glance.

---

## Four badge families

| Family | Purpose | Carries |
|---|---|---|
| **Category** | What kind of hazard | Icon + label + category colour |
| **Status** | Where it is in the lifecycle | Label + status colour |
| **Freshness** | How much to trust it | Clock icon + age label + stale flag |
| **Role / Demo** | Who and what data | Label + identity colour |

A hazard card shows the first three side by side. Role appears in the header; demo appears
alongside freshness wherever seeded data is visible.

---

## Category

Driven entirely by `HAZARD_CATEGORIES` in `hazardConstants.js`.

| Category | Icon | Marker | Badge bg | Badge text |
|---|---|---|---|---|
| Flooding | `Droplets` | `#087F8C` | `bg-blue-100` | `text-blue-800` |
| Pothole | `CircleAlert` | `#F2B544` | `bg-amber-100` | `text-amber-800` |
| Blocked road | `ShieldAlert` | `#D64545` | `bg-red-100` | `text-red-800` |
| Fallen tree | `Trees` | `#27865B` | `bg-emerald-100` | `text-emerald-800` |
| Other | `AlertCircle` | `#667784` | `bg-slate-100` | `text-slate-800` |

Sizes: `sm` = `text-xs px-2 py-0.5` with a `w-3 h-3` icon; `lg` = `text-sm px-2.5 py-1`
with `w-4 h-4`. `showIcon={false}` renders the label alone for very dense contexts.

### Icon inconsistency across contexts

| Context | Flooding | Pothole | Blocked road | Fallen tree | Other |
|---|---|---|---|---|---|
| `CategoryBadge` | `Droplets` | `CircleAlert` | `ShieldAlert` | `Trees` | `AlertCircle` |
| Report form | `Droplets` | `CircleDot` | `AlertTriangle` | `TreePine` | `HelpCircle` |
| Landing tiles | `Droplets` | `Cone` | `AlertTriangle` | `TreePine` | `Layers` |

The badge and form icons are the canonical pair — the same mapping appears in both, so a
user who learns it in the form recognises it in every badge. Landing tile icons are
decorative (a road cone for potholes is more evocative at large size) and are not a
teaching surface.

### Fallback

An unrecognised category id falls back to the slate treatment (`bg-slate-100`,
`text-slate-800`, `#667784` marker, label = the raw id). A new hazard type therefore
renders safely without touching a component.

---

## Status

Driven by `getStatusBadgeStyle(status)`.

| Status | Background | Text | Border |
|---|---|---|---|
| `reported` | `#667784` @ 15% | `#142B3B` | `#667784` @ 30% |
| `under_review` | `#F2B544` @ 20% | `#855B09` | `#F2B544` @ 40% |
| `community_confirmed` | `#087F8C` @ 15% | `#087F8C` | `#087F8C` @ 30% |
| `resolved` | `#27865B` @ 15% | `#27865B` | `#27865B` @ 30% |
| `rejected` | `#D64545` @ 15% | `#D64545` | `#D64545` @ 30% |

Layout: `text-[11px] font-medium px-2 py-0.5 rounded-full border` in lists, and
`text-xs px-2 py-0.5 rounded-full border` in the detail panel header.

Labels come from the API as `status_display` ("Community Confirmed", "Under Review"), with
the raw status as fallback — the server owns human-readable wording.

### Colour semantics

| Colour | Status | Reasoning |
|---|---|---|
| Slate | `reported` | Neutral — a claim awaiting corroboration |
| Teal | `community_confirmed` | The brand colour — corroborated by peers |
| Amber | `under_review` | In progress, attention needed |
| Green | `resolved` | Complete, positive |
| Red | `rejected` | Negative outcome |

Teal on `community_confirmed` is deliberate: the most important state in the dataset wears
the brand colour, so scanning a list for high-confidence reports is instant.

---

## Freshness

RouteX's core trust mechanism. **Every** hazard surface shows one.

| State | Background | Text | Border |
|---|---|---|---|
| Fresh | `bg-slate-100` | `#667784` | — |
| **Stale** | `bg-amber-100` | `#855B09` | `border-amber-200` |

Icon: `Clock w-3 h-3 shrink-0`. Layout:
`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full`.

### Label logic

The API `freshness.label` is preferred. Otherwise derived from `created_at`:

| Age | Label | Stale |
|---|---|---|
| ≤ 1 min | "Reported just now" | No |
| < 60 min | "Reported N minutes ago" | No |
| < 24 h | "Reported N hour(s) ago" | No |
| ≥ 24 h | "Reported N day(s) ago" | **Yes at ≥ 2 days** |

Proper singular/plural handling throughout ("1 hour ago", "3 hours ago").

### The stale threshold

Stale is triggered at **2 days** client-side, while the API exposes a
`freshness_hours` platform setting (default 24) that administrators can tune. The
client-side fallback is deliberately more conservative than the server default, so a
client that has not yet received `freshness` data does not over-warn.

### Stale reports are marked, never deleted

Amber, not red. A stale report is not wrong — it is simply uncertain, and removing it
would hide information. Marking preserves the record while prompting the community to
confirm or flag.

### Tooltip

`title` on stale: *"This report may be out of date. Check the latest updates."* — gives the
colour a plain-language explanation on hover.

---

## Role

Identifies the permission tier. The three colours match the three navigation identities.

| Role | Chip | Short label | Full label |
|---|---|---|---|
| Administrator | `bg-purple-900/60 text-purple-300 border-purple-700` | "Admin" | "Platform Administrator" |
| Moderator | `bg-amber-900/60 text-amber-300 border-amber-700` | "Mod" | "Community Moderator" |
| Citizen | `bg-teal-900/60 text-teal-300 border-teal-700` | "Citizen" | "Citizen Contributor" |

Shared classes: `text-[9px] uppercase px-1.5 py-0.2 rounded font-bold` in the header chip.

The short form fits the header; the dropdown uses the full label so the tier is spelled
out where there is room.

> **Known inconsistency:** the header chip uses `purple-*` while the dropdown menu link and
> admin navigation use `indigo-*`. Both are purple-family and function identically, but
> they should be unified to `indigo-*` for consistency.

---

## Demo data

Discloses seeded sample data.

| Context | Presentation |
|---|---|
| Hazard card | `text-[10px] uppercase font-mono px-1.5 py-0.5 rounded` — `bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800` |
| Detail panel | Same palette, `text-xs`-ish sizing |
| Landing preview header | `text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border-amber-500/40` |
| Map marker | 10px amber dot, `title="Demo report"` |

`font-mono` distinguishes technical annotations from content labels. Amber is reused
because demo data is a form of "use with caution", consistent with stale reports.

The `DemoDataBanner` extends this from a per-item badge to a page-level notice:

> **Demo data active:** Showing illustrative hazards for development. These are not
> real-time road closures.

---

## Avatar

| Property | Value |
|---|---|
| Size | `w-5 h-5 rounded-full` |
| Background | `#087F8C` |
| Text | white, `text-[10px] font-bold uppercase` |
| Content | First character of `display_name`, falling back to `username` |

A single initial is used rather than a photo — accounts have no avatars, and a coloured
initial plus the adjacent `RoleBadge` is sufficient identification.

---

## Badge composition rules

| Rule | Reason |
|---|---|
| Badges sit **side by side**, never nested | Nesting produces unreadable double-borders |
| Category leads, then status, then freshness | Descending importance |
| Every badge carries a text label | Colour alone excludes colour-blind users |
| `rounded-md` for category, `rounded-full` for status/freshness | Category is a filled chip; status and freshness are lighter pills — the shape difference separates the semantic families before reading colour |
| Icons inherit `currentColor` | One definition works in both themes |
| Never hardcode category styling at a call site | Use `getCategoryConfig()` / `getStatusBadgeStyle()` |

---

## Confirmation count

Not a badge, but grouped with them in the card footer.

| Property | Value |
|---|---|
| Icon | `ThumbsUp w-3 h-3` in `#087F8C` / dark `teal-400` |
| Text | `text-[11px] font-medium` |
| Contexts | "N confirmed" (hero), bare number (card), "N confirmation(s)" (live pulse, pluralised) |

The count always has an icon — never a bare number, which would read as arbitrary.
