# Screen — Report a Hazard (`/report`)

The core contribution flow. Also reachable as a modal from the map, header, and landing
page.

**Components:** `frontend/src/pages/ReportHazardPage.jsx`,
`frontend/src/components/forms/ReportHazardForm.jsx`

---

## Page layout

| Property | Value |
|---|---|
| Page | `bg-[#F7F9FA] dark:bg-[#0B161E] min-h-screen flex flex-col` |
| Header | Standard `AppHeader` |
| Main | `flex-1 flex items-center justify-center p-4 py-12` |
| Card | `w-full max-w-2xl` wrapper around the form |

The card is centred with `my-auto` inside the form so it sits vertically balanced on
desktop.

---

## Form structure

Three zones with the header and footer pinned:

| Zone | Behaviour |
|---|---|
| Header | `sticky top-0 z-20` — logo, title, subtitle, close button |
| Body | `flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 space-y-4` |
| Footer | `sticky bottom-0 z-20 backdrop-blur-xs` — Cancel + Submit, right-aligned |

`overscroll-contain` prevents scroll chaining from the form body to the page behind it,
which otherwise causes accidental navigation on touch devices.

### Header

Logo `size="md"` beside a title block: "Report a Road Hazard"
(`text-base sm:text-lg font-bold truncate`) and the subtitle "Share timely road
conditions to help fellow road users." (`text-[11px] sm:text-xs truncate`).

A close button (`X w-5 h-5`, `aria-label="Close dialog"`) appears only when `onCancel` is
supplied.

---

## Fields

### 1. Hazard category (required)

Label: "Hazard category *" with a red asterisk.

A tile grid (`grid-cols-2 sm:grid-cols-3 gap-2`), each tile `p-2.5 rounded-xl border` with
icon + label on the first row and a `text-[10px] line-clamp-1` description below.

Selection state adds a teal border, `ring-2 ring-[#087F8C]`, a teal-tinted background,
and teal icon/text. Default selection is `flooding`.

Category data comes from `HAZARD_CATEGORIES`, so adding a category automatically adds a
tile.

Error: "Please select a hazard category."

### 2. Location on map (required)

Label: "Location on map *".

`LocationPickerMap` at `h-44 sm:h-52 w-full`. Above the map: a prompt and a teal
"Use current location" link. Below: nothing — the coordinate readout is an overlay inside
the map frame.

Error: "Please tap the map to place the pin."

Initial coordinates default to Lagos `6.4531, 3.3958` and are replaced as soon as the
user interacts.

### 3. Street name or landmark (optional)

Label: "Street name or landmark" with a muted "(optional)" suffix.

Text input, `maxLength={150}`, placeholder *"e.g. Lekki-Epe Expressway by Jakande
Roundabout"*.

Errors render from `errors.location_label` when the server rejects a value.

### 4. Description (required)

Label: "Description *" with a live counter on the right — `{description.length}/1000` in
`text-[10px] font-mono text-[#667784]`.

Textarea, `rows={2}`, `maxLength={1000}`, placeholder *"Describe what you see: depth of
water, which lanes are affected, or dangerous road edges."*

Validation: minimum 5 characters, maximum 1000.

| Error | Message |
|---|---|
| Too short | "Please describe the condition in at least 5 characters." |
| Too long | "Description cannot exceed 1000 characters." |

### 5. Optional photo evidence

Label: "Optional photo evidence" with a muted "(auto-converted to WebP)" suffix. An
emerald `Sparkles` "WebP Optimized" chip appears on the right once conversion completes.

Four states, fully specified in
[`../03-components/forms.md`](../03-components/forms.md#photo-upload-states):

| State | Design |
|---|---|
| Empty | `border-2 border-dashed border-[#DCE4E8] p-4 rounded-xl` with a `Camera` icon, teal "Select or capture a photo" label, and the note "Automatically compressed to WebP • High resolution, low data" |
| Optimizing | Teal-tinted dashed zone with `Loader2 animate-spin` and "Optimizing photo to lightweight WebP format..." |
| Ready | `w-24 h-20` thumbnail (with a circular remove button), filename, a teal `WEBP` chip, size line, and a red "Change photo" link |
| Error | Inline red message beneath |

Hidden file input accepts `image/jpeg`, `image/png`, `image/webp`, `image/heic`,
`image/*`.

---

## Footer actions

Right-aligned (`flex items-center justify-end gap-3`).

| Button | Specification |
|---|---|
| Cancel | `px-4 py-2 text-xs font-medium` with a border; hidden when `onCancel` is absent |
| Submit | `px-5 py-2 text-xs font-semibold text-white bg-[#087F8C] hover:bg-[#0AA3B3] rounded-lg shadow-sm` |

Submit states:

| Condition | Label |
|---|---|
| Idle | "Submit report" |
| `submitting` | Spinner + "Submitting report..." |
| `optimizingPhoto` | Spinner + "Processing photo..." |
| Either | `disabled:opacity-50` |

---

## Error handling

**Server-level alert** renders above the fields:

`p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs
text-[#D64545] dark:text-red-300 rounded-lg flex items-center gap-2` with `AlertCircle`.

| Condition | Message |
|---|---|
| 401 / 403 | "You must be signed in to submit a hazard report. Please sign in and try again." |
| Validation response | "Please correct the highlighted fields and try submitting again." + per-field errors from the API |
| Network failure | "We could not save the report right now. Check your internet connection and try again." |

Field-level errors clear automatically as the user corrects the field.

---

## Success state

Replaces the form entirely:

```
w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60
  └── CheckCircle w-8 h-8 text-[#27865B] dark:text-emerald-300

text-xl font-bold  — "Report Submitted"
text-xs sm:text-sm text-[#667784] dark:text-slate-300 max-w-sm mx-auto
  — "Thank you for helping road users know what lies ahead.
     Your report is now live for the community."
```

The success callback fires after **1200ms**, so the confirmation is seen before the view
changes.

---

## Modal vs page

The same component serves both, selected by `isModal`.

| Aspect | Page (`/report`) | Modal |
|---|---|---|
| Card style | `rounded-2xl border shadow-sm` | `h-full max-h-full`, parent supplies radius and shadow |
| Cancel button | Hidden | Shown |
| Close (X) button | Hidden | Shown |
| Viewport | Scrolls with the page | `max-h-[92vh]` on mobile, `88vh` on desktop |
| Presentation | Centred card | Bottom sheet on mobile, centred dialog on desktop |
| On success | Navigate away | Insert into the map and select |

Maintaining one implementation guarantees the mobile page and the desktop modal can never
diverge — a common failure mode when forms are built twice.

---

## Related documentation

- [`../03-components/forms.md`](../03-components/forms.md) — full form specification
- [`../05-user-flows/report-a-hazard.md`](../05-user-flows/report-a-hazard.md) — the flow through this screen
