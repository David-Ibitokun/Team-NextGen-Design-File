# Components — Forms

## Report hazard form

The core contribution flow. Used both as a modal and as a full page (`/report`), driven
by the `isModal` prop.

| Property | Value |
|---|---|
| Surface | white / dark `#142533` |
| Page mode | `rounded-2xl border border-[#DCE4E8] dark:border-slate-800 shadow-sm` |
| Modal mode | `h-full max-h-full` (parent supplies the radius and shadow) |
| Body | `flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 space-y-4` |

### Three-zone structure

1. **Sticky header** (`z-20`, `px-4 py-3 sm:px-6 sm:py-4`) — logo, title
   *"Report a Road Hazard"*, subtitle, close button. Always visible.
2. **Scrollable body** — the five field groups.
3. **Sticky footer** (`z-20`, `backdrop-blur-xs`, right-aligned) — Cancel + Submit.

Pinning the header and footer means the submit action is reachable on a phone without
scrolling past the map picker, which matters because this form is completed outdoors.

### Field groups (in order)

| # | Field | Control | Required |
|---|---|---|---|
| 1 | Hazard category | 2/3-column tile grid | Yes |
| 2 | Location on map | `LocationPickerMap`, `h-44 sm:h-52` | Yes |
| 3 | Street name or landmark | Text input, `maxLength={150}` | No |
| 4 | Description | Textarea, `rows={2}`, `maxLength={1000}`, live counter | Yes |
| 5 | Optional photo evidence | File input + WebP preview | No |

### Validation

| Rule | Message |
|---|---|
| Category must be set | "Please select a hazard category." |
| Description ≥ 5 characters | "Please describe the condition in at least 5 characters." |
| Description ≤ 1000 characters | "Description cannot exceed 1000 characters." |
| Coordinates must be set | "Please tap the map to place the hazard pin." |

Errors appear directly beneath the field in `text-xs text-[#D64545]` and clear as soon
as the field becomes valid. A server error renders as a red alert above the form.

### Character counter

`{description.length}/1000` in `text-[10px] font-mono`, right-aligned in the label row.
Monospace prevents the counter from jittering as digits change width.

### Photo upload states

Four distinct states, which is what makes the compression step feel trustworthy rather
than mysterious:

| State | Presentation |
|---|---|
| Empty | Dashed `border-2 border-dashed` drop zone, `Camera` icon, "Select or capture a photo", note "Automatically compressed to WebP • High resolution, low data" |
| Optimizing | Teal-tinted dashed zone with spinning `Loader2` — "Optimizing photo to lightweight WebP format..." |
| Ready | `w-24 h-20` preview thumbnail with remove button, filename, `WEBP` chip, size line showing compressed vs original size and `-N%` in emerald, "Change photo" link |
| Error | Inline `text-xs text-[#D64545]` |

### Photo compression

Photos are converted client-side to WebP before upload:

| Parameter | Value |
|---|---|
| Max dimension | 1600 × 1600 px |
| Quality | 0.82 |
| Accepted input | `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/*` |

A `WEBP` badge and an emerald `Sparkles` "WebP Optimized" label appear once conversion
completes, and the savings figure is shown as `(was 1.2 MB, -68%)`. Falls back to the
original file if conversion fails.

**Design rationale:** contributors are often on mobile data in the field. Making the
compression visible turns a hidden technical step into a benefit the user understands.

### Submit button states

| State | Content |
|---|---|
| Idle | "Submit report" |
| Submitting | Spinner + "Submitting report..." |
| Optimizing photo | Spinner + "Processing photo..." |

Both loading states disable the button (`disabled:opacity-50`) and the submit is also
blocked while a photo is mid-conversion.

### Success state

Replaces the entire form:

| Property | Value |
|---|---|
| Container | `w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60` with `CheckCircle` at `w-8 h-8` in `#27865B` / dark `emerald-300` |
| Title | `text-xl font-bold` — "Report Submitted" |
| Body | `text-xs sm:text-sm` — "Thank you for helping road users know what lies ahead. Your report is now live for the community." |

The success callback fires after a **1200ms** delay so the state is perceived before the
modal closes or the map updates.

### Location picker map

