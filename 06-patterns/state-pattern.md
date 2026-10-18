# Pattern — States

Every data-backed surface in RouteX defines four states. Consistency here is what makes
the interface feel dependable rather than improvised.

---

## The four states

| State | Condition | Treatment |
|---|---|---|
| **Loading** | Request in flight | Skeleton placeholders matching real geometry |
| **Error** | Request failed | Red-tinted panel, explanation, retry |
| **Empty** | Success, no data | Neutral panel with an optional action |
| **Populated** | Success, with data | The content itself |

`DemoDataBanner` adds a fifth, orthogonal state — seeded data present — which is disclosed
independently of whether the list is empty or full.

---

## Loading

### Skeletons over spinners

`HazardCardSkeleton` mirrors the real card's geometry exactly, including the pill-shaped
badge and rounded confirmation count. Three skeletons render by default.

| Element | Classes |
|---|---|
| Container | `p-4 rounded-xl border shadow-sm animate-pulse space-y-3` |
| Badge row | `h-5 w-24 rounded-full` + `h-4 w-16 rounded-md` |
| Title | `h-4 w-4 rounded-full` + `h-4 w-3/4 rounded` |
| Body | `h-3 w-full rounded` + `h-3 w-5/6 rounded` |
| Footer | `h-3 w-20 rounded` + `h-6 w-14 rounded-full` |
| Placeholder fill | `bg-slate-200 dark:bg-slate-700` |

**Why skeletons:** a spinner collapses the layout to a dot, so content jumps when data
arrives. Matching geometry means the list settles into place rather than reflowing.

### A11y

`role="status"`, `aria-label="Loading hazard details"`, plus an `sr-only` "Loading...".
Screen readers announce the change without exposing placeholder text.

### Optional message

`LoadingState` accepts a `message` rendered above the skeletons in
`text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1`:

- "Fetching road hazards..."
- "Fetching recent community reports..."

### In-button loading

Submit and optimise states replace the label with a `Loader2 animate-spin` spinner and
disable the button (`disabled:opacity-50`):

| Condition | Label |
|---|---|
| Idle | "Submit report" |
| Submitting | "Submitting report..." |
| Optimising photo | "Processing photo..." |

Submit is blocked entirely while a photo is mid-conversion, preventing a mismatched
form-data payload.

---

## Error

### Layout

| Property | Value |
|---|---|
| Container | `p-6 text-center bg-red-50/60 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/60` |
| Icon container | `w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60` |
| Icon | `AlertTriangle w-5 h-5 text-[#D64545] dark:text-red-400` |
| Title | `text-sm font-semibold` |
| Body | `text-xs max-w-xs` |
| Retry | Neutral button with `RefreshCw w-3.5 h-3.5` — "Try again" |

Default title: "Unable to load reports".
Default body: "We could not retrieve the road hazard reports right now. Check your
connection or try again."

### Retry is secondary, not primary

The retry button uses a white/bordered style rather than the teal primary button. An error
state should offer recovery **without** competing with normal navigation for attention.

### Landing page is the exception

The landing hero and live-pulse sections catch fetch failures and fall back to an empty
array **without rendering an error state**. A prospective visitor should not meet an error
banner before deciding whether to use the product. The empty state — which invites a
report — is the right treatment there.

---

## Empty

| Property | Value |
|---|---|
| Container | `p-8 text-center bg-white dark:bg-[#142533] rounded-lg border border-[#DCE4E8] dark:border-slate-800 shadow-xs` |
| Icon container | `w-12 h-12 rounded-full bg-[#F7F9FA] dark:bg-[#1B3142]` |
| Icon | `AlertCircle w-6 h-6 text-[#087F8C] dark:text-teal-400` |
| Title | `text-base font-semibold` |
| Body | `text-sm max-w-sm` |
| Action | `px-4 py-2 text-sm font-medium text-white bg-[#087F8C] hover:bg-[#0AA3B3] rounded-md` |

Default title: "No reports found".
Default body: "No reports match these filters. Try another filter or report a hazard you see."

### Empty states are invitations

