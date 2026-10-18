# Components — States & Feedback

Every data-backed surface defines all four states: loading, error, empty, and populated.
Consistency here is what makes the interface feel dependable.

## LoadingState

Renders skeleton placeholders rather than a spinner, so layout does not jump when data
arrives.

### HazardCardSkeleton

| Element | Specification |
|---|---|
| Container | `p-4 bg-white dark:bg-[#142533] rounded-xl border border-[#DCE4E8] dark:border-slate-800 shadow-sm animate-pulse space-y-3` |
| Badge row | `h-5 w-24 rounded-full` + `h-4 w-16 rounded-md` |
| Title row | `h-4 w-4 rounded-full` + `h-4 w-3/4 rounded` |
| Body | `h-3 w-full rounded` + `h-3 w-5/6 rounded` |
| Footer | `h-3 w-20 rounded` + `h-6 w-14 rounded-full` |
| A11y | `role="status"`, `aria-label="Loading hazard details"`, plus `sr-only` "Loading..." |

Skeleton shapes mirror the real HazardCard geometry, including the pill-shaped badge and
the rounded confirmation count.

### LoadingState

| Property | Value |
|---|---|
| Container | `w-full space-y-3 py-2` |
| Count | `count = 3` skeletons by default |
| Optional message | `text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1` |

Messages in use: "Fetching road hazards...", "Fetching recent community reports...",
"Optimizing photo to lightweight WebP format...".

## ErrorState

| Property | Value |
|---|---|
| Container | `p-6 text-center bg-red-50/60 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/60` |
| Icon container | `w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60` |
| Icon | `AlertTriangle` `w-5 h-5` in `#D64545` / dark `red-400` |
| Title | `text-sm font-semibold` — default "Unable to load reports" |
| Body | `text-xs max-w-xs` — default "We could not retrieve the road hazard reports right now. Check your connection or try again." |
| Retry | Neutral button with `RefreshCw` icon — "Try again" |

Retry is a **secondary** button, not a primary teal button: an error state should offer
recovery without competing with normal navigation.

## EmptyState

| Property | Value |
|---|---|
| Container | `p-8 text-center bg-white dark:bg-[#142533] rounded-lg border border-[#DCE4E8] dark:border-slate-800 shadow-xs` |
| Icon container | `w-12 h-12 rounded-full bg-[#F7F9FA] dark:bg-[#1B3142]` |
| Icon | `AlertCircle` `w-6 h-6` in `#087F8C` / dark `teal-400` |
| Title | `text-base font-semibold` — default "No reports found" |
| Body | `text-sm max-w-sm` |
| Optional action | `px-4 py-2 text-sm font-medium text-white bg-[#087F8C] hover:bg-[#0AA3B3] rounded-md` |

When an `actionLabel` and `onAction` are supplied, the empty state becomes an
**invitation** — "Report a hazard" / "Submit a report". This is the standard conversion
pattern: an empty map should ask for the first contribution rather than simply reporting
absence.

Default copy: "No reports match these filters. Try another filter or report a hazard you
see."

## Inline form error

| Property | Value |
|---|---|
| Container | `p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2` |
| Icon | `AlertCircle` `w-4 h-4 shrink-0 mt-0.5` |
| Text | `text-xs text-[#D64545] dark:text-red-300` |

Used above forms (server errors) and beneath individual fields (field errors).

Messages distinguish auth failures from validation failures, e.g. "You must be signed in
to submit a hazard report. Please sign in and try again." vs "Please correct the
highlighted fields and try submitting again."

## DemoDataBanner

A full-width notice below the header whenever any visible hazard is seeded demo data.

| Property | Value |
|---|---|
| Background | `#F2B544` @ 20% / dark `amber-950/40` |
| Border | `border-b border-[#F2B544]/40 dark:border-amber-800` |
| Text | `text-xs text-[#142B3B] dark:text-amber-200` |
| Layout | `flex items-center justify-between` |

Contents: an `Info` icon in `#855B09` / dark `amber-400`, then
**"Demo data active:"** in bold followed by *"Showing illustrative hazards for
development. These are not real-time road closures."*

A monospace "Demo Mode" chip sits on the right (`hidden sm:inline-block`).

**Design rationale:** this is a trust guarantee. Seeded data must never be mistaken for
live road information, so the disclosure is persistent and unmissable rather than a
one-time toast.

## Success state (report submission)

See [`forms.md`](forms.md). Emerald icon circle, "Report Submitted" heading, and a
gratitude line.

## Loading indicators

| Context | Indicator |
|---|---|
| Button submitting | `Loader2 animate-spin` replacing the label |
| Photo optimizing | `Loader2 animate-spin` + "Processing photo..." |
| Page data fetching | Skeleton cards |
| Live connection | `animate-ping` emerald dot in the map preview header |
| Install prompt available | `animate-pulse` on the Install App button |
| Live incident stream | `Activity` icon with `animate-pulse` in the stream pill |

## NotFound (404)

| Element | Specification |
|---|---|
| Icon | Large `MapPin` or route icon, muted |
| Headline | `text-2xl sm:text-3xl font-extrabold` |
| Body | `text-sm text-[#667784]` explaining the page does not exist |
| Actions | Primary "Explore the map" + secondary link back home |

The 404 keeps the app chrome (header, background, footer context) so a mistyped URL still
feels like part of the product rather than a dead end.

## Role-guarded states

Moderator and admin pages redirect to `/` (or show a notice) when the authenticated user
lacks the required role, driven by `isModerator` / `isAdmin` from `AuthContext`.

This mirrors the server-side permission classes — the frontend guard is a UX convenience,
not the security boundary.

## Design rules for states

1. **Never leave a surface blank.** Every async region has all four states defined.
2. **Errors are recoverable.** Error states offer a retry action wherever a retry is
   meaningful.
3. **Empty states invite action.** Where a next step exists, it is offered.
4. **Loading preserves geometry.** Skeletons match the shape of the real content.
5. **Uncertainty is stated.** Demo and stale data are always disclosed in the surface
   itself.
