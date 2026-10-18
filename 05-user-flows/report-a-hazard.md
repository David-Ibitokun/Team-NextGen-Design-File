# Flow — Report a Hazard

The platform's core value loop. If one flow is designed well, the product works.

**Entry points:** landing hero/CTA, landing category tiles, header "Report a Hazard"
button, map sidebar empty state, map floating card, mobile bottom nav centre action,
dashboard.

---

## Happy path

```
  ┌──────────────┐
  │  Trigger CTA │
  └──────┬───────┘
         │
         ▼
  ┌────────────────────┐   not signed in   ┌──────────────────┐
  │ Authenticated?     │──────────────────▶│ /login?next=     │
  └──────┬─────────────┘                   │   /report        │
         │ yes                             └────────┬─────────┘
         ▼                                           │ sign in
  ┌────────────────────┐                             │
  │ Report form opens  │◀────────────────────────────┘
  └──────┬─────────────┘
         │
         ▼
  ┌────────────────────┐
  │ 1. Choose category │  required, defaults to Flooding
  └──────┬─────────────┘
         ▼
  ┌────────────────────┐
  │ 2. Place map pin   │  required — tap map, or use current location
  └──────┬─────────────┘
         ▼
  ┌────────────────────┐
  │ 3. Add landmark    │  optional, ≤150 chars
  └──────┬─────────────┘
         ▼
  ┌────────────────────┐
  │ 4. Describe        │  required, 5–1000 chars, live counter
  └──────┬─────────────┘
         ▼
  ┌────────────────────┐
  │ 5. Attach photo    │  optional — auto-converted to WebP
  └──────┬─────────────┘
         ▼
  ┌────────────────────┐
  │   Validate        │  client, then server
  └──────┬─────────────┘
         │ valid
         ▼
  ┌────────────────────┐
  │  "Report Submitted"│  1200ms success state
  └──────┬─────────────┘
         │
         ▼
  ┌────────────────────┐
  │ Hazard prepended   │  map flies to it, details panel opens
  │ & auto-selected    │
  └────────────────────┘
```

---

## Step detail

### Entry

The report flow opens in one of two presentations, both using the same component:

| Host | Presentation |
|---|---|
| Map screen | Modal (`ReportHazardModal`) — bottom sheet on mobile, centred dialog on desktop |
| `/report` route | Centred `max-w-2xl` card |

Signed-out users are routed to `/login?next=/report` so they resume exactly where they
were headed.

### Step 1 — Category

A `grid-cols-2 sm:grid-cols-3` tile grid of five categories. `flooding` is selected by
default to minimise friction on the most common report.

Selection is expressed three ways at once — teal border, teal ring, teal-tinted
background, plus teal icon — so it does not depend on colour perception alone.

### Step 2 — Map pin

The primary design decision in this flow. There is no separate address field, because a
road hazard is fundamentally geographic and a free-text address is ambiguous for a
pinpoint hazard like a pothole.

Three placement methods:

| Method | Behaviour |
|---|---|
| Tap the map | Pin drops and the map pans to centre on it |
| Use current location | `navigator.geolocation` with `enableHighAccuracy: true`, 10s timeout |
| Manual fallback | Coordinate readout shows exactly what was captured |

Coordinates are displayed to 6 decimal places in `font-mono` so the user can verify the
pin's precision — on a road segment, 6 decimals is roughly 10cm.

**Failure is graceful.** If geolocation is unsupported or times out, an amber notice
appears and the user simply taps the map instead. The flow never blocks on permissions.

### Step 3 — Landmark

Optional free text, e.g. *"Lekki-Epe Expressway by Jakande Roundabout"*. This is what
makes a report findable by other people who do not know the coordinates.

When omitted, `HazardCard` falls back to formatted coordinates, so the list is never
unidentifiable.

### Step 4 — Description

Required, 5–1000 characters, with a live monospace counter. The placeholder guides
specificity: *"Describe what you see: depth of water, which lanes are affected, or
dangerous road edges."*

This nudges users toward objective, useful descriptions instead of speculation.

### Step 5 — Photo

Optional, and the flow is designed so it can be skipped entirely. Contributors are
frequently on mobile data and may be passengers or pedestrians, so a photo is never
required.

Photos are converted to WebP in the browser (max 1600px, quality 0.82) before upload, and
the saving is shown explicitly — *"1.2 MB → 240 KB, -80%"* — turning a hidden technical
step into an understood benefit.

### Validation

Client-side first (fast, no network), then server-side for anything missed.

| Field | Rule |
|---|---|
| Category | Must be set |
| Description | 5–1000 characters |
| Coordinates | Must be non-zero |

Field errors clear as soon as the field becomes valid.

### Success

The form is replaced by an emerald check, "Report Submitted", and *"Thank you for helping
road users know what lies ahead. Your report is now live for the community."*

The callback fires after **1200ms**. On the map screen, the new hazard is **prepended** to
the list and immediately selected — the map flies to it at zoom ≥14 and the detail panel
slides open. The user sees their own contribution in place without any navigation.

This immediate visual confirmation is the flow's most important reward moment.

---

## Error paths

| Condition | Response |
|---|---|
| Signed out (401/403) | "You must be signed in to submit a hazard report. Please sign in and try again." |
| Server validation | Red alert plus per-field messages beneath each input |
| Network failure | "We could not save the report right now. Check your internet connection and try again." |
| Photo conversion failure | Falls back to the original file, upload continues |
| Geolocation denied | Amber notice, manual placement remains available |
| Coordinates unset | Inline error beneath the map picker |

No error clears the user's work. Fields retain their values so a correction does not mean
re-entering a description.

---

## After submission — the contribution loop

A submitted report starts as `reported`. From there the community sustains it:

```
  reported ──confirmations ≥ threshold──▶ community_confirmed
      │                                        │
      │ flagged by a user                     │ moderator action
      ▼                                        ▼
  moderation queue ──▶ resolved | rejected | confirmed | under_review
```

Each subsequent step is itself a designed flow:

| Flow | Entry |
|---|---|
| [Confirm a hazard](confirm-a-hazard.md) | Detail panel |
| [Flag a report](flag-a-report.md) | Detail panel |
| [Moderation](moderation.md) | `/moderator` |

This loop is what makes RouteX self-sustaining: each contribution invites confirmation and
flagging, which maintain accuracy without requiring official road inspections.