A dedicated map for choosing the report coordinates.

| Property | Value |
|---|---|
| Height | `h-44 sm:h-52` inside the form |
| Border | `rounded-lg border border-[#DCE4E8] dark:border-slate-700` |
| Interaction | Tap to place the pin; scroll wheel zoom disabled to avoid hijacking page scroll |
| Default centre | Lagos `6.5244, 3.3792` at zoom 13 |

### Coordinate readout bar

An overlay pinned to the bottom of the picker:

`absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1.5 rounded text-[11px] flex items-center justify-between shadow-xs`

Shows a teal `MapPin` icon and the coordinate in `font-mono` to **6 decimal places**, or
the prompt "No location selected yet. Tap the map." when unset.

### Use-current-location link

Above the picker: `text-xs text-[#667784]` prompt on the left, and a teal text button
with a `Navigation` icon on the right.

| State | Copy |
|---|---|
| Idle | "Use current location" |
| Locating | "Locating..." (disabled) |
| Unsupported | "Geolocation is not supported by your browser. Please tap the map to place the pin." |
| Failed | Amber warning: "We couldn't get your location. Move the map pin or enter the location manually." |

Geolocation requests `enableHighAccuracy: true` with a **10s timeout**. Failure degrades
gracefully to manual placement rather than blocking the user.

### Picker marker

A teardrop pin, visually distinct from hazard markers so a user cannot confuse their own
draft pin with a reported hazard:

```
background: #087F8C
border: 3px solid #FFFFFF
border-radius: 50% 50% 50% 0
transform: rotate(-45deg)
inner dot: 10px white circle, rotated back to 45deg
size: 32 × 32, iconAnchor [16, 32] (anchored at the tip)
```

## Report modal

Wraps the report form as a dialog.

| Property | Value |
|---|---|
| Backdrop | `fixed inset-0 z-[2000] bg-black/65 dark:bg-black/80 backdrop-blur-xs` |
| Alignment | `items-end sm:items-center` — bottom sheet on mobile, centred dialog on desktop |
| Panel | `w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden` |
| Animation | `fade-in duration-150` |
| A11y | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="report-hazard-title"` |

### Behaviour

- **Escape** closes the dialog (keydown listener active only while open).
- **Backdrop click** closes it, but only when the click target is the backdrop itself, so
  clicks inside the form do not dismiss it.
- **Body scroll is locked** while open; the original `overflow` value is restored on close.

Presenting as a bottom sheet on mobile keeps the form thumb-reachable and preserves the
map context behind it.

## Login form

| Field | Type | Placeholder | Notes |
|---|---|---|---|
| Username or Email | `text` | "e.g. adetola or user@example.com" | `autoComplete="username"`, `required` |
| Password | `password` | — | Eye toggle (`Eye` / `EyeOff`), `required` |

**Error handling:** client-side check for empty fields, then API `detail`, then a generic
fallback — "Unable to sign in. Please verify your credentials and connection."

**Redirect:** honours a `?next=` query parameter, defaulting to `/map`, so a deep link
into a gated flow (e.g. `/report`) resumes correctly after sign-in.

## Other auth forms

**Register** — username, email, password, confirm password. Email receives format
validation feedback on blur.

**Forgot password** — a single email input with a submit action, followed by a neutral
confirmation state that does not reveal whether the address exists.

**Reset password** — new password and confirm password, with a strength/safety hint.

All four share the same auth card shell, error alert treatment (`bg-red-50 dark:bg-red-950/50
border border-red-200 dark:border-red-800`), and submit loading state (spinner replacing
the label).

## Admin role-change form

Used in the role promotion modal.

| Element | Specification |
|---|---|
| Target user | Read-only summary |
| Target role | Select with options citizen / moderator / admin |
| Reason | Textarea, **mandatory** |
| Error | `roleModalError` rendered in `text-[#D64545]` |

**Design rationale:** mirroring the mandatory-rationale pattern from moderation keeps the
platform's audit culture consistent across every privileged action.

## Inline profile editor (dashboard settings tab)

Compact display-name and email fields with a `Save` button. On success an inline
confirmation replaces the form. Matches the citizen-facing field styling rather than the
admin styling, because this is a self-service action.