Where a next step exists, it is offered as a primary teal button:

| Context | Action |
|---|---|
| Map sidebar | "Report a hazard" → opens the modal |
| Hero preview overlay | "Submit a report" → `/report` |
| Hero live pulse | "You can be the first to contribute!" |

An empty hazard map is not a failure — it is an unclaimed area. The design treats it as an
opening.

### Map hero empty overlay

Covers the map with `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs`, containing a
`MapPin w-10 h-10 text-slate-400`, a `text-sm font-bold` heading, `text-xs max-w-xs`
supporting copy, and a teal "Submit a report" button.

---

## Form errors

Three classes, treated distinctly.

### Field-level

`text-xs text-[#D64545]` directly beneath the field. Clears as soon as the field becomes
valid.

### Form-level

A red alert above the fields:

```
p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800
text-xs text-[#D64545] dark:text-red-300 rounded-lg flex items-center gap-2
```

with `AlertCircle w-4 h-4 shrink-0`.

### Message differentiation

| Condition | Message |
|---|---|
| 401 / 403 | Action-specific: "You must be signed in to submit a hazard report. Please sign in and try again." |
| Server validation | "Please correct the highlighted fields and try submitting again." + per-field errors |
| Network failure | "We could not save the report right now. Check your internet connection and try again." |

Naming the specific problem is more useful than a generic failure — a user who was
signed out knows to sign in; a user on a train knows to wait.

---

## Success

The report submission success state replaces the entire form:

| Property | Value |
|---|---|
| Container | `p-8 text-center rounded-2xl space-y-4` |
| Icon | `w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60` + `CheckCircle w-8 h-8 text-[#27865B] dark:text-emerald-300` |
| Title | `text-xl font-bold` — "Report Submitted" |
| Body | `text-xs sm:text-sm max-w-sm mx-auto leading-relaxed` |

Copy: *"Thank you for helping road users know what lies ahead. Your report is now live for
the community."*

Green for success, matching the `resolved` status colour.

### Delayed callback

`onSuccess` fires after **1200ms**, so the confirmation registers visually before the view
changes. Immediate dismissal would let the user miss their own success.

---

## Demo state

Orthogonal to loading/error/empty/populated. Renders when any visible hazard is seeded
sample data.

```
bg-[#F2B544]/20 dark:bg-amber-950/40
border-b border-[#F2B544]/40 dark:border-amber-800
text-xs text-[#142B3B] dark:text-amber-200
flex items-center justify-between
```

> **Demo data active:** Showing illustrative hazards for development. These are not
> real-time road closures.

Plus a monospace "Demo Mode" chip, and per-item `DemoDataBadge`s and amber map-marker
dots.

This is a safety guarantee, not decoration — seeded data read as a live road closure could
direct someone into danger.

---

## 404

Keeps the app chrome and recovers to the map:

| Element | Specification |
|---|---|
| Icon | `MapPin` in a `w-12 h-12 rounded-full` teal-tinted circle |
| Headline | `text-2xl sm:text-3xl font-extrabold` |
| Body | `text-sm text-[#667784]` |
| Actions | Primary "Explore the map" + secondary link home |

---

## Route guard states

Moderator and admin pages redirect unauthorised users to `/` when `isModerator` /
`isAdmin` is false. Session loading is tracked separately (`authLoading`) so a redirect
does not fire during the initial `/auth/me/` request.

Frontend guards are convenience only — the server enforces the real permission boundary.

---

## Rules

| # | Rule |
|---|---|
| 1 | **Never leave a surface blank.** Every async region defines all four states. |
| 2 | **Errors are recoverable.** Offer retry wherever retrying is meaningful. |
| 3 | **Empty states invite action.** Where a next step exists, offer it. |
| 4 | **Loading preserves geometry.** Skeletons match the shape of real content. |
| 5 | **Uncertainty is stated.** Demo and stale data are disclosed in the surface itself. |
| 6 | **Never discard user work.** Errors retain field values and typed rationale. |
| 7 | **Pre-empt the misleading misreading.** Say what the data is not, where it is shown. |
